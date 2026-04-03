import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ChevronUp, Search } from "lucide-react";
import { CATEGORY_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { MOCK_POSTS } from "@/lib/mock-data";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";

export const Route = createFileRoute("/_main/feed/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  head: () => ({
    meta: [{ title: "Search | Detachment Reaper" }],
  }),
  component: SearchPage,
});



function SearchPage() {
  const { q } = Route.useSearch();
  const query = q?.toLowerCase().trim() ?? "";

  const results = query
    ? MOCK_POSTS.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query) ||
          p.author.username.toLowerCase().includes(query),
      )
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BackLink to="/feed" label="Back to Forum" />

      <div className="mb-6"><PageHeader eyebrow="Forum" title="Search Results" /></div>

      <form className="mb-8">
        <div className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" name="q" defaultValue={q} placeholder="Search posts, tags, authors..." className="h-10 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors">Search</button>
        </div>
      </form>

      {!query ? (
        <div className="border border-border bg-card p-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="label-military text-muted-foreground">Enter a search term above</p>
        </div>
      ) : results.length === 0 ? (
        <div className="border border-border bg-card p-12 text-center">
          <p className="label-military text-muted-foreground mb-1">No results for &quot;{q}&quot;</p>
          <p className="text-xs text-muted-foreground/50">Try a different keyword, tag, or category</p>
        </div>
      ) : (
        <>
          <p className="label-military text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? "s" : ""} for &quot;{q}&quot;</p>
          <div className="flex flex-col gap-1.5">
            {results.map((post) => (
              <article key={post.id} className="flex gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent">
                <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">{post.upvotes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}`}>{post.category}</span>
                  </div>
                  <Link to="/feed/$id" params={{ id: post.id }}>
                    <h2 className="font-semibold text-foreground leading-snug hover:text-primary transition-colors">{post.title}</h2>
                  </Link>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>u/{post.author.username}</span>
                    <span>{post.createdAt}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post.commentCount}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
