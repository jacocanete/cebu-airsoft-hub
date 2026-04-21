import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { sessionQueryOptions } from "@/lib/queries/session";
import type { Session } from "@/types";

export function useCurrentUser() {
  return useQuery(sessionQueryOptions());
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<Session>("/api/auth/sign-in/email", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth"] }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; username: string }) =>
      api.post<{ user: { id: string; email: string; name: string } }>(
        "/api/auth/sign-up/email",
        data,
      ),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => {
      const clientBase = window.location.origin;
      return api.post("/api/auth/send-verification-email", {
        email,
        callbackURL: `${clientBase}/verify-email`,
      });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/auth/sign-out", {}),
    onSuccess: () => qc.clear(),
  });
}
