import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useBanUser(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { reason: string; durationDays?: number }) =>
      api.post(`/api/users/${username}/ban`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", username] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUnbanUser(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/api/users/${username}/unban`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", username] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useChangeRole(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: "USER" | "MODERATOR" | "ADMIN") =>
      api.patch(`/api/users/${username}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", username] });
    },
  });
}
