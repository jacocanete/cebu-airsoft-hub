import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      gearList: true,
      playStyle: true,
      createdAt: true,
      memberships: {
        include: { group: { select: { name: true, slug: true } } },
        take: 1,
        orderBy: { joinedAt: "asc" },
      },
      _count: {
        select: { posts: true, listings: true, rsvps: true },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

router.get("/:username/posts", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
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

export default router;
