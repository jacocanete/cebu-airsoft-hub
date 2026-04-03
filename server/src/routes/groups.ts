import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const groups = await prisma.group.findMany({
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(groups);
});

router.get("/:slug", async (req, res) => {
  const group = await prisma.group.findUnique({
    where: { slug: req.params.slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, name: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  res.json(group);
});

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
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

router.post("/:slug/join", requireAuth, async (req: AuthRequest, res) => {
  const group = await prisma.group.findUnique({ where: { slug: req.params.slug } });
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const membership = await prisma.groupMembership.upsert({
    where: { userId_groupId: { userId: req.user!.id, groupId: group.id } },
    create: { userId: req.user!.id, groupId: group.id },
    update: {},
  });

  res.json(membership);
});

export default router;
