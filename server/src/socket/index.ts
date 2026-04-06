import type { Server } from "socket.io";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { registerCommentHandlers } from "./comments.js";
import { registerEventHandlers } from "./events.js";
import { registerNotificationHandlers } from "./notifications.js";
import { registerChatHandlers } from "./chat.js";

export function registerSocketHandlers(io: Server) {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    const headers: Record<string, string> = {};
    const cookie = socket.handshake.headers.cookie;
    if (cookie) headers["cookie"] = cookie;

    const authHeader = socket.handshake.headers.authorization;
    if (authHeader) headers["authorization"] = authHeader;

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (session) {
      socket.data.user = session.user;
      socket.data.session = session.session;
    }

    next();
  });

  io.on("connection", (socket) => {
    registerCommentHandlers(io, socket);
    registerEventHandlers(io, socket);
    registerNotificationHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      // cleanup handled per-handler
    });
  });
}
