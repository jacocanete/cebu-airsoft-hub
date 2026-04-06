import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { extractEmbed } from "../lib/embed.js";
import type { Server } from "socket.io";

const router = Router();

// ---------------------------------------------------------------------------
// Shared Prisma selects
// ---------------------------------------------------------------------------

const senderSelect = {
  id: true,
  name: true,
  username: true,
  avatar: true,
} as const;

const participantSelect = senderSelect;

// Determine the "other" participant relative to the current user
function otherParticipant(
  conv: { participant1Id: string; participant2Id: string },
  userId: string,
) {
  return conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
}

// ---------------------------------------------------------------------------
// GET /api/conversations — list conversations for current user
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { cursor, limit = "20" } = req.query as Record<string, string | undefined>;
  const userId = req.user!.id;
  const take = Math.min(Number(limit), 50);

  // Fetch IDs of users that have blocked the current user, or that the
  // current user has blocked — both directions hide the conversation.
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  });

  const blockedUserIds = new Set(
    blocks.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== userId),
  );

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
      AND: [
        { participant1Id: { notIn: [...blockedUserIds] } },
        { participant2Id: { notIn: [...blockedUserIds] } },
      ],
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      participant1: { select: participantSelect },
      participant2: { select: participantSelect },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
  });

  // Count unread messages per conversation (messages sent by the other participant, not yet read)
  const unreadCounts = await Promise.all(
    conversations.map((conv) =>
      prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          readAt: null,
          deletedAt: null,
        },
      }),
    ),
  );

  const shaped = conversations.map((conv, i) => {
    const otherId = otherParticipant(conv, userId);
    const participant =
      conv.participant1Id === otherId ? conv.participant1 : conv.participant2;

    return {
      id: conv.id,
      subject: conv.subject,
      contextType: conv.contextType,
      contextId: conv.contextId,
      participant,
      lastMessage: conv.messages[0] ?? null,
      unreadCount: unreadCounts[i],
      lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
    };
  });

  const nextCursor =
    conversations.length === take
      ? conversations[conversations.length - 1].id
      : null;

  res.json({ conversations: shaped, nextCursor });
});

// ---------------------------------------------------------------------------
// POST /api/conversations — create or get existing conversation
// ---------------------------------------------------------------------------

const createConversationSchema = z.object({
  recipientId: z.string().min(1),
  contextType: z.enum(["POST", "LISTING", "EVENT", "GROUP"]).optional(),
  contextId: z.string().optional(),
  initialMessage: z.string().min(1).max(5000),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { recipientId, contextType, contextId, initialMessage } = parsed.data;
  const senderId = req.user!.id;

  if (senderId === recipientId) {
    res.status(400).json({ error: "Cannot message yourself" });
    return;
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, name: true, username: true },
  });

  if (!recipient) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Check for active block in either direction
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: senderId, blockedId: recipientId },
        { blockerId: recipientId, blockedId: senderId },
      ],
    },
  });

  if (block) {
    res.status(403).json({ error: "Cannot message this user" });
    return;
  }

  // Normalise participant order to prevent duplicate rows for A↔B vs B↔A.
  // Always store the lower cuid as participant1.
  const [p1Id, p2Id] = [senderId, recipientId].sort();

  // Build the subject from context
  let subject: string;
  if (contextType && contextId) {
    subject = await buildSubject(contextType, contextId, recipient.name);
  } else {
    subject = `Message with ${recipient.name}`;
  }

  // findFirst + create because Prisma's upsert where clause doesn't accept
  // null in compound unique keys — null equality must be done via findFirst.
  let conversation = await prisma.conversation.findFirst({
    where: {
      participant1Id: p1Id,
      participant2Id: p2Id,
      contextType: contextType ?? null,
      contextId: contextId ?? null,
    },
    select: { id: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: p1Id,
        participant2Id: p2Id,
        contextType: contextType ?? null,
        contextId: contextId ?? null,
        subject,
        lastMessageAt: new Date(),
      },
      select: { id: true },
    });
  }

  // Send the initial message
  const embed = await extractEmbed(initialMessage);

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content: initialMessage,
      embed: embed ? (embed as unknown as Prisma.InputJsonValue) : undefined,
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      embed: true,
      readAt: true,
      deletedAt: true,
      createdAt: true,
      sender: { select: senderSelect },
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  // Push real-time notification to recipient
  const io = req.app.get("io") as Server;
  io.to(`user:${recipientId}`).emit("message:new", {
    message,
    conversationId: conversation.id,
  });

  res.status(201).json({ conversationId: conversation.id, message });
});

// ---------------------------------------------------------------------------
// GET /api/conversations/unread-count — total unread count for navbar badge
// Must be registered before /:id to avoid being swallowed by the param route.
// ---------------------------------------------------------------------------

router.get("/unread-count", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const count = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      senderId: { not: userId },
      readAt: null,
      deletedAt: null,
    },
  });

  res.json({ count });
});

// ---------------------------------------------------------------------------
// GET /api/conversations/:id — conversation detail
// ---------------------------------------------------------------------------

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const conv = await prisma.conversation.findUnique({
    where: { id: req.params.id as string },
    include: {
      participant1: { select: participantSelect },
      participant2: { select: participantSelect },
    },
  });

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const otherId = otherParticipant(conv, userId);
  const participant =
    conv.participant1Id === otherId ? conv.participant1 : conv.participant2;

  res.json({
    id: conv.id,
    subject: conv.subject,
    contextType: conv.contextType,
    contextId: conv.contextId,
    participant,
    lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
  });
});

// ---------------------------------------------------------------------------
// GET /api/conversations/:id/messages — paginated messages (newest first)
// ---------------------------------------------------------------------------

router.get("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { cursor, limit = "30" } = req.query as Record<string, string | undefined>;
  const take = Math.min(Number(limit), 100);

  const conv = await prisma.conversation.findUnique({
    where: { id: req.params.id as string },
    select: { participant1Id: true, participant2Id: true },
  });

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.id as string },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      embed: true,
      readAt: true,
      deletedAt: true,
      createdAt: true,
      sender: { select: senderSelect },
    },
  });

  const nextCursor =
    messages.length === take ? messages[messages.length - 1].id : null;

  res.json({ messages, nextCursor });
});

// ---------------------------------------------------------------------------
// POST /api/conversations/:id/messages — send a message
// ---------------------------------------------------------------------------

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const conversationId = req.params.id as string;

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participant1Id: true, participant2Id: true },
  });

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const recipientId = otherParticipant(conv, userId);

  // Check block status before sending
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: recipientId },
        { blockerId: recipientId, blockedId: userId },
      ],
    },
  });

  if (block) {
    res.status(403).json({ error: "Cannot message this user" });
    return;
  }

  const embed = await extractEmbed(parsed.data.content);

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: parsed.data.content,
      embed: embed ? (embed as unknown as Prisma.InputJsonValue) : undefined,
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      embed: true,
      readAt: true,
      deletedAt: true,
      createdAt: true,
      sender: { select: senderSelect },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // Push to recipient's personal room so it arrives regardless of which page they're on
  const io = req.app.get("io") as Server;
  io.to(`user:${recipientId}`).emit("message:new", {
    message,
    conversationId,
  });

  res.status(201).json(message);
});

// ---------------------------------------------------------------------------
// PATCH /api/conversations/:id/read — mark all unread messages as read
// ---------------------------------------------------------------------------

router.patch("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const conversationId = req.params.id as string;

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participant1Id: true, participant2Id: true },
  });

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const senderId = otherParticipant(conv, userId);
  const readAt = new Date();

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId,
      readAt: null,
      deletedAt: null,
    },
    data: { readAt },
  });

  // Notify the original sender that their messages were read
  const io = req.app.get("io") as Server;
  io.to(`user:${senderId}`).emit("message:read", {
    conversationId,
    readAt: readAt.toISOString(),
  });

  res.status(204).end();
});

// ---------------------------------------------------------------------------
// DELETE /api/messages/:messageId — soft-delete (sender only)
// ---------------------------------------------------------------------------

router.delete("/:messageId", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const message = await prisma.message.findUnique({
    where: { id: req.params.messageId as string },
    select: {
      id: true,
      senderId: true,
      conversationId: true,
      conversation: { select: { participant1Id: true, participant2Id: true } },
    },
  });

  if (!message) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  if (message.senderId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await prisma.message.update({
    where: { id: message.id },
    data: { deletedAt: new Date() },
  });

  const recipientId = otherParticipant(message.conversation, userId);
  const io = req.app.get("io") as Server;
  io.to(`user:${recipientId}`).emit("message:deleted", {
    messageId: message.id,
    conversationId: message.conversationId,
  });

  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function buildSubject(
  contextType: string,
  contextId: string,
  recipientName: string,
): Promise<string> {
  try {
    switch (contextType) {
      case "POST": {
        const post = await prisma.post.findFirst({
          where: { id: contextId, deletedAt: null },
          select: { title: true },
        });
        return post ? `RE: ${post.title}` : `Message with ${recipientName}`;
      }
      case "LISTING": {
        const listing = await prisma.marketplaceListing.findUnique({
          where: { id: contextId },
          select: { title: true },
        });
        return listing
          ? `About: ${listing.title}`
          : `Message with ${recipientName}`;
      }
      case "EVENT": {
        const event = await prisma.gameEvent.findUnique({
          where: { id: contextId },
          select: { title: true },
        });
        return event ? `RE: ${event.title}` : `Message with ${recipientName}`;
      }
      case "GROUP": {
        const group = await prisma.group.findFirst({
          where: { OR: [{ id: contextId }, { slug: contextId }] },
          select: { name: true },
        });
        return group ? `RE: ${group.name}` : `Message with ${recipientName}`;
      }
      default:
        return `Message with ${recipientName}`;
    }
  } catch {
    return `Message with ${recipientName}`;
  }
}

export default router;
