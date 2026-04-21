import { QueryClient, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

/**
 * Canonical staleTime constants. Import these in hooks instead of hardcoding
 * raw numbers so there's a single place to tune cache freshness behaviour.
 *
 * - SHORT  (30 s) — the global default; no need to set it explicitly per-hook
 * - MEDIUM (60 s) — lower-traffic queries (listings, events, groups, uploads)
 * - LONG   (5 min) — slow-changing data (session, blocks, conversation detail)
 */
export const STALE = {
  SHORT:  30_000,
  MEDIUM: 60_000,
  LONG:   5 * 60_000,
} as const;

/**
 * Per-request factory. SSR creates a fresh client for each incoming request;
 * the browser creates one on hydration. The router exposes this instance via
 * `context.queryClient` — route loaders must read it from context, not import
 * a singleton (which would leak state across SSR requests).
 */
export function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        if (typeof window === "undefined") return;
        if (error instanceof ApiError && error.status === 401) {
          toast.error("Authentication required", {
            description: "Please log in to continue.",
          });
          const redirect = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
        }
      },
    }),
    defaultOptions: {
      queries: { staleTime: STALE.SHORT, retry: 1 },
    },
  });
}
