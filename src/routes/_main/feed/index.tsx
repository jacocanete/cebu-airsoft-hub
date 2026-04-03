import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Flame, Clock, TrendingUp, Search, type LucideIcon } from "lucide-react";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { MOCK_POSTS } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/feed/post-card";

export const Route = createFileRoute("/_main/feed/")({
  head: () => ({
    meta: [{ title: "Forum | Detachment Reaper" }],
  }),
  component: FeedPage,
});

const SORT_OPTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Hot", icon: Flame },
  { label: "New", icon: Clock },
  { label: "Top", icon: TrendingUp },
];

const pinnedPosts = MOCK_POSTS.filter((p) => p.pinned);
const regularPosts = MOCK_POSTS.filter((p) => !p.pinned);


function FeedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Community" title="Forum" />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form action="/feed/search" className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search posts..."
                  className="h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {SORT_OPTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      label === "Hot"
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
        </div>

        <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3">
          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Categories</p>
            <div className="flex flex-col gap-0.5">
              {["All", ...FORUM_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  className={`rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                    cat === "All"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-2">Rules of Engagement</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep it respectful. No doxxing. No cheating accusations without
              proof. Safety first — on and off the field.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/register"
                className="block rounded bg-primary px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Join the community
              </Link>
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
