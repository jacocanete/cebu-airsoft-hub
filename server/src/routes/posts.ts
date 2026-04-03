import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  requireAuth,
  optionalAuth,
  type AuthRequest,
} from "../middleware/auth.js";

const router = Router();

const postSelect = {
  id: true,
  title: true,
  category: true,
  tags: true,
  pinned: true,
  createdAt: true,
  author: { select: { id: true, username: true, name: true } },
  _count: { select: { comments: true, votes: true } },
  votes: { select: { value: true } },
};

router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  const { category, sort = "hot", q } = req.query as Record<string, string>;

  const where = {
    ...(category && category !== "All" ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    select: postSelect,
    orderBy: sort === "new" ? { createdAt: "desc" } : { createdAt: "desc" },
  });

  const formatted = posts.map((p) => ({
    ...p,
    upvotes: p.votes.filter((v) => v.value === 1).length,
    downvotes: p.votes.filter((v) => v.value === -1).length,
    commentCount: p._count.comments,
    userVote: req.user
      ? (p.votes.find((v) => {
          // votes don't have userId here, need separate query for user vote
        })?.value ?? 0)
      : 0,
    votes: undefined,
    _count: undefined,
  }));

  res.json(formatted);
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, username: true, name: true } },
      votes: true,
      poll: {
        include: {
          options: {
            include: { _count: { select: { votes: true } } },
          },
        },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(post);
});

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).max(8).default([]),
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

  const { title, content, category, tags, poll } = parsed.data;

  const post = await prisma.post.create({
    data: {
      title,
      content,
      category,
      tags,
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

router.post("/:id/vote", requireAuth, async (req: AuthRequest, res) => {
  const value = z
    .union([z.literal(1), z.literal(-1), z.literal(0)])
    .parse(req.body.value);
  const postId = req.params.id;
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
});

export default router;
