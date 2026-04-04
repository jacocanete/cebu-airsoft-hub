import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserProfile, UserPost } from "@/types";

export function useUserProfile(username: string) {
  return useQuery<UserProfile>({
    queryKey: ["users", username],
    queryFn: () => api.get<UserProfile>(`/api/users/${username}`),
    enabled: !!username,
    staleTime: 60 * 1000,
  });
}

export function useUserPosts(username: string) {
  return useQuery<UserPost[]>({
    queryKey: ["users", username, "posts"],
    queryFn: () => api.get<UserPost[]>(`/api/users/${username}/posts`),
    enabled: !!username,
    staleTime: 60 * 1000,
  });
}
