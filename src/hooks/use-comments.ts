import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import type { Comment } from "@/types";

export type CommentSort = "new" | "old";

export function useComments(postId: string, sort: CommentSort = "new") {
  const qc = useQueryClient();

  useEffect(() => {
    function handleNewComment(comment: Comment) {
      if (comment.parentCommentId) {
        // Determine which cache contains the parent comment so we can bump
        // its _count.replies. The server includes parent.parentCommentId on
        // newly-created comments specifically for this purpose.
        //
        // If parent.parentCommentId is null  → parent is top-level → lives in ["comments", postId, sort]
        // If parent.parentCommentId is a id  → parent is nested    → lives in ["replies", grandparentId]
        const grandparentId = comment.parent?.parentCommentId ?? null;

        if (grandparentId === null) {
          // Parent is top-level — its _count.replies lives in the comments list
          qc.invalidateQueries({ queryKey: ["comments", postId] });
        } else {
          // Parent is nested — its _count.replies lives in a replies cache
          qc.invalidateQueries({ queryKey: ["replies", grandparentId] });
        }

        // If there's already an active observer for the parent's replies cache
        // (e.g. someone else already replied and expanded), refresh it too.
        qc.invalidateQueries({ queryKey: ["replies", comment.parentCommentId] });
        return;
      }

      // Top-level comment — prepend or append to the list.
      qc.setQueryData<Comment[]>(["comments", postId, sort], (prev) => {
        if (!prev) return [comment];
        return sort === "new" ? [comment, ...prev] : [...prev, comment];
      });

      // Invalidate post caches so commentCount reconciles with the server.
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    }

    socket.on("comment:new", handleNewComment);
    return () => { socket.off("comment:new", handleNewComment); };
  }, [postId, sort, qc]);

  return useQuery<Comment[]>({
    queryKey: ["comments", postId, sort],
    queryFn: () => api.get(`/api/posts/${postId}/comments?sort=${sort}`),
    staleTime: 30 * 1000,
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
