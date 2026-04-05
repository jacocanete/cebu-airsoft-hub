import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Comment } from "@/types";

// Fetches replies for a single comment. Only runs when enabled=true,
// so replies are fetched lazily when the thread is visible/expanded.
export function useReplies(postId: string, commentId: string, enabled: boolean) {
  return useQuery<Comment[]>({
    queryKey: ["replies", commentId],
    queryFn: () =>
      api.get<Comment[]>(`/api/posts/${postId}/comments/${commentId}/replies`),
    enabled,
    staleTime: 30 * 1000,
  });
}
