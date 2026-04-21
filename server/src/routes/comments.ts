import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  requireAuth,
  requireRole,
  optionalAuth,
  isMod,
  type AuthRequest,
} from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";
import { notify } from "../lib/notify.js";
import { isGroupMember, isGroupStaff } from "../lib/groups.js";

type CommentParams = { postId: string; commentId: string };

const router = Router({ mergeParams: true });

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  editedAt: true,
  deletedAt: true,
  deletedByAuthor: true,
  deletionReason: true,
  deletedBy: { select: { username: true } },
  author: { select: { id: true, username: true, name: true } },
  _count: { select: { replies: true } },
  votes: { select: { userId: true, value: true } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wilsonScore(up: number, down: number): number {
  const n = up + down;
  if (n === 0) return 0;
  const z = 1.96; // 95% confidence
  const p = up / n;
  return (
    (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n)
  );
}

type RawComment = {
  id: string;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  deletedByAuthor: boolean;
  deletionReason: string | null;
  deletedBy: { username: string } | null;
  author: { id: string; username: string; name: string };
  _count: { replies: number };
  votes: { userId: string; value: number }[];
  parentCommentId?: string | null;
  parent?: { parentCommentId: string | null } | null;
};

function sanitizeComment(comment: RawComment, userId?: string) {
  const { votes, ...rest } = comment;
  const upvotes = votes.filter((v) => v.value === 1).length;
  const downvotes = votes.filter((v) => v.value === -1).length;
  const userVote = (votes.find((v) => v.userId === userId)?.value ?? 0) as 1 | -1 | 0;
  return { ...rest, upvotes, downvotes, userVote };
}

const removeCommentSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

// Shared guard — returns the post's group context if the current user is
// allowed to see the post. Writes the response and returns null if blocked.
async function assertPostAccess(
  req: AuthRequest,
  res: import("express").Response,
  postId: string,
): Promise<{ groupId: string | null } | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { groupId: true },
  });
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return null;
  }
  if (post.groupId) {
    const userId = req.user?.id;
    if (!userId || !(await isGroupMember(userId, post.groupId))) {
      res.status(404).json({ error: "Post not found" });
      return null;
    }
  }
  return { groupId: post.groupId };
}

// ---------------------------------------------------------------------------
// GET /api/posts/:postId/comments
// ---------------------------------------------------------------------------

router.get("/", optionalAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  const { sort = "best" } = req.query as Record<string, string>;

  if (!(await assertPostAccess(req, res, req.params.postId))) return;

  const raw = await prisma.comment.findMany({
    where: { postId: req.params.postId, parentCommentId: null },
    select: commentSelect,
  });

  const comments = raw.map((c) => sanitizeComment(c, req.user?.id));

  if (sort === "old") {
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === "new") {
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "top") {
    comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  } else {
    // "best" (default) — Wilson score confidence sort
    comments.sort((a, b) => wilsonScore(b.upvotes, b.downvotes) - wilsonScore(a.upvotes, a.downvotes));
  }

  res.json(comments);
});

// ---------------------------------------------------------------------------
// GET /api/posts/:postId/comments/:commentId/replies
// ---------------------------------------------------------------------------

router.get("/:commentId/replies", optionalAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  if (!(await assertPostAccess(req, res, req.params.postId))) return;

  const raw = await prisma.comment.findMany({
    where: { parentCommentId: req.params.commentId },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });

  res.json(raw.map((c) => sanitizeComment(c, req.user?.id)));
});

// ---------------------------------------------------------------------------
// GET /api/posts/:postId/comments/:commentId/ancestors
// Returns the ancestor comment ids from nearest parent up to the root.
// ---------------------------------------------------------------------------

router.get(
  "/:commentId/ancestors",
  optionalAuth,
  async (req: AuthRequest & Request<CommentParams>, res) => {
    if (!(await assertPostAccess(req, res, req.params.postId))) return;

    // Cap recursion to 20 hops as a safety against pathological chains.
    const rows = await prisma.$queryRaw<{ parentCommentId: string }[]>`
      WITH RECURSIVE chain AS (
        SELECT id, "parentCommentId", 1 AS depth
        FROM "Comment"
        WHERE id = ${req.params.commentId} AND "postId" = ${req.params.postId}
        UNION ALL
        SELECT c.id, c."parentCommentId", chain.depth + 1
        FROM "Comment" c
        JOIN chain ON c.id = chain."parentCommentId"
        WHERE chain.depth < 20
      )
      SELECT "parentCommentId"
      FROM chain
      WHERE "parentCommentId" IS NOT NULL
    `;

    res.json(rows.map((r) => r.parentCommentId));
  },
);

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
    select: { locked: true, deletedAt: true, groupId: true },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.groupId && !(await isGroupMember(req.user!.id, post.groupId))) {
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

  const rawComment = await prisma.comment.create({
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

  const comment = sanitizeComment(rawComment, req.user!.id);
  res.status(201).json(comment);

  const io = req.app.get("io");

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
// PATCH /api/posts/:postId/comments/:commentId — edit comment (author only)
// ---------------------------------------------------------------------------

const updateCommentSchema = z.object({
  content: z.string().min(1).max(10_000),
});

router.patch("/:commentId", requireAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  const { commentId } = req.params;
  const userId = req.user!.id;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, deletedAt: true, postId: true },
  });

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.deletedAt) {
    res.status(403).json({ error: "Cannot edit a removed comment" });
    return;
  }

  // Strictly owner-only
  if (comment.authorId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = updateCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const rawUpdated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: parsed.data.content,
      editedAt: new Date(),
    },
    select: {
      ...commentSelect,
      parentCommentId: true,
      parent: { select: { parentCommentId: true } },
    },
  });

  const updated = sanitizeComment(rawUpdated, userId);
  res.json(updated);
});

// ---------------------------------------------------------------------------
// DELETE /api/posts/:postId/comments/:commentId — soft-delete (author OR mod)
// ---------------------------------------------------------------------------

router.delete("/:commentId", requireAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  const { commentId } = req.params;
  const user = req.user!;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
      deletedAt: true,
      post: { select: { groupId: true } },
    },
  });

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.deletedAt) {
    res.status(409).json({ error: "Comment already removed" });
    return;
  }

  const groupStaff = comment.post.groupId
    ? await isGroupStaff(user.id, comment.post.groupId)
    : false;
  const canMod = isMod(user) || groupStaff;
  const actingAsMod = canMod && user.id !== comment.authorId;

  if (user.id !== comment.authorId && !canMod) {
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
  async (req: AuthRequest & Request<CommentParams>, res) => {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        deletedAt: true,
        post: { select: { groupId: true } },
      },
    });

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    const groupStaff = comment.post.groupId
      ? await isGroupStaff(req.user!.id, comment.post.groupId)
      : false;
    if (!isMod(req.user) && !groupStaff) {
      res.status(403).json({ error: "Forbidden" });
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

// ---------------------------------------------------------------------------
// POST /api/posts/:postId/comments/:commentId/vote
// ---------------------------------------------------------------------------

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

router.post("/:commentId/vote", requireAuth, async (req: AuthRequest & Request<CommentParams>, res) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { commentId, postId } = req.params;
  const userId = req.user!.id;
  const { value } = parsed.data;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      deletedAt: true,
      post: { select: { groupId: true } },
    },
  });

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.post.groupId && !(await isGroupMember(userId, comment.post.groupId))) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.deletedAt) {
    res.status(403).json({ error: "Cannot vote on a removed comment" });
    return;
  }

  if (value === 0) {
    await prisma.commentVote.deleteMany({ where: { userId, commentId } });
  } else {
    await prisma.commentVote.upsert({
      where: { userId_commentId: { userId, commentId } },
      create: { userId, commentId, value },
      update: { value },
    });
  }

  const upvotes = await prisma.commentVote.count({ where: { commentId, value: 1 } });
  const downvotes = await prisma.commentVote.count({ where: { commentId, value: -1 } });

  res.json({ upvotes, downvotes, userVote: value });

  req.app.get("io")
    .to(`post:${postId}`)
    .emit("comment:vote:update", { commentId, upvotes, downvotes });
});

export default router;
