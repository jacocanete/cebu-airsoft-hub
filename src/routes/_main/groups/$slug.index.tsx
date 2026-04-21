import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Flame, Lock, MessageSquare, Plus, TrendingUp, type LucideIcon } from "lucide-react";
import { groupDetailQueryOptions, useGroupDetail } from "@/hooks/use-groups";
import { usePostsInfinite } from "@/hooks/use-posts";
import { useCurrentUser } from "@/hooks/use-auth";
import { GroupHeader } from "@/components/groups/group-header";
import { MemberGrid } from "@/components/groups/member-grid";
import { PostCard } from "@/components/feed/post-card";
import { SkeletonCard, SkeletonList } from "@/components/shared/skeleton-list";
import type { GroupDetail } from "@/types";

type PostSort = "hot" | "new" | "top";

export const Route = createFileRoute("/_main/groups/$slug/")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(groupDetailQueryOptions(params.slug)),
  pendingComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SkeletonCard />
    </div>
  ),
  head: ({ loaderData }) => {
    const group = loaderData as GroupDetail | undefined;
    return {
      meta: [{ title: group ? `${group.name} | Cebu Airsoft Hub` : "Group | Cebu Airsoft Hub" }],
    };
  },
  component: GroupProfilePage,
});

const SORT_OPTIONS: { label: string; icon: LucideIcon; value: PostSort }[] = [
  { label: "New", icon: Clock, value: "new" },
  { label: "Hot", icon: Flame, value: "hot" },
  { label: "Top", icon: TrendingUp, value: "top" },
];

function GroupProfilePage() {
  const { slug } = Route.useParams();
  const { data: group } = useGroupDetail(slug);
  const { data: session } = useCurrentUser();
  const viewer = session?.user ?? null;

  if (!group) return null;

  const role = group.viewerMembership?.role ?? null;
  const isMember = !!role;
  const isStaff = role === "OWNER" || role === "ADMIN";

  return (
    <div className="flex flex-col">
      <GroupHeader group={group} viewer={viewer} />

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        {isMember ? (
          <GroupFeed slug={slug} isStaff={isStaff} />
        ) : (
          <section className="flex flex-col items-center justify-center border border-dashed border-border bg-card/50 px-4 py-12 text-center">
            <Lock className="mb-4 h-8 w-8 text-muted-foreground/40" />
            <p className="label-military text-muted-foreground mb-1">
              Private group
            </p>
            <p className="max-w-md text-xs text-muted-foreground leading-relaxed">
              Posts and discussions are visible to members only. Join to see what
              the unit is up to.
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="label-military text-primary mb-3">Operators</h2>
          <MemberGrid members={group.members} />
        </section>
      </div>
    </div>
  );
}

function GroupFeed({ slug, isStaff }: { slug: string; isStaff: boolean }) {
  const [sort, setSort] = useState<PostSort>("new");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePostsInfinite({ sort, groupSlug: slug });

  const posts = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

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

  const { pinnedPosts, regularPosts } = useMemo(() => {
    const pinned: typeof posts = [];
    const regular: typeof posts = [];
    for (const p of posts) (p.pinned ? pinned : regular).push(p);
    return { pinnedPosts: pinned, regularPosts: regular };
  }, [posts]);

  const isEmpty = !isLoading && regularPosts.length === 0 && pinnedPosts.length === 0;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="label-military text-primary">Group feed</h2>
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
            search={{ groupSlug: slug }}
            className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="h-3.5 w-3.5" />
            Post
          </Link>
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={3} height="h-32" />
      ) : isEmpty ? (
        <EmptyFeed slug={slug} />
      ) : (
        <>
          {pinnedPosts.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-1.5">
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} extraCanMod={isStaff} />
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
              <PostCard key={post.id} post={post} extraCanMod={isStaff} />
            ))}
          </div>

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
    </section>
  );
}

function EmptyFeed({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-border bg-card py-16 px-4 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-4" />
      <p className="label-military text-muted-foreground mb-4">
        No posts yet — be the first to post in this unit.
      </p>
      <Link
        to="/feed/new"
        search={{ groupSlug: slug }}
        className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Plus className="h-3.5 w-3.5" />
        Create a post
      </Link>
    </div>
  );
}
