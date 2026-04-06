import { QueryClient, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

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
    queries: { staleTime: 30 * 1000, retry: 1 },
  },
});
