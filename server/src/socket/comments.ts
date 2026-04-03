import type { Server, Socket } from "socket.io";

// Rooms: post:{postId}
// Events emitted: comment:new, comment:reply

export function registerCommentHandlers(io: Server, socket: Socket) {
  socket.on("post:join", (postId: string) => {
    socket.join(`post:${postId}`);
  });

  socket.on("post:leave", (postId: string) => {
    socket.leave(`post:${postId}`);
  });
}

// Called from the comments route after a comment is created
export function broadcastComment(
  io: Server,
  postId: string,
  comment: unknown,
) {
  io.to(`post:${postId}`).emit("comment:new", comment);
}
