import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { createQueryClient } from "@/lib/query-client";
import type { RouterContext } from "./routes/__root";

export function createRouter() {
  const queryClient = createQueryClient();

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: { queryClient } satisfies RouterContext,
  });

  // Auto-dehydrates queries fetched during SSR into the HTML payload and
  // hydrates them on the client, so components that read from the same cache
  // render immediately without a refetch.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

export function getRouter() {
  return createRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
