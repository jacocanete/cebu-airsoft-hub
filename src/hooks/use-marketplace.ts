import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MarketplaceListing } from "@/types";

interface ListingFilters {
  condition?: string;
  category?: string;
  q?: string;
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
}

export function useListings(filters?: ListingFilters) {
  return useQuery<MarketplaceListing[]>({
    queryKey: ["listings", filters?.condition ?? null, filters?.category ?? null, filters?.q ?? null, filters?.status ?? null],
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
  return useQuery<MarketplaceListing>({
    queryKey: ["listings", id],
    queryFn: () => api.get(`/api/listings/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000,
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
