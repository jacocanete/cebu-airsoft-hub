import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { applyVote } from "@/lib/vote";
import type { Comment } from "@/types";

export type CommentSort = "best" | "top" | "new" | "old";

export function useComments(postId: string, sort: CommentSort = "best") {
  const qc = useQueryClient();

  useEffect(() => {
    function handleCommentVoteUpdate(data: {
      commentId: string;
      upvotes: number;
      downvotes: number;
    }) {
      const patchVotes = (c: Comment): Comment =>
        c.id === data.commentId
          ? { ...c, upvotes: data.upvotes, downvotes: data.downvotes }
          : c;

      // Don't touch userVote — that reflects the current user's own vote
      // state and is unaffected by someone else voting.
      qc.setQueriesData<Comment[]>({ queryKey: ["comments", postId] }, (prev) =>
        Array.isArray(prev) ? prev.map(patchVotes) : prev,
      );
      qc.setQueriesData<Comment[]>({ queryKey: ["replies"] }, (prev) =>
        Array.isArray(prev) ? prev.map(patchVotes) : prev,
      );
    }

    socket.on("comment:vote:update", handleCommentVoteUpdate);
    return () => {
      socket.off("comment:vote:update", handleCommentVoteUpdate);
    };
  }, [postId, qc]);

  return useQuery<Comment[]>({
    queryKey: ["comments", postId, sort],
    queryFn: () => api.get(`/api/posts/${postId}/comments?sort=${sort}`),
    // Omitting staleTime — falls through to STALE.SHORT global default.
  });
}

export function useUpdateComment(postId: string, commentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.patch<Comment>(`/api/posts/${postId}/comments/${commentId}`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["replies"] });
    },
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      content,
      parentCommentId,
    }: {
      postId: string;
      content: string;
      parentCommentId?: string;
    }) =>
      api.post<Comment>(`/api/posts/${postId}/comments`, {
        content,
        parentCommentId,
      }),
    onSuccess: (data, { postId, parentCommentId }) => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });

      if (!parentCommentId) {
        // Top-level comment — refresh the comments list
        qc.invalidateQueries({ queryKey: ["comments", postId] });
        return;
      }

      // Reply: use the server response's parent.parentCommentId to target the
      // exact cache that contains the parent comment and its _count.replies.
      const grandparentId = data.parent?.parentCommentId ?? null;

      if (grandparentId === null) {
        // Parent is top-level — its _count.replies is in the comments list
        qc.invalidateQueries({ queryKey: ["comments", postId] });
      } else {
        // Parent is nested — its _count.replies is in a replies cache
        qc.invalidateQueries({ queryKey: ["replies", grandparentId] });
      }

      // Refresh the parent's own replies cache (may already have an observer)
      qc.invalidateQueries({ queryKey: ["replies", parentCommentId] });
    },
  });
}

export function useCommentVote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      value,
    }: {
      postId: string;
      commentId: string;
      value: 1 | -1 | 0;
    }) =>
      api.post<{ upvotes: number; downvotes: number; userVote: 1 | -1 | 0 }>(
        `/api/posts/${postId}/comments/${commentId}/vote`,
        { value },
      ),

    onMutate: async ({ postId, commentId, value }) => {
      // Cancel in-flight queries so they don't overwrite the optimistic update
      await qc.cancelQueries({ queryKey: ["comments", postId] });
      await qc.cancelQueries({ queryKey: ["replies"] });

      // Snapshot both cache families — a given comment lives in exactly one
      // of them (top-level in ["comments", postId, sort], nested in ["replies",
      // parentId]), but we don't know which without walking the cache.
      const prevComments = qc.getQueriesData<Comment[]>({ queryKey: ["comments", postId] });
      const prevReplies = qc.getQueriesData<Comment[]>({ queryKey: ["replies"] });

      const patch = (c: Comment): Comment => {
        if (c.id !== commentId) return c;
        const { upvotes, downvotes } = applyVote(c.upvotes, c.downvotes, c.userVote, value);
        return { ...c, upvotes, downvotes, userVote: value };
      };

      for (const [key, data] of prevComments) {
        if (Array.isArray(data)) qc.setQueryData<Comment[]>(key, data.map(patch));
      }
      for (const [key, data] of prevReplies) {
        if (Array.isArray(data)) qc.setQueryData<Comment[]>(key, data.map(patch));
      }

      return { prevComments, prevReplies };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevComments) {
        for (const [k, d] of ctx.prevComments) qc.setQueryData(k, d);
      }
      if (ctx?.prevReplies) {
        for (const [k, d] of ctx.prevReplies) qc.setQueryData(k, d);
      }
    },

    onSettled: (_data, _err, { postId }) => {
      // Reconcile with server — the sort order may have changed for "best"/"top"
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["replies"] });
    },
  });
}
