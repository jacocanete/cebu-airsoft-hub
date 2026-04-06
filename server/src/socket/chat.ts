import type { Server, Socket } from "socket.io";

// Rooms: user:{userId}  (already joined by registerNotificationHandlers)
//
// All chat events are pushed directly to user personal rooms — no separate
// conversation room needed since this is a 1-on-1 inbox (not live chat).
// The HTTP routes handle persistence and emit to user rooms after each write.
//
// This module handles no inbound socket events currently — it exists as the
// canonical home for any future chat-related socket handlers (e.g. read
// receipts from the client, typing indicators if added later).

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerChatHandlers(_io: Server, _socket: Socket): void {
  // No inbound handlers in phase 1 — all chat events flow server → client via
  // HTTP route handlers emitting to user:{userId} rooms.
  //
  // Events emitted by HTTP routes:
  //   message:new     — new message received  { message, conversationId }
  //   message:read    — messages marked read   { conversationId, readAt }
  //   message:deleted — message soft-deleted   { messageId, conversationId }
}
