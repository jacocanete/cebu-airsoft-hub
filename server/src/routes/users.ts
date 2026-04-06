import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  requireAuth,
  requireRole,
  isAdmin,
  isMod,
  type AuthRequest,
} from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/users?q= — search users
// ---------------------------------------------------------------------------

router.get("/", async (req, res) => {
  const { q } = req.query as Record<string, string | undefined>;

  if (!q?.trim()) {
    res.json([]);
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" as const } },
        { name: { contains: q, mode: "insensitive" as const } },
        { bio: { contains: q, mode: "insensitive" as const } },
      ],
    },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      _count: { select: { posts: true, listings: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(users);
});

// ---------------------------------------------------------------------------
// GET /api/users/:username — profile
// ---------------------------------------------------------------------------

router.get("/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username as string },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      coverPhoto: true,
      gearList: true,
      playStyle: true,
      role: true,
      createdAt: true,
      memberships: {
        include: { group: { select: { name: true, slug: true } } },
        take: 1,
        orderBy: { joinedAt: "asc" },
      },
      _count: {
        select: { posts: true, listings: true, rsvps: true },
      },
      // Current active ban (if any) — visible publicly so profiles show ban status
      bans: {
        where: {
          liftedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { reason: true, expiresAt: true, createdAt: true },
        take: 1,
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

// ---------------------------------------------------------------------------
// GET /api/users/:username/posts
// ---------------------------------------------------------------------------

router.get("/:username/posts", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username as string },
    select: { id: true },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    select: {
      id: true,
      title: true,
      category: true,
      tags: true,
      createdAt: true,
      _count: { select: { comments: true, votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.json(posts);
});

// ---------------------------------------------------------------------------
// PATCH /api/users/me — update own profile
// ---------------------------------------------------------------------------

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  playStyle: z.string().max(100).optional(),
  gearList: z.string().max(1000).optional(),
  avatar: z.string().url().nullable().optional(),
  coverPhoto: z.string().url().nullable().optional(),
});

router.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Only include fields that were explicitly provided
  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined),
  );

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      coverPhoto: true,
      gearList: true,
      playStyle: true,
    },
  });

  res.json(user);
});

// ---------------------------------------------------------------------------
// GET /api/users/:username/media — public uploads for profile media tab
// ---------------------------------------------------------------------------

router.get("/:username/media", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username as string },
    select: { id: true },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // prisma.upload is available at runtime; cast needed due to LSP custom-output quirk
  const uploads = await (prisma as any).upload.findMany({
    where: { uploaderId: user.id },
    select: {
      id: true,
      url: true,
      thumbUrl: true,
      width: true,
      height: true,
      context: true,
      mimeType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(uploads);
});

// ---------------------------------------------------------------------------
// POST /api/users/:username/ban — issue a ban
// Mods can ban up to 30 days; only admins can ban permanently
// ---------------------------------------------------------------------------

const banSchema = z.object({
  reason: z.string().min(1).max(500),
  durationDays: z.number().int().positive().max(365).optional(),
});

router.post(
  "/:username/ban",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = banSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { reason, durationDays } = parsed.data;
    const isPermanent = !durationDays;

    // Only admins can issue permanent bans
    if (isPermanent && !isAdmin(req.user)) {
      res.status(403).json({ error: "Only admins can issue permanent bans" });
      return;
    }

    // Mods capped at 30 days
    if (durationDays && durationDays > 30 && !isAdmin(req.user)) {
      res.status(403).json({ error: "Moderators can ban for at most 30 days" });
      return;
    }

    const target = await prisma.user.findUnique({
      where: { username: req.params.username as string },
      select: { id: true, role: true },
    });

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Mods cannot ban other mods or admins
    const targetIsMod = target.role === "MODERATOR" || target.role === "ADMIN";
    if (targetIsMod && !isAdmin(req.user)) {
      res.status(403).json({ error: "Moderators cannot ban other moderators" });
      return;
    }

    // Cannot ban yourself
    if (target.id === req.user!.id) {
      res.status(400).json({ error: "Cannot ban yourself" });
      return;
    }

    // Lift any existing active ban first
    await prisma.ban.updateMany({
      where: {
        userId: target.id,
        liftedAt: null,
      },
      data: { liftedAt: new Date(), liftedById: req.user!.id },
    });

    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 86_400_000)
      : null;

    const ban = await prisma.ban.create({
      data: {
        userId: target.id,
        bannedById: req.user!.id,
        reason,
        expiresAt,
      },
      select: { id: true, expiresAt: true },
    });

    await logAudit({
      actorId: req.user!.id,
      action: "USER_BANNED",
      targetType: "USER",
      targetId: target.id,
      reason,
      metadata: { banId: ban.id, durationDays: durationDays ?? null },
    });

    res.status(201).json(ban);
  },
);

// ---------------------------------------------------------------------------
// POST /api/users/:username/unban — lift an active ban
// ---------------------------------------------------------------------------

router.post(
  "/:username/unban",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const target = await prisma.user.findUnique({
      where: { username: req.params.username as string },
      select: { id: true },
    });

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updated = await prisma.ban.updateMany({
      where: {
        userId: target.id,
        liftedAt: null,
      },
      data: { liftedAt: new Date(), liftedById: req.user!.id },
    });

    if (updated.count === 0) {
      res.status(409).json({ error: "User is not currently banned" });
      return;
    }

    await logAudit({
      actorId: req.user!.id,
      action: "USER_UNBANNED",
      targetType: "USER",
      targetId: target.id,
    });

    res.status(204).end();
  },
);

// ---------------------------------------------------------------------------
// PATCH /api/users/:username/role — change role (admin only)
// ---------------------------------------------------------------------------

const roleSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

router.patch(
  "/:username/role",
  requireAuth,
  requireRole("ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const target = await prisma.user.findUnique({
      where: { username: req.params.username as string },
      select: { id: true, role: true },
    });

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (target.id === req.user!.id) {
      res.status(400).json({ error: "Cannot change your own role" });
      return;
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { role: parsed.data.role },
    });

    await logAudit({
      actorId: req.user!.id,
      action: "USER_ROLE_CHANGED",
      targetType: "USER",
      targetId: target.id,
      metadata: { from: target.role, to: parsed.data.role },
    });

    res.status(204).end();
  },
);

// ---------------------------------------------------------------------------
// GET /api/users/:username/notes — mod notes (mod only)
// ---------------------------------------------------------------------------

router.get(
  "/:username/notes",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req, res) => {
    const target = await prisma.user.findUnique({
      where: { username: req.params.username as string },
      select: { id: true },
    });

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const notes = await prisma.modNote.findMany({
      where: { userId: target.id },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(notes);
  },
);

// ---------------------------------------------------------------------------
// POST /api/users/:username/notes — add a mod note
// ---------------------------------------------------------------------------

const noteSchema = z.object({
  content: z.string().min(1).max(2000),
});

router.post(
  "/:username/notes",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const target = await prisma.user.findUnique({
      where: { username: req.params.username as string },
      select: { id: true },
    });

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const note = await prisma.modNote.create({
      data: {
        userId: target.id,
        authorId: req.user!.id,
        content: parsed.data.content,
      },
      select: { id: true, createdAt: true },
    });

    res.status(201).json(note);
  },
);

export default router;
