import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import {
  MessageSquare,
  Shield,
  CalendarDays,
  ShoppingBag,
  Users,
  Search,
} from "lucide-react";
import { CATEGORY_COLORS, CONDITION_COLORS, FALLBACK_BADGE, LISTING_STATUS_COLORS, GAME_TYPE_COLORS, EVENT_STATUS_COLORS } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { SearchInput, SEARCH_TYPES } from "@/components/shared/search-input";
import type { SearchType } from "@/components/shared/search-input";
import { PostCard } from "@/components/feed/post-card";
import { ListingCard } from "@/components/marketplace/listing-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatRelativeTime } from "@/lib/format-time";
import {
  useSearchPosts,
  useSearchListings,
  useSearchEvents,
  useSearchGroups,
  useSearchUsers,
} from "@/hooks/use-search";
import type {
  EventListItem,
  GroupListItem,
  UserListItem,
} from "@/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const DEFAULT_SEARCH = { type: "forum" as SearchType };

export const Route = createFileRoute("/_main/search")({
  validateSearch: (search: Record<string, unknown>): { q: string; type: SearchType } => ({
    q: typeof search.q === "string" ? search.q.trim() : "",
    type: SEARCH_TYPES.includes(search.type as SearchType)
      ? (search.type as SearchType)
      : "forum",
  }),
  search: {
    middlewares: [stripSearchParams(DEFAULT_SEARCH)],
  },
  head: () => ({
    meta: [{ title: "Search | Detachment Reaper" }],
  }),
  component: SearchPage,
});

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS: { type: SearchType; label: string; icon: React.ElementType }[] = [
  { type: "forum",       label: "Forum",       icon: MessageSquare },
  { type: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { type: "events",      label: "Events",      icon: CalendarDays },
  { type: "groups",      label: "Groups",      icon: Shield },
  { type: "players",     label: "Players",     icon: Users },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function SearchPage() {
  const { q, type } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setType = (next: SearchType) =>
    navigate({ search: { q, type: next }, replace: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader eyebrow="Global Search" title="Search" />
        <div className="shrink-0 w-64 lg:w-80">
          <SearchInput defaultValue={q} currentType={type} />
        </div>
      </div>

      {/* Tab strip */}
      <div className="mt-8 flex gap-0 border-b border-border overflow-x-auto">
        {TABS.map(({ type: t, label, icon: Icon }) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors -mb-px",
              type === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-6">
        {!q ? (
          <EmptyQueryState />
        ) : (
          <SearchResults q={q} type={type} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / skeleton / no-results helpers
// ---------------------------------------------------------------------------

function EmptyQueryState() {
  return (
    <div className="flex flex-col items-center justify-center border border-border bg-card p-16 text-center">
      <Search className="h-10 w-10 text-muted-foreground/20 mb-4" />
      <p className="label-military text-muted-foreground mb-1">
        Enter a search term above
      </p>
      <p className="text-xs text-muted-foreground/50">
        Search across forum posts, marketplace listings, events, groups, and players
      </p>
    </div>
  );
}

function NoResults({ q, domain }: { q: string; domain: string }) {
  return (
    <div className="border border-border bg-card p-12 text-center">
      <p className="label-military text-muted-foreground mb-1">
        No results for &quot;{q}&quot; in {domain}
      </p>
      <p className="text-xs text-muted-foreground/50">
        Try a different keyword or switch tabs
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab dispatcher
// ---------------------------------------------------------------------------

function SearchResults({ q, type }: { q: string; type: SearchType }) {
  switch (type) {
    case "forum":       return <ForumResults q={q} />;
    case "marketplace": return <MarketplaceResults q={q} />;
    case "events":      return <EventsResults q={q} />;
    case "groups":      return <GroupsResults q={q} />;
    case "players":     return <PlayersResults q={q} />;
  }
}

// ---------------------------------------------------------------------------
// Forum results
// ---------------------------------------------------------------------------

function ForumResults({ q }: { q: string }) {
  const { data: posts = [], isLoading } = useSearchPosts(q);

  if (isLoading) return <SkeletonList count={5} height="h-20" />;
  if (!posts.length) return <NoResults q={q} domain="Forum" />;

  return (
    <div className="flex flex-col gap-1.5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Marketplace results
// ---------------------------------------------------------------------------

function MarketplaceResults({ q }: { q: string }) {
  const { data: listings = [], isLoading } = useSearchListings(q);

  if (isLoading) return <SkeletonList count={6} height="h-48" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" />;
  if (!listings.length) return <NoResults q={q} domain="Marketplace" />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Events results — inline card (EventCard expects full GameEvent shape)
// ---------------------------------------------------------------------------

function EventsResults({ q }: { q: string }) {
  const { data: events = [], isLoading } = useSearchEvents(q);

  if (isLoading) return <SkeletonList count={4} height="h-28" className="gap-3" />;
  if (!events.length) return <NoResults q={q} domain="Events" />;

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <SearchEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function SearchEventCard({ event }: { event: EventListItem }) {
  const gameTypeBadge = GAME_TYPE_COLORS[event.gameType] ?? FALLBACK_BADGE;
  const statusBadge = EVENT_STATUS_COLORS[event.status] ?? FALLBACK_BADGE;

  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      className="flex items-center gap-4 border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent"
    >
      <CalendarDays className="h-8 w-8 shrink-0 text-primary/60" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", gameTypeBadge)}>
            {event.gameType}
          </span>
          <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusBadge)}>
            {event.status}
          </span>
        </div>
        <p className="text-sm font-bold text-foreground truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {event.locationName} · {event._count.rsvps} going · {formatRelativeTime(event.date)}
        </p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Groups results — inline card (GroupCard expects memberCount; we have _count)
// ---------------------------------------------------------------------------

function GroupsResults({ q }: { q: string }) {
  const { data: groups = [], isLoading } = useSearchGroups(q);

  if (isLoading) return <SkeletonList count={4} height="h-20" />;
  if (!groups.length) return <NoResults q={q} domain="Groups" />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <SearchGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

function SearchGroupCard({ group }: { group: GroupListItem }) {
  return (
    <Link
      to="/groups/$slug"
      params={{ slug: group.slug }}
      className="flex items-center gap-4 border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
        <Shield className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{group.name}</p>
        <p className="text-xs text-muted-foreground">
          {group._count.members} {group._count.members === 1 ? "operator" : "operators"}
        </p>
        {group.description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
            {group.description}
          </p>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Players results
// ---------------------------------------------------------------------------

function PlayersResults({ q }: { q: string }) {
  const { data: users = [], isLoading } = useSearchUsers(q);

  if (isLoading) return <SkeletonList count={6} height="h-16" />;
  if (!users.length) return <NoResults q={q} domain="Players" />;

  return (
    <div className="flex flex-col gap-1.5">
      {users.map((user) => (
        <SearchUserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

function SearchUserCard({ user }: { user: UserListItem }) {
  return (
    <Link
      to="/profile/$username"
      params={{ username: user.username }}
      className="flex items-center gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent"
    >
      <UserAvatar name={user.name} username={user.username} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          u/{user.username}
          {user.bio && (
            <span className="ml-2 opacity-60 truncate">· {user.bio}</span>
          )}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs font-bold text-foreground">{user._count.posts}</p>
          <p className="label-military text-muted-foreground/60">posts</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-foreground">{user._count.listings}</p>
          <p className="label-military text-muted-foreground/60">listings</p>
        </div>
      </div>
    </Link>
  );
}
