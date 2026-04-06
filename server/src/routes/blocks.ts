import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/blocks — list users blocked by the current user
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: req.user!.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      blocked: {
        select: { id: true, username: true, name: true, avatar: true },
      },
    },
  });

  res.json(blocks);
});

// ---------------------------------------------------------------------------
// POST /api/blocks — block a user
// ---------------------------------------------------------------------------

const blockSchema = z.object({
  userId: z.string().min(1),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = blockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { userId: blockedId } = parsed.data;
  const blockerId = req.user!.id;

  if (blockerId === blockedId) {
    res.status(400).json({ error: "Cannot block yourself" });
    return;
  }

  const target = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true },
  });

  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // upsert to avoid 409 on double-block
  const block = await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    create: { blockerId, blockedId },
    update: {},
    select: {
      id: true,
      createdAt: true,
      blocked: { select: { id: true, username: true, name: true, avatar: true } },
    },
  });

  res.status(201).json(block);
});

// ---------------------------------------------------------------------------
// DELETE /api/blocks/:userId — unblock a user
// ---------------------------------------------------------------------------

router.delete("/:userId", requireAuth, async (req: AuthRequest, res) => {
  const blockerId = req.user!.id;
  const blockedId = req.params.userId as string;

  const deleted = await prisma.userBlock.deleteMany({
    where: { blockerId, blockedId },
  });

  if (deleted.count === 0) {
    res.status(404).json({ error: "Block not found" });
    return;
  }

  res.status(204).end();
});

export default router;
