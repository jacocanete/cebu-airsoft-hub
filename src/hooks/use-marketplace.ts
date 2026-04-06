import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MarketplaceListing,
  MarketplaceListingDetail,
  SellerReview,
} from "@/types";

interface ListingFilters {
  condition?: string;
  category?: string;
  q?: string;
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
}

export function useListings(filters?: ListingFilters) {
  return useQuery<MarketplaceListing[]>({
    queryKey: [
      "listings",
      filters?.condition ?? null,
      filters?.category ?? null,
      filters?.q ?? null,
      filters?.status ?? null,
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.condition) params.set("condition", filters.condition);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.q) params.set("q", filters.q);
      if (filters?.status) params.set("status", filters.status);
      return api.get(`/api/listings${params.size ? `?${params}` : ""}`);
    },
    staleTime: 60 * 1000,
  });
}

export function useListingDetail(id: string) {
  return useQuery<MarketplaceListingDetail>({
    queryKey: ["listings", id],
    queryFn: () => api.get(`/api/listings/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useSellerReviews(listingId: string) {
  return useQuery<SellerReview[]>({
    queryKey: ["listings", listingId, "reviews"],
    queryFn: () => api.get(`/api/listings/${listingId}/reviews`),
    enabled: !!listingId,
    staleTime: 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
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
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
