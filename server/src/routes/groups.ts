import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, optionalAuth, type AuthRequest } from "../middleware/auth.js";
import { notify } from "../lib/notify.js";
import {
  getGroupRole,
  isGroupStaffRole,
  type GroupRole,
} from "../lib/groups.js";

const router = Router();

router.get("/", async (req, res) => {
  const { q } = req.query as Record<string, string | undefined>;

  const groups = await prisma.group.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(groups);
});

// Current viewer's pending group invites. Registered before `/:slug` so Express
// matches the more specific path first.
router.get("/invites/mine", requireAuth, async (req: AuthRequest, res) => {
  const invites = await prisma.groupInvite.findMany({
    where: { invitedId: req.user!.id, status: "PENDING" },
    include: {
      group: {
        select: { id: true, name: true, slug: true, logo: true, description: true },
      },
      invitedBy: { select: { id: true, username: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(invites);
});

router.post(
  "/invites/:id/accept",
  requireAuth,
  async (req: AuthRequest, res) => {
    const invite = await prisma.groupInvite.findUnique({
      where: { id: req.params.id as string },
      include: { group: { select: { id: true, name: true, slug: true } } },
    });

    if (!invite || invite.invitedId !== req.user!.id) {
      res.status(404).json({ error: "Invite not found" });
      return;
    }
    if (invite.status !== "PENDING") {
      res.status(409).json({ error: "Invite no longer pending" });
      return;
    }

    const [updated] = await prisma.$transaction([
      prisma.groupInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      }),
      prisma.groupMembership.upsert({
        where: {
          userId_groupId: { userId: req.user!.id, groupId: invite.groupId },
        },
        create: { userId: req.user!.id, groupId: invite.groupId, role: "MEMBER" },
        update: {},
      }),
      prisma.groupJoinRequest.deleteMany({
        where: { userId: req.user!.id, groupId: invite.groupId },
      }),
    ]);

    const io = req.app.get("io");
    await notify({
      io,
      userId: invite.invitedById,
      type: "group_invite_accepted",
      message: `${req.user!.name} accepted your invite to ${invite.group.name}`,
      relatedId: invite.group.slug,
    });

    res.json(updated);
  },
);

router.post(
  "/invites/:id/decline",
  requireAuth,
  async (req: AuthRequest, res) => {
    const invite = await prisma.groupInvite.findUnique({
      where: { id: req.params.id as string },
      include: { group: { select: { id: true, name: true, slug: true } } },
    });

    if (!invite || invite.invitedId !== req.user!.id) {
      res.status(404).json({ error: "Invite not found" });
      return;
    }
    if (invite.status !== "PENDING") {
      res.status(409).json({ error: "Invite no longer pending" });
      return;
    }

    const updated = await prisma.groupInvite.update({
      where: { id: invite.id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });

    const io = req.app.get("io");
    await notify({
      io,
      userId: invite.invitedById,
      type: "group_invite_declined",
      message: `${req.user!.name} declined your invite to ${invite.group.name}`,
      relatedId: invite.group.slug,
    });

    res.json(updated);
  },
);

router.get("/:slug", optionalAuth, async (req: AuthRequest, res) => {
  const viewerId = req.user?.id;

  const group = await prisma.group.findUnique({
    where: { slug: req.params.slug as string },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
        orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
      },
    },
  });

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  let viewerMembership: { role: GroupRole } | null = null;
  let viewerJoinRequest:
    | { id: string; status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: Date }
    | null = null;
  let viewerInvite:
    | { id: string; status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED"; createdAt: Date }
    | null = null;
  let pendingJoinRequestCount: number | null = null;

  if (viewerId) {
    const [m, jr, inv] = await Promise.all([
      prisma.groupMembership.findUnique({
        where: { userId_groupId: { userId: viewerId, groupId: group.id } },
        select: { role: true },
      }),
      prisma.groupJoinRequest.findUnique({
        where: { userId_groupId: { userId: viewerId, groupId: group.id } },
        select: { id: true, status: true, createdAt: true },
      }),
      prisma.groupInvite.findUnique({
        where: { groupId_invitedId: { groupId: group.id, invitedId: viewerId } },
        select: { id: true, status: true, createdAt: true },
      }),
    ]);
    viewerMembership = m;
    viewerJoinRequest = jr;
    viewerInvite = inv;

    if (isGroupStaffRole(m?.role ?? null)) {
      pendingJoinRequestCount = await prisma.groupJoinRequest.count({
        where: { groupId: group.id, status: "PENDING" },
      });
    }
  }

  res.json({
    ...group,
    viewerMembership,
    viewerJoinRequest,
    viewerInvite,
    pendingJoinRequestCount,
  });
});

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  joinPolicy: z.enum(["REQUEST", "INVITE_ONLY"]).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.group.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (existing) {
    res.status(409).json({ error: "Slug already taken" });
    return;
  }

  const group = await prisma.group.create({
    data: {
      ...parsed.data,
      members: {
        create: { userId: req.user!.id, role: "OWNER" },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  res.status(201).json(group);
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).nullable().optional(),
  logo: z.string().url().nullable().optional(),
  banner: z.string().url().nullable().optional(),
  joinPolicy: z.enum(["REQUEST", "INVITE_ONLY"]).optional(),
});

router.patch("/:slug", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const group = await prisma.group.findUnique({
    where: { slug: req.params.slug as string },
    select: { id: true },
  });
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const role = await getGroupRole(req.user!.id, group.id);
  if (!isGroupStaffRole(role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updated = await prisma.group.update({
    where: { id: group.id },
    data: parsed.data,
  });
  res.json(updated);
});

const joinRequestSchema = z.object({
  message: z.string().max(280).optional(),
});

router.post(
  "/:slug/join-requests",
  requireAuth,
  async (req: AuthRequest, res) => {
    const parsed = joinRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true, name: true, joinPolicy: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    if (group.joinPolicy === "INVITE_ONLY") {
      res.status(403).json({ error: "This group is invite-only" });
      return;
    }

    const existingMembership = await prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: req.user!.id, groupId: group.id } },
      select: { userId: true },
    });
    if (existingMembership) {
      res.status(409).json({ error: "Already a member" });
      return;
    }

    const request = await prisma.groupJoinRequest.upsert({
      where: { userId_groupId: { userId: req.user!.id, groupId: group.id } },
      create: {
        userId: req.user!.id,
        groupId: group.id,
        message: parsed.data.message,
        status: "PENDING",
      },
      update: {
        message: parsed.data.message,
        status: "PENDING",
        decidedAt: null,
        decidedById: null,
      },
      select: { id: true, status: true, createdAt: true, message: true },
    });

    const staff = await prisma.groupMembership.findMany({
      where: { groupId: group.id, role: { in: ["OWNER", "ADMIN"] } },
      select: { userId: true },
    });
    const io = req.app.get("io");
    await Promise.all(
      staff.map((s) =>
        notify({
          io,
          userId: s.userId,
          type: "group_join_request",
          message: `${req.user!.name} wants to join ${group.name}`,
          relatedId: req.params.slug as string,
        }),
      ),
    );

    res.status(201).json(request);
  },
);

router.get(
  "/:slug/join-requests",
  requireAuth,
  async (req: AuthRequest, res) => {
    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const role = await getGroupRole(req.user!.id, group.id);
    if (!isGroupStaffRole(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const requests = await prisma.groupJoinRequest.findMany({
      where: { groupId: group.id, status: "PENDING" },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true, bio: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  },
);

const respondRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

router.patch(
  "/:slug/join-requests/:requestId",
  requireAuth,
  async (req: AuthRequest, res) => {
    const parsed = respondRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true, name: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const role = await getGroupRole(req.user!.id, group.id);
    if (!isGroupStaffRole(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const request = await prisma.groupJoinRequest.findUnique({
      where: { id: req.params.requestId as string },
      select: { id: true, userId: true, groupId: true, status: true },
    });
    if (!request || request.groupId !== group.id) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    if (request.status !== "PENDING") {
      res.status(409).json({ error: "Request already decided" });
      return;
    }

    const nextStatus = parsed.data.action === "approve" ? "APPROVED" : "REJECTED";
    const now = new Date();

    if (parsed.data.action === "approve") {
      await prisma.$transaction([
        prisma.groupJoinRequest.update({
          where: { id: request.id },
          data: {
            status: nextStatus,
            decidedAt: now,
            decidedById: req.user!.id,
          },
        }),
        prisma.groupMembership.upsert({
          where: {
            userId_groupId: { userId: request.userId, groupId: group.id },
          },
          create: { userId: request.userId, groupId: group.id, role: "MEMBER" },
          update: {},
        }),
      ]);
    } else {
      await prisma.groupJoinRequest.update({
        where: { id: request.id },
        data: { status: nextStatus, decidedAt: now, decidedById: req.user!.id },
      });
    }

    const io = req.app.get("io");
    await notify({
      io,
      userId: request.userId,
      type:
        parsed.data.action === "approve"
          ? "group_join_approved"
          : "group_join_rejected",
      message:
        parsed.data.action === "approve"
          ? `You're in — welcome to ${group.name}`
          : `Your request to join ${group.name} was declined`,
      relatedId: req.params.slug as string,
    });

    res.json({ ok: true });
  },
);

const sendInviteSchema = z.object({
  invitedId: z.string().min(1),
});

router.post(
  "/:slug/invites",
  requireAuth,
  async (req: AuthRequest, res) => {
    const parsed = sendInviteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true, name: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const role = await getGroupRole(req.user!.id, group.id);
    if (!isGroupStaffRole(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (parsed.data.invitedId === req.user!.id) {
      res.status(400).json({ error: "You're already in the group" });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: parsed.data.invitedId },
      select: { id: true, name: true },
    });
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const existingMembership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: { userId: targetUser.id, groupId: group.id },
      },
      select: { userId: true },
    });
    if (existingMembership) {
      res.status(409).json({ error: "User is already a member" });
      return;
    }

    // Upsert — if there was a prior declined/cancelled invite, overwrite it
    // with a fresh PENDING row.
    const invite = await prisma.groupInvite.upsert({
      where: {
        groupId_invitedId: { groupId: group.id, invitedId: targetUser.id },
      },
      create: {
        groupId: group.id,
        invitedId: targetUser.id,
        invitedById: req.user!.id,
        status: "PENDING",
      },
      update: {
        invitedById: req.user!.id,
        status: "PENDING",
        respondedAt: null,
        createdAt: new Date(),
      },
    });

    const io = req.app.get("io");
    await notify({
      io,
      userId: targetUser.id,
      type: "group_invite_received",
      message: `${req.user!.name} invited you to ${group.name}`,
      relatedId: req.params.slug as string,
    });

    res.status(201).json(invite);
  },
);

router.get(
  "/:slug/invites",
  requireAuth,
  async (req: AuthRequest, res) => {
    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const role = await getGroupRole(req.user!.id, group.id);
    if (!isGroupStaffRole(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const invites = await prisma.groupInvite.findMany({
      where: { groupId: group.id, status: "PENDING" },
      include: {
        invited: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        invitedBy: {
          select: { id: true, username: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(invites);
  },
);

router.delete(
  "/:slug/invites/:inviteId",
  requireAuth,
  async (req: AuthRequest, res) => {
    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const role = await getGroupRole(req.user!.id, group.id);
    if (!isGroupStaffRole(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const invite = await prisma.groupInvite.findUnique({
      where: { id: req.params.inviteId as string },
      select: { id: true, groupId: true, status: true },
    });
    if (!invite || invite.groupId !== group.id) {
      res.status(404).json({ error: "Invite not found" });
      return;
    }
    if (invite.status !== "PENDING") {
      res.status(409).json({ error: "Invite already resolved" });
      return;
    }

    await prisma.groupInvite.update({
      where: { id: invite.id },
      data: { status: "CANCELLED", respondedAt: new Date() },
    });

    res.status(204).end();
  },
);

router.delete(
  "/:slug/membership",
  requireAuth,
  async (req: AuthRequest, res) => {
    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const membership = await prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: req.user!.id, groupId: group.id } },
      select: { role: true },
    });
    if (!membership) {
      res.status(404).json({ error: "Not a member" });
      return;
    }
    if (membership.role === "OWNER") {
      res
        .status(400)
        .json({ error: "Owners must transfer ownership before leaving" });
      return;
    }

    await prisma.groupMembership.delete({
      where: { userId_groupId: { userId: req.user!.id, groupId: group.id } },
    });

    res.status(204).end();
  },
);

const changeRoleSchema = z.object({
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]),
});

router.patch(
  "/:slug/members/:userId",
  requireAuth,
  async (req: AuthRequest, res) => {
    const parsed = changeRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const actorRole = await getGroupRole(req.user!.id, group.id);
    if (actorRole !== "OWNER") {
      res.status(403).json({ error: "Only the owner can change roles" });
      return;
    }

    const targetUserId = req.params.userId as string;
    const target = await prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: targetUserId, groupId: group.id } },
      select: { role: true },
    });
    if (!target) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    if (parsed.data.role === "OWNER") {
      // Ownership transfer — demote current owner to ADMIN and promote target.
      await prisma.$transaction([
        prisma.groupMembership.update({
          where: {
            userId_groupId: { userId: req.user!.id, groupId: group.id },
          },
          data: { role: "ADMIN" },
        }),
        prisma.groupMembership.update({
          where: { userId_groupId: { userId: targetUserId, groupId: group.id } },
          data: { role: "OWNER" },
        }),
      ]);
    } else {
      await prisma.groupMembership.update({
        where: { userId_groupId: { userId: targetUserId, groupId: group.id } },
        data: { role: parsed.data.role },
      });
    }

    res.json({ ok: true });
  },
);

router.delete(
  "/:slug/members/:userId",
  requireAuth,
  async (req: AuthRequest, res) => {
    const group = await prisma.group.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const actorRole = await getGroupRole(req.user!.id, group.id);
    if (!isGroupStaffRole(actorRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const targetUserId = req.params.userId as string;
    const target = await prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: targetUserId, groupId: group.id } },
      select: { role: true },
    });
    if (!target) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    if (target.role === "OWNER") {
      res.status(400).json({ error: "Cannot remove the owner" });
      return;
    }
    // Admins can't kick other admins — only the owner can.
    if (target.role === "ADMIN" && actorRole !== "OWNER") {
      res.status(403).json({ error: "Only the owner can remove admins" });
      return;
    }

    await prisma.groupMembership.delete({
      where: { userId_groupId: { userId: targetUserId, groupId: group.id } },
    });

    res.status(204).end();
  },
);

export default router;
