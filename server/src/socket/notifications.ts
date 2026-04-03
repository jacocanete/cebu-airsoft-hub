import type { Server, Socket } from "socket.io";

// Rooms: user:{userId}
// Events emitted: notification:new

export function registerNotificationHandlers(_io: Server, socket: Socket) {
  // Join personal room on connect if authenticated
  if (socket.data.user) {
    socket.join(`user:${socket.data.user.id}`);
  }
}

export function broadcastNotification(
  io: Server,
  userId: string,
  notification: unknown,
) {
  io.to(`user:${userId}`).emit("notification:new", notification);
}
