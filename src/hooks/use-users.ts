import { queryOptions, useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type { UserProfile, UserPost, UserComment, MarketplaceListing } from "@/types";

export const userProfileQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["users", username] as const,
    queryFn: () => api.get<UserProfile>(`/api/users/${username}`),
    staleTime: STALE.MEDIUM,
  });

export function useUserProfile(username: string) {
  return useSuspenseQuery(userProfileQueryOptions(username));
}

export function useUserPosts(username: string) {
  return useQuery<UserPost[]>({
    queryKey: ["users", username, "posts"],
    queryFn: () => api.get<UserPost[]>(`/api/users/${username}/posts`),
    enabled: !!username,
    staleTime: STALE.MEDIUM,
  });
}

export function useUserComments(username: string, enabled = true) {
  return useQuery<UserComment[]>({
    queryKey: ["users", username, "comments"],
    queryFn: () => api.get<UserComment[]>(`/api/users/${username}/comments`),
    enabled: !!username && enabled,
    staleTime: STALE.MEDIUM,
  });
}

export function useUserListings(username: string, enabled = true) {
  return useQuery<MarketplaceListing[]>({
    queryKey: ["users", username, "listings"],
    queryFn: () => api.get<MarketplaceListing[]>(`/api/users/${username}/listings`),
    enabled: !!username && enabled,
    staleTime: STALE.MEDIUM,
  });
}

interface UpdateProfileInput {
  bio?: string;
  playStyle?: string;
  gearList?: string;
  avatar?: string | null;
  coverPhoto?: string | null;
}

export function useUpdateProfile(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      api.patch<UserProfile>("/api/users/me", data),
    onSuccess: () => {
      // Invalidate the profile cache and session (avatar shown in navbar)
      qc.invalidateQueries({ queryKey: ["users", username] });
      qc.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
}
