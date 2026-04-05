import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "@/hooks/use-auth";
import type { PostListItem, PostDetail, PollDraft } from "@/types";

function applyVote(
  upvotes: number,
  downvotes: number,
  prev: 1 | -1 | 0,
  next: 1 | -1 | 0,
): { upvotes: number; downvotes: number } {
  let u = upvotes;
  let d = downvotes;
  // Remove previous vote
  if (prev === 1) u--;
  if (prev === -1) d--;
  // Apply new vote
  if (next === 1) u++;
  if (next === -1) d++;
  return { upvotes: u, downvotes: d };
}

interface PostFilters {
  category?: string;
  sort?: "hot" | "new" | "top";
  q?: string;
}

export function usePostsList(filters?: PostFilters) {
  return useQuery<PostListItem[]>({
    queryKey: ["posts", filters?.category ?? null, filters?.sort ?? null, filters?.q ?? null],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.sort) params.set("sort", filters.sort);
      if (filters?.q) params.set("q", filters.q);
      return api.get<PostListItem[]>(`/api/posts${params.size ? `?${params}` : ""}`);
    },
    staleTime: 30 * 1000,
  });
}

export function usePostDetail(id: string) {
  const qc = useQueryClient();

  useEffect(() => {
    function handleVoteUpdate(data: { postId: string; upvotes: number; downvotes: number }) {
      if (data.postId !== id) return;

      // Invalidate the detail cache — it stores the raw votes[] array which we
      // can't patch from aggregate counts, so let React Query refetch it.
      qc.invalidateQueries({ queryKey: ["posts", id] });

      // Patch all list caches directly since they store flat upvotes/downvotes.
      qc.setQueriesData<PostListItem[]>(
        { queryKey: ["posts"] },
        (prev) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((p) =>
            p.id === data.postId
              ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes }
              : p,
          );
        },
      );
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
    return () => {
      socket.off("vote:update", handleVoteUpdate);
      socket.off("poll:vote:update", handlePollVoteUpdate);
    };
  }, [id, qc]);

  return useQuery<PostDetail>({
    queryKey: ["posts", id],
    queryFn: () => api.get<PostDetail>(`/api/posts/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
    select: (post) => ({
      ...post,
      upvotes: post.votes.filter((v) => v.value === 1).length,
      downvotes: post.votes.filter((v) => v.value === -1).length,
      commentCount: post._count.comments,
    }),
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
      poll?: PollDraft;
    }) => api.post("/api/posts", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
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
      await qc.cancelQueries({ queryKey: ["posts"] });

      // Snapshot current state for rollback
      const prevDetail = qc.getQueryData<PostDetail>(["posts", postId]);
      const prevLists = qc.getQueriesData<PostListItem[]>({ queryKey: ["posts"] });

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

      // Optimistically update every list cache that contains this post
      for (const [queryKey, listData] of prevLists) {
        if (!Array.isArray(listData)) continue;
        qc.setQueryData<PostListItem[]>(
          queryKey,
          listData.map((p) => {
            if (p.id !== postId) return p;
            const { upvotes, downvotes } = applyVote(p.upvotes, p.downvotes, p.userVote, value);
            return { ...p, upvotes, downvotes, userVote: value };
          }),
        );
      }

      return { prevDetail, prevLists };
    },

    onError: (_err, { postId }, ctx) => {
      // Roll back on failure
      if (ctx?.prevDetail) {
        qc.setQueryData(["posts", postId], ctx.prevDetail);
      }
      if (ctx?.prevLists) {
        for (const [queryKey, data] of ctx.prevLists) {
          qc.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: (_data, _err, { postId }) => {
      // Always reconcile with server after mutation settles
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
