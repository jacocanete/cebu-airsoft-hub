import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy forum-only search route. Redirected to the unified /search page
 * so existing bookmarks and links continue to work.
 */
export const Route = createFileRoute("/_main/feed/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/search",
      search: { q: search.q, type: "forum" as const },
      replace: true,
    });
  },
});
