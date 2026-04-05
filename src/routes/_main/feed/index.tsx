import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Flame, Clock, TrendingUp, type LucideIcon } from "lucide-react";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/feed/post-card";
import { FilterGroup } from "@/components/shared/filter-group";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { usePostsList } from "@/hooks/use-posts";
import { useCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/_main/feed/")({
  head: () => ({
    meta: [{ title: "Forum | Detachment Reaper" }],
  }),
  component: FeedPage,
});

const SORT_OPTIONS: { label: string; icon: LucideIcon; value: "hot" | "new" | "top" }[] = [
  { label: "Hot", icon: Flame, value: "hot" },
  { label: "New", icon: Clock, value: "new" },
  { label: "Top", icon: TrendingUp, value: "top" },
];

function FeedPage() {
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [category, setCategory] = useState("All");
  const { data: session } = useCurrentUser();

  const { data: posts = [], isLoading } = usePostsList({
    sort,
    category: category === "All" ? undefined : category,
  });

  const { pinnedPosts, regularPosts } = useMemo(() => {
    const pinned: typeof posts = [];
    const regular: typeof posts = [];
    for (const p of posts) (p.pinned ? pinned : regular).push(p);
    return { pinnedPosts: pinned, regularPosts: regular };
  }, [posts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader eyebrow="Community" title="Forum" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5">
            {SORT_OPTIONS.map(({ label, icon: Icon, value }) => (
              <button
                key={label}
                onClick={() => setSort(value)}
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

          {isLoading ? (
            <SkeletonList count={5} height="h-20" />
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
            </>
          )}
        </div>

        <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3">
          <FilterGroup
            label="Categories"
            options={FORUM_CATEGORIES}
            value={category}
            onChange={setCategory}
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
