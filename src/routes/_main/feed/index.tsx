import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { Plus, Flame, Clock, TrendingUp, MessageSquare, X, type LucideIcon } from "lucide-react";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/feed/post-card";
import { FilterGroup } from "@/components/shared/filter-group";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { usePostsInfinite } from "@/hooks/use-posts";
import { useCurrentUser } from "@/hooks/use-auth";

const DEFAULT_FEED_SEARCH = {
  tag: undefined as string | undefined,
  sort: "new" as "hot" | "new" | "top",
  category: "All" as string,
};

export const Route = createFileRoute("/_main/feed/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tag: typeof search.tag === "string" ? search.tag : undefined,
    sort: (["hot", "new", "top"] as const).includes(search.sort as "hot" | "new" | "top")
      ? (search.sort as "hot" | "new" | "top")
      : ("new" as const),
    category: typeof search.category === "string" ? search.category : "All",
  }),
  search: {
    middlewares: [stripSearchParams(DEFAULT_FEED_SEARCH)],
  },
  head: () => ({
    meta: [{ title: "Forum | Cebu Airsoft Hub" }],
  }),
  component: FeedPage,
});

const SORT_OPTIONS: { label: string; icon: LucideIcon; value: "hot" | "new" | "top" }[] = [
  { label: "New", icon: Clock, value: "new" },
  { label: "Hot", icon: Flame, value: "hot" },
  { label: "Top", icon: TrendingUp, value: "top" },
];

function EmptyFeedState({
  category,
  activeTag,
}: {
  category: string;
  activeTag?: string;
}) {
  const message = activeTag
    ? `No posts tagged #${activeTag} yet.`
    : category === "All"
      ? "No posts yet — be the first to start a conversation."
      : `No posts in ${category} yet.`;

  return (
    <div className="flex flex-col items-center justify-center border border-border bg-card py-16 px-4 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-4" />
      <p className="label-military text-muted-foreground mb-4">{message}</p>
      <Link
        to="/feed/new"
        className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Plus className="h-3.5 w-3.5" />
        Create a post
      </Link>
    </div>
  );
}

function FeedPage() {
  const { tag, sort, category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: session } = useCurrentUser();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // When a tag filter is active, ignore the category filter and show all categories
  const effectiveCategory = tag ? undefined : category === "All" ? undefined : category;

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePostsInfinite({
    sort,
    category: effectiveCategory,
    tag,
  });

  const posts = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // Intersection observer — triggers fetchNextPage when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function clearTag() {
    navigate({ search: (prev) => ({ ...prev, tag: undefined }) });
  }

  function handleSortChange(next: "hot" | "new" | "top") {
    navigate({ search: (prev) => ({ ...prev, sort: next }) });
  }

  function handleCategoryChange(next: string) {
    // Clicking a category clears the tag filter
    navigate({ search: (prev) => ({ ...prev, category: next, tag: undefined }) });
  }

  const { pinnedPosts, regularPosts } = useMemo(() => {
    const pinned: typeof posts = [];
    const regular: typeof posts = [];
    for (const p of posts) (p.pinned ? pinned : regular).push(p);
    return { pinnedPosts: pinned, regularPosts: regular };
  }, [posts]);

  const isEmpty = !isLoading && regularPosts.length === 0 && pinnedPosts.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader eyebrow="Community" title="Forum" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5">
            {SORT_OPTIONS.map(({ label, icon: Icon, value }) => (
              <button
                key={label}
                onClick={() => handleSortChange(value)}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  sort === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <Link
            to="/feed/new"
            className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="h-3.5 w-3.5" />
            Post
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">

          {/* Active tag chip */}
          {tag && (
            <div className="mb-4 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded border border-primary/40 bg-primary/10 px-3 py-1.5">
                <span className="label-military text-primary">Tag</span>
                <span className="text-xs font-bold text-primary">#{tag}</span>
                <button
                  type="button"
                  onClick={clearTag}
                  aria-label="Clear tag filter"
                  className="text-primary hover:text-primary/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <SkeletonList count={5} height="h-32" />
          ) : isEmpty ? (
            <EmptyFeedState category={category} activeTag={tag} />
          ) : (
            <>
              {pinnedPosts.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-1.5">
                  {pinnedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {pinnedPosts.length > 0 && (
                <div className="flex items-center gap-3 py-2 mb-1.5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="label-military text-muted-foreground/40">posts</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-px" />

              {isFetchingNextPage && (
                <div className="mt-1.5">
                  <SkeletonList count={2} height="h-32" />
                </div>
              )}

              {!hasNextPage && posts.length > 0 && (
                <p className="mt-6 text-center label-military text-muted-foreground/40">
                  {sort === "new"
                    ? "End of feed — reload to see new posts"
                    : "Showing top 100 — switch to New for the full feed"}
                </p>
              )}
            </>
          )}
        </div>

        <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3">
          <FilterGroup
            label="Categories"
            options={FORUM_CATEGORIES}
            value={category}
            onChange={handleCategoryChange}
          />

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-2">Rules of Engagement</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep it respectful. No doxxing. No cheating accusations without
              proof. Safety first — on and off the field.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {!session?.user && (
                <Link
                  to="/register"
                  className="block rounded bg-primary px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  Join the community
                </Link>
              )}
              <Link
                to="/feed/new"
                className="block rounded border border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:border-primary/50"
              >
                Create a post
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
