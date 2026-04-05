import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const voteSchema = z.object({
  optionIds: z.array(z.string().min(1)).min(1),
});

// ---------------------------------------------------------------------------
// POST /api/posts/:postId/polls/:pollId/vote
// ---------------------------------------------------------------------------

router.post(
  "/:postId/polls/:pollId/vote",
  requireAuth,
  async (req: AuthRequest, res) => {
    const { postId, pollId } = req.params as { postId: string; pollId: string };
    const userId = req.user!.id;

    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { optionIds } = parsed.data;

    // Load the poll with its options to validate everything before writing
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: { select: { id: true } },
      },
    });

    if (!poll || poll.postId !== postId) {
      res.status(404).json({ error: "Poll not found" });
      return;
    }

    // Check if the poll is still open
    const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;
    if (isExpired) {
      res.status(403).json({ error: "This poll is closed" });
      return;
    }

    const validOptionIds = new Set(poll.options.map((o) => o.id));

    // All submitted option IDs must belong to this poll
    const invalidIds = optionIds.filter((id) => !validOptionIds.has(id));
    if (invalidIds.length > 0) {
      res.status(400).json({ error: "Invalid option IDs" });
      return;
    }

    // Enforce single-select constraint
    if (!poll.multiSelect && optionIds.length > 1) {
      res.status(400).json({ error: "This poll only allows one choice" });
      return;
    }

    // Replace the user's prior votes on this poll atomically:
    // 1. Delete all existing PollVotes where userId = req.user and optionId ∈ this poll's options
    // 2. Create new PollVotes for each submitted optionId
    await prisma.$transaction([
      prisma.pollVote.deleteMany({
        where: {
          userId,
          optionId: { in: [...validOptionIds] },
        },
      }),
      prisma.pollVote.createMany({
        data: optionIds.map((optionId) => ({ userId, optionId })),
      }),
    ]);

    // Return updated vote counts per option + the user's current selection
    const updatedOptions = await prisma.pollOption.findMany({
      where: { pollId },
      select: {
        id: true,
        text: true,
        _count: { select: { votes: true } },
      },
      orderBy: { id: "asc" },
    });

    res.json({
      pollId,
      userVotes: optionIds,
      options: updatedOptions.map((o) => ({
        id: o.id,
        text: o.text,
        votes: o._count.votes,
      })),
    });

    // Broadcast updated counts to everyone viewing this post
    req.app.get("io").to(`post:${postId}`).emit("poll:vote:update", {
      pollId,
      options: updatedOptions.map((o) => ({
        id: o.id,
        votes: o._count.votes,
      })),
    });
  },
);

export default router;
