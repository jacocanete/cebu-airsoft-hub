import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import type { Comment } from "@/types";

interface CommentWithCount extends Comment {
  _count: { replies: number };
}

export function useComments(postId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    socket.connect();
    socket.emit("post:join", postId);

    socket.on(
      "comment:new",
      (comment: CommentWithCount & { parentCommentId?: string | null }) => {
        qc.setQueryData<CommentWithCount[]>(["comments", postId], (prev) => {
          if (!prev) return [comment];
          if (comment.parentCommentId) return prev; // replies handled separately
          return [...prev, comment];
        });
      },
    );

    return () => {
      socket.emit("post:leave", postId);
      socket.off("comment:new");
    };
  }, [postId, qc]);

  return useQuery<CommentWithCount[]>({
    queryKey: ["comments", postId],
    queryFn: () => api.get(`/api/posts/${postId}/comments`),
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
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}
