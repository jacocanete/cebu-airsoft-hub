import type { Server } from "socket.io";
import { prisma } from "../prisma.js";

export type NotificationType =
  | "comment_on_post"   // someone commented on your post
  | "reply_to_comment"  // someone replied to your comment
  | "post_removed"      // mod removed your post
  | "comment_removed"   // mod removed your comment
  | "account_banned";   // you were banned

interface CreateNotificationParams {
  io: Server;
  userId: string;
  type: NotificationType;
  message: string;
  relatedId?: string;
}

/**
 * Persists a notification to the DB and pushes it in real-time to the
 * recipient's personal Socket.io room (`user:{userId}`).
 *
 * Skips silently if the userId is missing (e.g. anonymous or bot action).
 */
export async function notify(params: CreateNotificationParams): Promise<void> {
  const { io, userId, type, message, relatedId } = params;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      relatedId: relatedId ?? null,
    },
    select: {
      id: true,
      type: true,
      message: true,
      read: true,
      relatedId: true,
      createdAt: true,
    },
  });

  // Real-time push — user may have multiple tabs open, reaches all of them
  io.to(`user:${userId}`).emit("notification:new", notification);
}
