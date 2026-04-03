import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

interface Session {
  user: User;
  session: { id: string };
}

export function useCurrentUser() {
  return useQuery<Session | null>({
    queryKey: ["auth", "session"],
    queryFn: () =>
      api.get<Session>("/api/auth/get-session").catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; username: string }) =>
      api.post<Session>("/api/auth/sign-up/email", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth"] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/auth/sign-out", {}),
    onSuccess: () => qc.clear(),
  });
}
