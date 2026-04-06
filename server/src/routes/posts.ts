import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  requireAuth,
  optionalAuth,
  requireRole,
  isMod,
  type AuthRequest,
} from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";
import { FORUM_CATEGORIES } from "../lib/constants.js";
import { excerpt } from "../lib/markdown.js";

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Reddit-style hot ranking: log(votes) + time_bias
// Every ~12.5 hours of age adds +1, equivalent to gaining 10x more net votes
function hotScore(netVotes: number, createdAt: Date): number {
  const order = Math.log10(Math.max(Math.abs(netVotes), 1));
  const sign = netVotes > 0 ? 1 : netVotes < 0 ? -1 : 0;
  const seconds = createdAt.getTime() / 1000 - 1134028003;
  return sign * order + seconds / 45000;
}

const postSelect = {
  id: true,
  title: true,
  content: true,
  category: true,
  tags: true,
  images: true,
  pinned: true,
  locked: true,
  createdAt: true,
  deletedAt: true,
  deletedByAuthor: true,
  deletionReason: true,
  deletedBy: { select: { username: true } },
  author: { select: { id: true, username: true, name: true } },
  _count: { select: { comments: true } },
  votes: { select: { userId: true, value: true } },
};

// Sanitize a post for the feed list: aggregate votes, generate excerpt, expose soft-delete fields.
// content is consumed here and not forwarded to the client to keep the list payload lean.
function sanitizePost(
  post: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    images: string[];
    pinned: boolean;
    locked: boolean;
    createdAt: Date;
    deletedAt: Date | null;
    deletedByAuthor: boolean;
    deletionReason: string | null;
    deletedBy: { username: string } | null;
    author: { id: string; username: string; name: string };
    votes: { userId: string; value: number }[];
    _count: { comments: number };
  },
  userId?: string,
) {
  const { votes, _count, content, ...rest } = post;
  return {
    ...rest,
    excerpt: excerpt(content),
    upvotes: votes.filter((v) => v.value === 1).length,
    downvotes: votes.filter((v) => v.value === -1).length,
    commentCount: _count.comments,
    userVote: userId ? (votes.find((v) => v.userId === userId)?.value ?? 0) : 0,
  };
}

const removePostSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

// ---------------------------------------------------------------------------
// GET /api/posts
// ---------------------------------------------------------------------------
//
// Pagination strategy:
//   sort=new  — true cursor pagination (cursor = post id, ordered by createdAt desc + id desc)
//   sort=hot/top — bounded window: fetch top 100, rank in JS, return 20 at a time using a
//                  numeric offset cursor. Rankings shift between page loads but that's
//                  acceptable given the snapshot-on-load model.
// Pinned posts are returned as part of page 1 only (cursor absent) and excluded from
// subsequent pages so they don't appear twice.

router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  const { category, sort = "new", q, tag, cursor, limit: limitStr } = req.query as Record<string, string>;
  const limit = Math.min(Math.max(parseInt(limitStr ?? "20", 10) || 20, 1), 50);
  const isFirstPage = !cursor;

  const baseWhere = {
    ...(category && category !== "All" ? { category } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const userId = req.user?.id;

  if (sort === "new") {
    // Fetch pinned posts separately for page 1 only
    const pinned = isFirstPage
      ? await prisma.post.findMany({
          where: { ...baseWhere, pinned: true },
          select: postSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        })
      : [];

    // Cursor-paginated regular (non-pinned) posts
    const regularRaw = await prisma.post.findMany({
      where: { ...baseWhere, pinned: false },
      select: postSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
    });

    const hasNextPage = regularRaw.length > limit;
    const regularSlice = hasNextPage ? regularRaw.slice(0, limit) : regularRaw;
    const nextCursor = hasNextPage ? regularSlice[regularSlice.length - 1].id : null;

    const items = [
      ...pinned.map((p) => sanitizePost(p, userId)),
      ...regularSlice.map((p) => sanitizePost(p, userId)),
    ];

    res.json({ items, nextCursor });
    return;
  }

  // hot / top — bounded window ranked in JS, paginated by numeric offset
  // Only page 1 (no cursor) fetches from DB. Subsequent pages use the offset
  // as a numeric index into the already-ranked top-100 list.
  // Since we can't cache server-side per-request, each page re-fetches the
  // window. Acceptable at this scale; add a server-side cache later if needed.
  const RANKED_WINDOW = 100;
  const offsetCursor = cursor ? parseInt(cursor, 10) : 0;

  const [pinnedRaw, regularRaw] = await Promise.all([
    isFirstPage
      ? prisma.post.findMany({
          where: { ...baseWhere, pinned: true },
          select: postSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        })
      : Promise.resolve([]),
    prisma.post.findMany({
      where: { ...baseWhere, pinned: false },
      select: postSelect,
      orderBy: { createdAt: "desc" },
      take: RANKED_WINDOW,
    }),
  ]);

  const formatted = regularRaw.map((p) => sanitizePost(p, userId));

  if (sort === "top") {
    formatted.sort((a, b) => {
      const diff = (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      return diff !== 0 ? diff : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } else {
    // hot (default)
    formatted.sort(
      (a, b) =>
        hotScore(b.upvotes - b.downvotes, new Date(b.createdAt)) -
        hotScore(a.upvotes - a.downvotes, new Date(a.createdAt)),
    );
  }

  const slice = formatted.slice(offsetCursor, offsetCursor + limit);
  const nextOffset = offsetCursor + limit;
  const nextCursor = nextOffset < formatted.length ? String(nextOffset) : null;

  const pinnedFormatted = isFirstPage ? pinnedRaw.map((p) => sanitizePost(p, userId)) : [];

  res.json({ items: [...pinnedFormatted, ...slice], nextCursor });
});

// ---------------------------------------------------------------------------
// GET /api/posts/:id
// ---------------------------------------------------------------------------

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id ?? null;

  const post = await prisma.post.findUnique({
    where: { id: req.params.id as string },
    include: {
      author: { select: { id: true, username: true, name: true } },
      votes: true,
      poll: {
        include: {
          options: {
            include: {
              _count: { select: { votes: true } },
              // Include whether the current user has voted on each option
              votes: userId
                ? { where: { userId }, select: { userId: true } }
                : false,
            },
            orderBy: { id: "asc" },
          },
        },
      },
      deletedBy: { select: { username: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  // Collect which option IDs the current user voted on, flattened to a simple
  // string[] on poll.userVotes for easy client consumption.
  let userVotes: string[] = [];
  if (userId && post.poll) {
    for (const option of post.poll.options) {
      const optionVotes = option.votes as unknown as { userId: string }[];
      if (Array.isArray(optionVotes) && optionVotes.some((v) => v.userId === userId)) {
        userVotes.push(option.id);
      }
    }
  }

  const response = post.poll
    ? { ...post, poll: { ...post.poll, userVotes } }
    : post;

  res.json(response);
});

// ---------------------------------------------------------------------------
// POST /api/posts
// ---------------------------------------------------------------------------

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(40_000),
  category: z.enum(FORUM_CATEGORIES),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(30)
        .regex(/^[a-z0-9-]+$/, "Tags must be lowercase alphanumeric with hyphens")
        .transform((t) => t.trim().toLowerCase().replace(/^#/, "")),
    )
    .max(8)
    .default([]),
  images: z.array(z.string().url()).max(10).default([]),
  poll: z
    .object({
      question: z.string().min(1),
      options: z
        .array(z.object({ id: z.string(), text: z.string().min(1) }))
        .min(2)
        .max(6),
      multiSelect: z.boolean().default(false),
      expiryHours: z.number().nullable(),
    })
    .optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { title, content, category, tags, images, poll } = parsed.data;

  const post = await prisma.post.create({
    data: {
      title,
      content,
      category,
      tags,
      images,
      authorId: req.user!.id,
      ...(poll
        ? {
            poll: {
              create: {
                question: poll.question,
                multiSelect: poll.multiSelect,
                expiresAt: poll.expiryHours
                  ? new Date(Date.now() + poll.expiryHours * 3600 * 1000)
                  : null,
                options: {
                  create: poll.options.map((o) => ({ text: o.text })),
                },
              },
            },
          }
        : {}),
    },
    include: {
      author: { select: { id: true, username: true, name: true } },
    },
  });

  res.status(201).json(post);
});

// ---------------------------------------------------------------------------
// PATCH /api/posts/:id — edit post (author only, unlimited window)
// ---------------------------------------------------------------------------

const updatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(40_000),
  category: z.enum(FORUM_CATEGORIES),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(30)
        .regex(/^[a-z0-9-]+$/, "Tags must be lowercase alphanumeric with hyphens")
        .transform((t) => t.trim().toLowerCase().replace(/^#/, "")),
    )
    .max(8)
    .default([]),
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const postId = req.params.id as string;
  const userId = req.user!.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, deletedAt: true },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.deletedAt) {
    res.status(403).json({ error: "Cannot edit a removed post" });
    return;
  }

  // Strictly owner-only — mods cannot edit other users' content
  if (post.authorId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      tags: parsed.data.tags,
      editedAt: new Date(),
    },
    include: {
      author: { select: { id: true, username: true, name: true } },
    },
  });

  res.json(updated);

  // Broadcast to all viewers of this post
  req.app.get("io").to(`post:${postId}`).emit("post:updated", updated);
});

// ---------------------------------------------------------------------------
// DELETE /api/posts/:id — soft-delete (author OR mod)
// ---------------------------------------------------------------------------

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const postId = req.params.id as string;
  const user = req.user!;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, deletedAt: true },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.deletedAt) {
    res.status(409).json({ error: "Post already removed" });
    return;
  }

  const actingAsMod = isMod(user) && user.id !== post.authorId;

  if (user.id !== post.authorId && !isMod(user)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  let updatedPost: ReturnType<typeof sanitizePost>;

  if (actingAsMod) {
    const parsed = removePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const raw = await prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
        deletionReason: parsed.data.reason,
        deletedByAuthor: false,
      },
      select: postSelect,
    });
    updatedPost = sanitizePost(raw, user.id);
    await logAudit({
      actorId: user.id,
      action: "POST_REMOVED",
      targetType: "POST",
      targetId: postId,
      reason: parsed.data.reason,
    });
  } else {
    const raw = await prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        deletedByAuthor: true,
        deletedById: null,
        deletionReason: null,
      },
      select: postSelect,
    });
    updatedPost = sanitizePost(raw, user.id);
  }

  res.status(204).end();

  req.app.get("io").to(`post:${postId}`).emit("post:updated", updatedPost);
});

// ---------------------------------------------------------------------------
// PATCH /api/posts/:id/restore — mod/admin only
// ---------------------------------------------------------------------------

router.patch(
  "/:id/restore",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const postId = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { deletedAt: true },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (!post.deletedAt) {
      res.status(409).json({ error: "Post is not removed" });
      return;
    }

    const raw = await prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: null,
        deletedById: null,
        deletionReason: null,
        deletedByAuthor: false,
      },
      select: postSelect,
    });

    await logAudit({
      actorId: req.user!.id,
      action: "POST_RESTORED",
      targetType: "POST",
      targetId: postId,
    });

    res.status(204).end();

    req.app.get("io").to(`post:${postId}`).emit("post:updated", sanitizePost(raw, req.user!.id));
  },
);

// ---------------------------------------------------------------------------
// PATCH /api/posts/:id/pin — mod/admin only
// ---------------------------------------------------------------------------

router.patch(
  "/:id/pin",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const postId = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { pinned: true },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { pinned: !post.pinned },
      select: { id: true, pinned: true },
    });

    await logAudit({
      actorId: req.user!.id,
      action: updated.pinned ? "POST_PINNED" : "POST_UNPINNED",
      targetType: "POST",
      targetId: postId,
    });

    res.json(updated);
  },
);

// ---------------------------------------------------------------------------
// PATCH /api/posts/:id/lock — mod/admin only
// ---------------------------------------------------------------------------

router.patch(
  "/:id/lock",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const postId = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { locked: true },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { locked: !post.locked },
      select: { id: true, locked: true },
    });

    await logAudit({
      actorId: req.user!.id,
      action: updated.locked ? "POST_LOCKED" : "POST_UNLOCKED",
      targetType: "POST",
      targetId: postId,
    });

    res.json(updated);
  },
);

// ---------------------------------------------------------------------------
// POST /api/posts/:id/vote
// ---------------------------------------------------------------------------

router.post("/:id/vote", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z
    .object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { value } = parsed.data;
  const postId = req.params.id as string;
  const userId = req.user!.id;

  if (value === 0) {
    await prisma.vote.deleteMany({ where: { userId, postId } });
  } else {
    await prisma.vote.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId, value },
      update: { value },
    });
  }

  const upvotes = await prisma.vote.count({ where: { postId, value: 1 } });
  const downvotes = await prisma.vote.count({ where: { postId, value: -1 } });

  res.json({ upvotes, downvotes, userVote: value });

  req.app.get("io").to(`post:${postId}`).emit("vote:update", { postId, upvotes, downvotes });
});

export default router;
