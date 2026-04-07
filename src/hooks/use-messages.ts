import { useCallback, useEffect } from "react";
import {
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "@/hooks/use-auth";
import type {
  ConversationDetail,
  ConversationListItem,
  ConversationsPage,
  Message,
  MessagesPage,
  ConversationContext,
} from "@/types";

const CONVERSATIONS_KEY = ["conversations"] as const;
const UNREAD_MESSAGES_KEY = [...CONVERSATIONS_KEY, "unread-count"] as const;

function messagesKey(conversationId: string) {
  return ["messages", conversationId] as const;
}

// ---------------------------------------------------------------------------
// useConversations — paginated conversation list with live push
// ---------------------------------------------------------------------------

type ConversationsInfiniteData = {
  pages: ConversationsPage[];
  pageParams: unknown[];
};

export function useConversations() {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();

  useEffect(() => {
    if (!session?.user) return;

    const wasConnected = socket.connected;
    if (!wasConnected) socket.connect();

    function handleNewMessage(payload: { message: Message; conversationId: string }) {
      const { message, conversationId } = payload;

      // Patch the infinite query cache — search all pages for the conversation
      qc.setQueryData<ConversationsInfiniteData>(CONVERSATIONS_KEY, (prev) => {
        if (!prev) return prev;

        // Find the conversation across all pages
        let found: ConversationListItem | undefined;
        for (const page of prev.pages) {
          found = page.conversations.find((c) => c.id === conversationId);
          if (found) break;
        }

        if (!found) {
          // Brand-new conversation not yet in cache — invalidate to refetch
          qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
          return prev;
        }

        const isFromOther = message.senderId !== session?.user?.id;
        const patched: ConversationListItem = {
          ...found,
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            readAt: message.readAt,
          },
          lastMessageAt: message.createdAt,
          unreadCount: isFromOther ? found.unreadCount + 1 : found.unreadCount,
        };

        // Remove from wherever it is, prepend to first page
        const newPages = prev.pages.map((page) => ({
          ...page,
          conversations: page.conversations.filter((c) => c.id !== conversationId),
        }));
        newPages[0] = {
          ...newPages[0],
          conversations: [patched, ...(newPages[0]?.conversations ?? [])],
        };

        return { ...prev, pages: newPages };
      });

      // Update the unread badge
      if (message.senderId !== session?.user?.id) {
        qc.setQueryData<{ count: number }>(UNREAD_MESSAGES_KEY, (prev) => ({
          count: (prev?.count ?? 0) + 1,
        }));
      }
    }

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
      if (!wasConnected) socket.disconnect();
    };
  }, [session?.user?.id, qc]);

  return useInfiniteQuery<ConversationsPage>({
    queryKey: CONVERSATIONS_KEY,
    queryFn: ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return api.get<ConversationsPage>(`/api/conversations?limit=20${cursor}`);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!session?.user,
    staleTime: STALE.MEDIUM,
  });
}

// ---------------------------------------------------------------------------
// useConversation — single conversation detail
// ---------------------------------------------------------------------------

export const conversationQueryOptions = (id: string) =>
  queryOptions({
    // Nested under CONVERSATIONS_KEY so invalidating ["conversations"] cascades
    // to both the list and individual detail entries.
    queryKey: ["conversations", id] as const,
    queryFn: () => api.get<ConversationDetail>(`/api/conversations/${id}`),
    staleTime: STALE.LONG,
  });

export function useConversation(id: string) {
  return useSuspenseQuery(conversationQueryOptions(id));
}

// ---------------------------------------------------------------------------
// useMessages — infinite query + socket listener for a single thread
// ---------------------------------------------------------------------------

export function useMessages(conversationId: string) {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();

  useEffect(() => {
    if (!session?.user) return;

    const wasConnected = socket.connected;
    if (!wasConnected) socket.connect();

    function handleNewMessage(payload: { message: Message; conversationId: string }) {
      if (payload.conversationId !== conversationId) return;
      // Prepend into the first (most recent) page of the infinite query
      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev) return prev;
          const [firstPage, ...rest] = prev.pages;
          return {
            ...prev,
            pages: [
              {
                ...firstPage,
                messages: [payload.message, ...(firstPage?.messages ?? [])],
              },
              ...rest,
            ],
          };
        },
      );
    }

    function handleMessageDeleted(payload: {
      messageId: string;
      conversationId: string;
    }) {
      if (payload.conversationId !== conversationId) return;
      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === payload.messageId
                  ? { ...m, deletedAt: new Date().toISOString() }
                  : m,
              ),
            })),
          };
        },
      );
    }

    function handleMessageRead(payload: {
      conversationId: string;
      readAt: string;
    }) {
      if (payload.conversationId !== conversationId) return;
      // Mark all sent messages as read when the other side opened the thread
      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev || !session?.user) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.senderId === session.user.id && m.readAt === null
                  ? { ...m, readAt: payload.readAt }
                  : m,
              ),
            })),
          };
        },
      );
    }

    socket.on("message:new", handleNewMessage);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("message:read", handleMessageRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("message:read", handleMessageRead);
      if (!wasConnected) socket.disconnect();
    };
  }, [conversationId, session?.user?.id, qc]);

  return useInfiniteQuery<MessagesPage>({
    queryKey: messagesKey(conversationId),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return api.get<MessagesPage>(
        `/api/conversations/${conversationId}/messages?limit=30${cursor}`,
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

// ---------------------------------------------------------------------------
// useSendMessage
// ---------------------------------------------------------------------------

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();

  return useMutation({
    mutationFn: (content: string) =>
      api.post<Message>(`/api/conversations/${conversationId}/messages`, {
        content,
      }),
    onMutate: async (content) => {
      // Optimistic insert — uses a temp id that will be overwritten by onSuccess
      if (!session?.user) return;

      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        senderId: session.user.id,
        sender: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          avatar: null,
        },
        content,
        embed: null,
        readAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev) return prev;
          const [firstPage, ...rest] = prev.pages;
          return {
            ...prev,
            pages: [
              {
                ...firstPage,
                messages: [optimistic, ...(firstPage?.messages ?? [])],
              },
              ...rest,
            ],
          };
        },
      );

      return { optimisticId: optimistic.id };
    },
    onSuccess: (message, _content, context) => {
      // Replace the optimistic entry with the real server response
      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === context?.optimisticId ? message : m,
              ),
            })),
          };
        },
      );
    },
    onError: (_err, _content, context) => {
      // Remove the optimistic entry and let the user know
      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              messages: page.messages.filter(
                (m) => m.id !== context?.optimisticId,
              ),
            })),
          };
        },
      );
      toast.error("Failed to send message. Please try again.");
    },
  });
}

// ---------------------------------------------------------------------------
// useCreateConversation — create or retrieve an existing conversation
// ---------------------------------------------------------------------------

export function useCreateConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      recipientId: string;
      initialMessage: string;
      contextType?: ConversationContext;
      contextId?: string;
    }) => api.post<{ conversationId: string; message: Message }>("/api/conversations", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// useMarkConversationRead — synchronous cache-first, fire-and-forget pattern
// ---------------------------------------------------------------------------

export function useMarkConversationRead(conversationId: string) {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();

  const mutation = useMutation({
    mutationFn: () =>
      api.patch(`/api/conversations/${conversationId}/read`, {}),
    onError: () => {
      // Refetch to restore true state on failure
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_MESSAGES_KEY });
    },
  });

  const markRead = useCallback(() => {
    if (!session?.user) return;

    // Capture the delta before zeroing so the badge patch sees the real value.
    const infiniteData = qc.getQueryData<ConversationsInfiniteData>(CONVERSATIONS_KEY);
    let delta = 0;
    for (const page of infiniteData?.pages ?? []) {
      const conv = page.conversations.find((c) => c.id === conversationId);
      if (conv) { delta = conv.unreadCount; break; }
    }

    qc.setQueryData<ConversationsInfiniteData>(CONVERSATIONS_KEY, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          conversations: page.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
        })),
      };
    });

    if (delta > 0) {
      qc.setQueryData<{ count: number }>(UNREAD_MESSAGES_KEY, (prev) => {
        if (!prev) return prev;
        return { count: Math.max(0, prev.count - delta) };
      });
    }

    mutation.mutate();
  }, [conversationId, qc, session?.user, mutation]);

  return { markRead };
}

// ---------------------------------------------------------------------------
// useDeleteMessage — soft-delete with optimistic update
// ---------------------------------------------------------------------------

export function useDeleteMessage(conversationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      api.delete(`/api/conversations/${messageId}`),
    onMutate: async (messageId) => {
      qc.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] }>(
        messagesKey(conversationId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === messageId
                  ? { ...m, deletedAt: new Date().toISOString() }
                  : m,
              ),
            })),
          };
        },
      );
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: messagesKey(conversationId) });
    },
  });
}

// ---------------------------------------------------------------------------
// useUnreadMessageCount — navbar badge, with socket push for live updates
// ---------------------------------------------------------------------------

export function useUnreadMessageCount() {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();

  useEffect(() => {
    if (!session?.user) return;

    const wasConnected = socket.connected;
    if (!wasConnected) socket.connect();

    function handleNewMessage(payload: { message: Message }) {
      if (payload.message.senderId === session?.user?.id) return;
      qc.setQueryData<{ count: number }>(UNREAD_MESSAGES_KEY, (prev) => ({
        count: (prev?.count ?? 0) + 1,
      }));
    }

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
      if (!wasConnected) socket.disconnect();
    };
  }, [session?.user?.id, qc]);

  return useQuery<{ count: number }>({
    queryKey: UNREAD_MESSAGES_KEY,
    queryFn: () =>
      api.get<{ count: number }>("/api/conversations/unread-count"),
    enabled: !!session?.user,
    refetchInterval: STALE.MEDIUM,
    // Omitting staleTime — falls through to STALE.SHORT global default.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
