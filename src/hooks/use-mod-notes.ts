import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ModNote } from "@/types";

export function useModNotes(username: string) {
  return useQuery<ModNote[]>({
    queryKey: ["mod-notes", username],
    queryFn: () => api.get<ModNote[]>(`/api/users/${username}/notes`),
    staleTime: 30_000,
  });
}

export function useAddModNote(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/users/${username}/notes`, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mod-notes", username] }),
  });
}
