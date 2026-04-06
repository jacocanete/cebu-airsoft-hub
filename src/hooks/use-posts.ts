import { useEffect } from "react";
import {
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useSuspenseQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "@/hooks/use-auth";
import { applyVote } from "@/lib/vote";
import type { PostListItem, PostDetail, PostsPage, PollDraft } from "@/types";

interface PostFilters {
  category?: string;
  sort?: "hot" | "new" | "top";
  q?: string;
  tag?: string;
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

// Walk all infinite posts caches (feed + search) and apply a patch to a single post.
function patchPostInAllCaches(
  qc: QueryClient,
  postId: string,
  patch: (p: PostListItem) => PostListItem,
) {
  const patchPages = (prev: InfiniteData<PostsPage> | undefined) => {
    if (!prev) return prev;
    return {
      ...prev,
      pages: prev.pages.map((pg) => ({
        ...pg,
        items: pg.items.map((p) => (p.id === postId ? patch(p) : p)),
      })),
    };
  };

  qc.setQueriesData<InfiniteData<PostsPage>>(
    { queryKey: ["posts", "infinite"], exact: false },
    patchPages,
  );
  qc.setQueriesData<InfiniteData<PostsPage>>(
    { queryKey: ["search", "posts"], exact: false },
    patchPages,
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function usePostsInfinite(filters?: PostFilters) {
  return useInfiniteQuery<PostsPage>({
    queryKey: [
      "posts",
      "infinite",
      filters?.category ?? null,
      filters?.sort ?? null,
      filters?.q ?? null,
      filters?.tag ?? null,
    ],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.sort) params.set("sort", filters.sort);
      if (filters?.q) params.set("q", filters.q);
      if (filters?.tag) params.set("tag", filters.tag);
      if (pageParam) params.set("cursor", pageParam as string);
      params.set("limit", "20");
      return api.get<PostsPage>(`/api/posts?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 1000,
  });
}

// Shared query options used by both the route loader (ensureQueryData) and the
// component hook (useSuspenseQuery). Keeping them in one place guarantees both
// always resolve to the same cache entry, preventing hydration mismatches.
export const postDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["posts", id] as const,
    queryFn: () => api.get<PostDetail>(`/api/posts/${id}`),
    staleTime: 30 * 1000,
    select: (post: PostDetail) => ({
      ...post,
      upvotes: post.votes.filter((v) => v.value === 1).length,
      downvotes: post.votes.filter((v) => v.value === -1).length,
      commentCount: post._count.comments,
    }),
  });

export function usePostDetail(id: string) {
  const qc = useQueryClient();

  useEffect(() => {
    function handleVoteUpdate(data: { postId: string; upvotes: number; downvotes: number }) {
      if (data.postId !== id) return;

      // Invalidate the detail cache — it stores the raw votes[] array which we
      // can't patch from aggregate counts, so let React Query refetch it.
      qc.invalidateQueries({ queryKey: ["posts", id] });

      // Patch all list/search caches directly since they store flat upvotes/downvotes.
      patchPostInAllCaches(qc, data.postId, (p) => ({
        ...p,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
      }));
    }

    function handlePostUpdated(updated: PostDetail) {
      if (updated.id !== id) return;
      qc.setQueryData<PostDetail>(["posts", id], (prev) => {
        if (!prev) return prev;
        return { ...prev, ...updated };
      });
      // Refresh all list caches so title/category/tags changes propagate
      qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
    }

    function handlePollVoteUpdate(data: { pollId: string; options: Array<{ id: string; votes: number }> }) {
      qc.setQueryData<PostDetail>(["posts", id], (prev) => {
        if (!prev?.poll || prev.poll.id !== data.pollId) return prev;
        return {
          ...prev,
          poll: {
            ...prev.poll,
            options: prev.poll.options.map((o) => {
              const updated = data.options.find((u) => u.id === o.id);
              return updated ? { ...o, _count: { votes: updated.votes }, votes: updated.votes } : o;
            }),
          },
        };
      });
    }

    socket.on("vote:update", handleVoteUpdate);
    socket.on("poll:vote:update", handlePollVoteUpdate);
    socket.on("post:updated", handlePostUpdated);
    return () => {
      socket.off("vote:update", handleVoteUpdate);
      socket.off("poll:vote:update", handlePollVoteUpdate);
      socket.off("post:updated", handlePostUpdated);
    };
  }, [id, qc]);

  // useSuspenseQuery never returns isLoading:true — if the loader seeded the
  // cache the data is available synchronously on both server and client,
  // eliminating the skeleton-vs-content hydration mismatch.
  return useSuspenseQuery(postDetailQueryOptions(id));
}

export function useUpdatePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      images?: string[];
    }) => api.patch<PostDetail>(`/api/posts/${postId}`, data),
    onSuccess: (updated) => {
      // Overwrite the detail cache with the server's authoritative response
      qc.setQueryData<PostDetail>(["posts", postId], (prev) => {
        if (!prev) return prev;
        return { ...prev, ...updated };
      });
      // Refresh all list caches so edits propagate to the feed
      qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      images?: string[];
      poll?: PollDraft;
    }) => api.post("/api/posts", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts", "infinite"] }),
  });
}

export function useVote() {
  const qc = useQueryClient();
  const { data: session } = useCurrentUser();
  const userId = session?.user?.id ?? null;

  return useMutation({
    mutationFn: ({ postId, value }: { postId: string; value: 1 | -1 | 0 }) =>
      api.post<{ upvotes: number; downvotes: number; userVote: number }>(
        `/api/posts/${postId}/vote`,
        { value },
      ),

    onMutate: async ({ postId, value }) => {
      // Cancel any in-flight refetches so they don't overwrite optimistic update
      await qc.cancelQueries({ queryKey: ["posts", postId] });
      await qc.cancelQueries({ queryKey: ["posts", "infinite"] });
      await qc.cancelQueries({ queryKey: ["search", "posts"] });

      // Snapshot current state for rollback
      const prevDetail = qc.getQueryData<PostDetail>(["posts", postId]);
      const prevInfinite = qc.getQueriesData<InfiniteData<PostsPage>>({
        queryKey: ["posts", "infinite"],
        exact: false,
      });
      const prevSearch = qc.getQueriesData<InfiniteData<PostsPage>>({
        queryKey: ["search", "posts"],
        exact: false,
      });

      // Optimistically update the detail cache
      if (prevDetail) {
        const prevVote = (prevDetail.votes.find((v) => v.userId === userId)?.value ?? 0) as 1 | -1 | 0;
        const prevUpvotes = prevDetail.votes.filter((v) => v.value === 1).length;
        const prevDownvotes = prevDetail.votes.filter((v) => v.value === -1).length;
        const { upvotes, downvotes } = applyVote(prevUpvotes, prevDownvotes, prevVote, value);
        qc.setQueryData<PostDetail>(["posts", postId], {
          ...prevDetail,
          upvotes,
          downvotes,
        });
      }

      // Optimistically update all infinite list caches
      patchPostInAllCaches(qc, postId, (p) => {
        const { upvotes, downvotes } = applyVote(p.upvotes, p.downvotes, p.userVote, value);
        return { ...p, upvotes, downvotes, userVote: value };
      });

      return { prevDetail, prevInfinite, prevSearch };
    },

    onError: (_err, { postId }, ctx) => {
      if (ctx?.prevDetail) {
        qc.setQueryData(["posts", postId], ctx.prevDetail);
      }
      // Restore infinite caches
      if (ctx?.prevInfinite) {
        for (const [queryKey, data] of ctx.prevInfinite) {
          qc.setQueryData(queryKey, data);
        }
      }
      if (ctx?.prevSearch) {
        for (const [queryKey, data] of ctx.prevSearch) {
          qc.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: (_data, _err, { postId }) => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
      qc.invalidateQueries({ queryKey: ["search", "posts"] });
    },
  });
}
