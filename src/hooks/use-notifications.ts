import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "@/hooks/use-auth";
import type { Notification, NotificationsPage } from "@/types";

const QUERY_KEY = ["notifications"] as const;
const UNREAD_KEY = [...QUERY_KEY, "unread-count"] as const;

export function useNotifications() {
  const { data: session } = useCurrentUser();

  return useQuery<NotificationsPage>({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<NotificationsPage>("/api/notifications?limit=20"),
    enabled: !!session?.user,
    staleTime: 60_000,
    // Cache is kept live by socket pushes (useUnreadCount) and optimistic
    // patches (useMarkRead/useMarkAllRead). Refetching on mount would race
    // with any in-flight PATCH mutations and overwrite correct optimistic state.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Lightweight unread count — powers the navbar bell badge.
 * Owns the Socket.io subscription so the badge updates from any page.
 */
export function useUnreadCount() {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();

  useEffect(() => {
    if (!session?.user) return;

    const wasConnected = socket.connected;
    if (!wasConnected) socket.connect();

    function handleNew(notification: Notification) {
      qc.setQueryData<{ count: number }>(UNREAD_KEY, (prev) => ({
        count: (prev?.count ?? 0) + 1,
      }));
      qc.setQueryData<NotificationsPage>(QUERY_KEY, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: [notification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1,
        };
      });
    }

    socket.on("notification:new", handleNew);
    return () => {
      socket.off("notification:new", handleNew);
      if (!wasConnected) socket.disconnect();
    };
  }, [session?.user?.id, qc]);

  return useQuery<{ count: number }>({
    queryKey: UNREAD_KEY,
    queryFn: () => api.get<{ count: number }>("/api/notifications/unread-count"),
    enabled: !!session?.user,
    refetchInterval: 60_000, // periodic safety net — independent of mount events
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Returns { markRead, isPending }.
 *
 * markRead(id) patches the cache synchronously in the same call stack as the
 * click handler — no microtask boundary — then fires the HTTP PATCH as a
 * fire-and-forget side effect. This eliminates the race between navigation
 * (which triggers component unmount) and async onMutate callbacks.
 */
export function useMarkRead() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) =>
      api.patch<Notification>(`/api/notifications/${id}/read`, {}),
    onSuccess: (updated) => {
      // Overwrite the optimistic patch with the authoritative server response.
      // This is a belt-and-suspenders layer — the optimistic patch is already
      // correct, but this confirms it and handles any edge cases.
      qc.setQueryData<NotificationsPage>(QUERY_KEY, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === updated.id ? { ...n, ...updated } : n,
          ),
        };
      });
    },
    onError: (_err, id) => {
      // Roll back the optimistic patch if the server rejects the request
      qc.setQueryData<NotificationsPage>(QUERY_KEY, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n,
          ),
          unreadCount: prev.unreadCount + 1,
        };
      });
      qc.setQueryData<{ count: number }>(UNREAD_KEY, (prev) => ({
        count: (prev?.count ?? 0) + 1,
      }));
    },
  });

  function markRead(id: string) {
    // Patch the cache synchronously — this runs in the same tick as the
    // caller's click handler, before any React state updates or navigation.
    qc.setQueryData<NotificationsPage>(QUERY_KEY, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      };
    });
    qc.setQueryData<{ count: number }>(UNREAD_KEY, (prev) => ({
      count: Math.max(0, (prev?.count ?? 0) - 1),
    }));

    // Fire the HTTP PATCH — result is handled by onError for rollback only
    mutation.mutate(id);
  }

  return { markRead, isPending: mutation.isPending };
}

/**
 * Returns { markAllRead, isPending }.
 * Same synchronous-cache-first pattern as useMarkRead.
 */
export function useMarkAllRead() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.patch("/api/notifications/read-all", {}),
    onError: () => {
      // Refetch from server to restore true state on failure
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
    },
  });

  function markAllRead() {
    qc.setQueryData<NotificationsPage>(QUERY_KEY, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    });
    qc.setQueryData<{ count: number }>(UNREAD_KEY, { count: 0 });

    mutation.mutate();
  }

  return { markAllRead, isPending: mutation.isPending };
}
