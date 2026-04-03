import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Post, PollDraft } from "@/types";

interface PostListItem
  extends Pick<Post, "id" | "title" | "category" | "tags" | "pinned" | "createdAt"> {
  author: { id: string; username: string; name: string };
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote: 1 | -1 | 0;
}

interface PostFilters {
  category?: string;
  sort?: "hot" | "new" | "top";
  q?: string;
}

export function usePostsList(filters?: PostFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.sort) params.set("sort", filters.sort);
  if (filters?.q) params.set("q", filters.q);

  return useQuery<PostListItem[]>({
    queryKey: ["posts", filters],
    queryFn: () => api.get(`/api/posts${params.size ? `?${params}` : ""}`),
    staleTime: 30 * 1000,
  });
}

export function usePostDetail(id: string) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => api.get(`/api/posts/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
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
  return useMutation({
    mutationFn: ({ postId, value }: { postId: string; value: 1 | -1 | 0 }) =>
      api.post<{ upvotes: number; downvotes: number; userVote: number }>(
        `/api/posts/${postId}/vote`,
        { value },
      ),
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
