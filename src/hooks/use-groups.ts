import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type { Group } from "@/types";

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => api.get("/api/groups"),
    staleTime: STALE.MEDIUM,
  });
}

export function useGroupDetail(slug: string) {
  return useQuery({
    queryKey: ["groups", slug],
    queryFn: () => api.get(`/api/groups/${slug}`),
    enabled: !!slug,
    staleTime: STALE.MEDIUM,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string }) =>
      api.post<Group>("/api/groups", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.post(`/api/groups/${slug}/join`, {}),
    onSuccess: (_data, slug) => {
      qc.invalidateQueries({ queryKey: ["groups", slug] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
