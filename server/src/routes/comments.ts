import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: { select: { id: true, username: true, name: true } },
  _count: { select: { replies: true } },
};

router.get("/", async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { postId: req.params.postId, parentCommentId: null },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });

  res.json(comments);
});

router.get("/:commentId/replies", async (req, res) => {
  const replies = await prisma.comment.findMany({
    where: { parentCommentId: req.params.commentId },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });

  res.json(replies);
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentCommentId: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId: req.params.postId,
      authorId: req.user!.id,
      parentCommentId: parsed.data.parentCommentId ?? null,
    },
    select: {
      ...commentSelect,
      parentCommentId: true,
    },
  });

  res.status(201).json(comment);
});

export default router;
