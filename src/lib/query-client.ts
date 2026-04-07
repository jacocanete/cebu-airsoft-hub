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
 * Singleton QueryClient shared between the React tree (QueryClientProvider)
 * and route loaders (which run outside React context).
 *
 * Extracted here to avoid circular imports between __root.tsx and route files
 * that need queryClient.ensureQueryData() in their loaders.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
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
    // STALE.SHORT is the global default — hooks that need the same value
    // should omit staleTime rather than restating it.
    queries: { staleTime: STALE.SHORT, retry: 1 },
  },
});
