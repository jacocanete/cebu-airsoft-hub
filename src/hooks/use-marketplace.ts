import { queryOptions, useMutation, useQuery, useInfiniteQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type {
  MarketplaceListing,
  MarketplaceListingDetail,
  ListingsPage,
  SellerReview,
} from "@/types";

interface ListingFilters {
  condition?: string;
  category?: string;
  q?: string;
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
}

export function useListingsInfinite(filters?: ListingFilters) {
  return useInfiniteQuery<ListingsPage>({
    queryKey: [
      "listings",
      "infinite",
      filters?.condition ?? null,
      filters?.category ?? null,
      filters?.q ?? null,
      filters?.status ?? null,
    ],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filters?.condition) params.set("condition", filters.condition);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.q) params.set("q", filters.q);
      if (filters?.status) params.set("status", filters.status);
      if (pageParam) params.set("cursor", pageParam as string);
      params.set("limit", "20");
      return api.get<ListingsPage>(`/api/listings?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: STALE.MEDIUM,
  });
}

export const listingDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["listings", id] as const,
    queryFn: () => api.get<MarketplaceListingDetail>(`/api/listings/${id}`),
    staleTime: STALE.MEDIUM,
  });

export function useListingDetail(id: string) {
  return useSuspenseQuery(listingDetailQueryOptions(id));
}

export function useSellerReviews(listingId: string) {
  return useQuery<SellerReview[]>({
    queryKey: ["listings", listingId, "reviews"],
    queryFn: () => api.get(`/api/listings/${listingId}/reviews`),
    staleTime: STALE.MEDIUM,
  });
}

export function useCreateSellerReview(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      api.post<SellerReview>(`/api/listings/${listingId}/reviews`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings", listingId, "reviews"] });
      // Re-fetch detail to refresh seller averageRating / reviewCount
      qc.invalidateQueries({ queryKey: ["listings", listingId] });
    },
  });
}

export function useRelatedListings(listingId: string) {
  return useQuery<MarketplaceListing[]>({
    queryKey: ["listings", listingId, "related"],
    queryFn: () => api.get(`/api/listings/${listingId}/related`),
    enabled: !!listingId,
    staleTime: STALE.LONG,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      price: number;
      condition: string;
      category: string;
      images: string[];
    }) => api.post<MarketplaceListing>("/api/listings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings", "infinite"] }),
  });
}

export function useUpdateListingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "AVAILABLE" | "RESERVED" | "SOLD";
    }) =>
      api.patch<MarketplaceListing>(`/api/listings/${id}/status`, { status }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["listings", id] });
      qc.invalidateQueries({ queryKey: ["listings", "infinite"] });
    },
  });
}

export function useToggleListingFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<MarketplaceListing>(`/api/listings/${id}/feature`, {}),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["listings", id] });
      qc.invalidateQueries({ queryKey: ["listings", "infinite"] });
    },
  });
}
