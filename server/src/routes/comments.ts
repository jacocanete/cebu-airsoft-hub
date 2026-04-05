import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole, isMod, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";
import { notify } from "../lib/notify.js";

type CommentParams = { postId: string; commentId: string };

const router = Router({ mergeParams: true });

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  deletedAt: true,
  deletedByAuthor: true,
  deletionReason: true,
  deletedBy: { select: { username: true } },
  author: { select: { id: true, username: true, name: true } },
  _count: { select: { replies: true } },
};

const removeCommentSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

// ---------------------------------------------------------------------------
// GET /api/posts/:postId/comments
// ---------------------------------------------------------------------------

router.get("/", async (req: Request<CommentParams>, res) => {
  const { sort = "new" } = req.query as Record<string, string>;
  const orderBy = sort === "old"
    ? ({ createdAt: "asc" } as const)
    : ({ createdAt: "desc" } as const);

  const comments = await prisma.comment.findMany({
    where: { postId: req.params.postId, parentCommentId: null },
    select: commentSelect,
    orderBy,
  });

  res.json(comments);
});

// ---------------------------------------------------------------------------
// GET /api/posts/:postId/comments/:commentId/replies
// ---------------------------------------------------------------------------

router.get("/:commentId/replies", async (req: Request<CommentParams>, res) => {
  const replies = await prisma.comment.findMany({
    where: { parentCommentId: req.params.commentId },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });

  res.json(replies);
});

// ---------------------------------------------------------------------------
// POST /api/posts/:postId/comments — create (locked-post check)
// ---------------------------------------------------------------------------

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentCommentId: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  // Check if the post is locked before accepting new comments
  const post = await prisma.post.findUnique({
    where: { id: req.params.postId },
    select: { locked: true, deletedAt: true },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.deletedAt) {
    res.status(403).json({ error: "Cannot comment on a removed post" });
    return;
  }

  if (post.locked) {
    res.status(403).json({ error: "This post is locked" });
    return;
  }

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
      // parentParentCommentId lets the client identify which replies cache
      // contains the parent so it can invalidate precisely without guessing.
      parent: { select: { parentCommentId: true } },
    },
  });

  res.status(201).json(comment);

  const io = req.app.get("io");
  io.to(`post:${req.params.postId}`).emit("comment:new", comment);

  // Fire notifications asynchronously — never block the response
  const commenter = req.user!;
  const commentContent = parsed.data.content.slice(0, 80);

  if (parsed.data.parentCommentId) {
    // Reply to a comment — notify the parent comment's author
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentCommentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== commenter.id) {
      await notify({
        io,
        userId: parent.authorId,
        type: "reply_to_comment",
        message: `u/${commenter.username} replied to your comment: "${commentContent}"`,
        relatedId: req.params.postId,
      });
    }
  } else {
    // Top-level comment — notify the post author
    const postRecord = await prisma.post.findUnique({
      where: { id: req.params.postId },
      select: { authorId: true, title: true },
    });
    if (postRecord && postRecord.authorId !== commenter.id) {
      await notify({
        io,
        userId: postRecord.authorId,
        type: "comment_on_post",
        message: `u/${commenter.username} commented on "${postRecord.title.slice(0, 60)}": "${commentContent}"`,
        relatedId: req.params.postId,
      });
    }
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/posts/:postId/comments/:commentId — soft-delete (author OR mod)
// ---------------------------------------------------------------------------

router.delete("/:commentId", requireAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  const { commentId } = req.params;
  const user = req.user!;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, deletedAt: true },
  });

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.deletedAt) {
    res.status(409).json({ error: "Comment already removed" });
    return;
  }

  const actingAsMod = isMod(user) && user.id !== comment.authorId;

  if (user.id !== comment.authorId && !isMod(user)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (actingAsMod) {
    const parsed = removeCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
        deletionReason: parsed.data.reason,
        deletedByAuthor: false,
      },
    });
    await logAudit({
      actorId: user.id,
      action: "COMMENT_REMOVED",
      targetType: "COMMENT",
      targetId: commentId,
      reason: parsed.data.reason,
    });
  } else {
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
        deletedByAuthor: true,
        deletedById: null,
        deletionReason: null,
      },
    });
  }

  res.status(204).end();
});

// ---------------------------------------------------------------------------
// PATCH /api/posts/:postId/comments/:commentId/restore — mod/admin only
// ---------------------------------------------------------------------------

router.patch(
  "/:commentId/restore",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: Request<CommentParams>, res) => {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { deletedAt: true },
    });

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (!comment.deletedAt) {
      res.status(409).json({ error: "Comment is not removed" });
      return;
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: null,
        deletedById: null,
        deletionReason: null,
        deletedByAuthor: false,
      },
    });

    await logAudit({
      actorId: (req as AuthRequest).user!.id,
      action: "COMMENT_RESTORED",
      targetType: "COMMENT",
      targetId: commentId,
    });

    res.status(204).end();
  },
);

export default router;
