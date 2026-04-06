import type { Server, Socket } from "socket.io";

// Rooms: post:{postId}
// Inbound events: post:join, post:leave
// Outbound events: comment:vote:update (emitted from comments route), vote:update / post:updated (emitted from posts route)

export function registerCommentHandlers(_io: Server, socket: Socket) {
  socket.on("post:join", (postId: string) => {
    socket.join(`post:${postId}`);
  });

  socket.on("post:leave", (postId: string) => {
    socket.leave(`post:${postId}`);
  });
}
