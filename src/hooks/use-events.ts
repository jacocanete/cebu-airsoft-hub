import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import type { GameEvent, RSVPStatus } from "@/types";

export function useEventsList() {
  return useQuery<GameEvent[]>({
    queryKey: ["events"],
    queryFn: () => api.get("/api/events"),
    staleTime: 60 * 1000,
  });
}

export function useEventDetail(id: string) {
  const qc = useQueryClient();

  useEffect(() => {
    socket.connect();
    socket.emit("event:join", id);

    function handleRsvpUpdate(payload: { rsvpCount: number }) {
      qc.setQueryData<GameEvent>(["events", id], (prev) =>
        prev ? { ...prev, rsvpCount: payload.rsvpCount } : prev,
      );
    }

    socket.on("rsvp:update", handleRsvpUpdate);

    return () => {
      socket.emit("event:leave", id);
      socket.off("rsvp:update", handleRsvpUpdate);
    };
  }, [id, qc]);

  return useQuery<GameEvent>({
    queryKey: ["events", id],
    queryFn: () => api.get<GameEvent>(`/api/events/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: RSVPStatus }) =>
      api.post(`/api/events/${eventId}/rsvp`, { status }),
    onSuccess: (_data, { eventId }) => {
      qc.invalidateQueries({ queryKey: ["events", eventId] });
    },
  });
}
