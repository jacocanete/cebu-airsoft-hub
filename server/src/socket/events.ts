import type { Server, Socket } from "socket.io";

// Rooms: event:{eventId}
// Events emitted: rsvp:update

export function registerEventHandlers(io: Server, socket: Socket) {
  socket.on("event:join", (eventId: string) => {
    socket.join(`event:${eventId}`);
  });

  socket.on("event:leave", (eventId: string) => {
    socket.leave(`event:${eventId}`);
  });
}

export function broadcastRsvpUpdate(
  io: Server,
  eventId: string,
  payload: { rsvpCount: number; userId: string; status: string },
) {
  io.to(`event:${eventId}`).emit("rsvp:update", payload);
}
