import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type { Session } from "@/types";

const SESSION_KEY = ["auth", "session"] as const;

export const sessionQueryOptions = () =>
  queryOptions<Session | null>({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      try {
        return await api.get<Session>("/api/auth/get-session");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: STALE.LONG,
    retry: false,
  });

export function getCachedSession(queryClient: QueryClient): Session | null {
  return queryClient.getQueryData<Session | null>(SESSION_KEY) ?? null;
}
