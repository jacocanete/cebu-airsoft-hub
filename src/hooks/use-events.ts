import { queryOptions, useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
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

export const eventDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["events", id] as const,
    queryFn: () => api.get<GameEvent>(`/api/events/${id}`),
    staleTime: 30 * 1000,
  });

export function useEventDetail(id: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const wasConnected = socket.connected;
    if (!wasConnected) socket.connect();
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
      if (!wasConnected) socket.disconnect();
    };
  }, [id, qc]);

  return useSuspenseQuery(eventDetailQueryOptions(id));
}

export function useRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: RSVPStatus }) =>
      api.post(`/api/events/${eventId}/rsvp`, { status }),
    onSuccess: (_data, { eventId }) => {
      qc.invalidateQueries({ queryKey: ["events", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
