import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type {
  PostsPage,
  MarketplaceListing,
  EventListItem,
  GroupListItem,
  UserListItem,
} from "@/types";

function buildUrl(base: string, q: string): string {
  return `${base}?${new URLSearchParams({ q })}`;
}

export function useSearchPosts(q: string) {
  return useInfiniteQuery<PostsPage>({
    queryKey: ["search", "posts", q],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ q, limit: "20" });
      if (pageParam) params.set("cursor", pageParam as string);
      return api.get<PostsPage>(`/api/posts?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: q.trim().length > 0,
    staleTime: STALE.SHORT,
  });
}

export function useSearchListings(q: string) {
  return useQuery<MarketplaceListing[]>({
    queryKey: ["search", "listings", q],
    queryFn: () => api.get<MarketplaceListing[]>(buildUrl("/api/marketplace", q)),
    enabled: q.trim().length > 0,
    staleTime: STALE.SHORT,
  });
}

export function useSearchEvents(q: string) {
  return useQuery<EventListItem[]>({
    queryKey: ["search", "events", q],
    queryFn: () => api.get<EventListItem[]>(buildUrl("/api/events", q)),
    enabled: q.trim().length > 0,
    staleTime: STALE.SHORT,
  });
}

export function useSearchGroups(q: string) {
  return useQuery<GroupListItem[]>({
    queryKey: ["search", "groups", q],
    queryFn: () => api.get<GroupListItem[]>(buildUrl("/api/groups", q)),
    enabled: q.trim().length > 0,
    staleTime: STALE.SHORT,
  });
}

export function useSearchUsers(q: string) {
  return useQuery<UserListItem[]>({
    queryKey: ["search", "users", q],
    queryFn: () => api.get<UserListItem[]>(buildUrl("/api/users", q)),
    enabled: q.trim().length > 0,
    staleTime: STALE.SHORT,
  });
}
