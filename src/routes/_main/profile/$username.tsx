import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  CalendarDays,
  MapPin,
  MessageSquare,
  ChevronUp,
  Users,
} from "lucide-react";
import { MOCK_PROFILE, MOCK_POSTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_main/profile/$username")({
  head: () => ({
    meta: [{ title: "Profile | Detachment Reaper" }],
  }),
  component: ProfilePage,
});



const TABS = ["Posts", "Comments", "Listings"];

function ProfilePage() {
  const user = MOCK_PROFILE;
  const activityPosts = MOCK_POSTS.filter((p) => !p.pinned).slice(0, 2);

  return (
    <div className="flex flex-col">
      {/* Cover gradient */}
      <div
        className="h-40 w-full border-b border-border sm:h-48"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* Avatar + name */}
        <div className="relative -mt-12 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="flex h-24 w-24 items-center justify-center border-4 border-background bg-card text-3xl font-black text-primary shrink-0">
            {user.name[0]}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                {user.name}
              </h1>
              {user.team && (
                <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Shield className="h-3 w-3" />
                  {user.team}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>u/{user.username}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {user.playStyle}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Joined {user.joinedAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10 pb-12">
          <div className="flex-1 min-w-0">
            {/* Bio */}
            <div className="border border-border bg-card p-5 mb-4">
              <p className="label-military text-primary mb-2">Bio</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.bio}
              </p>
            </div>

            {/* Activity tabs */}
            <div className="border border-border bg-card">
              <div className="flex border-b border-border">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-widest transition-colors ${
                      tab === "Posts"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col divide-y divide-border">
                {activityPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">
                        {post.upvotes}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/feed/$id"
                        params={{ id: post.id }}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.category}</span>
                        <span>{post.createdAt}</span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
            <div className="border border-border bg-card p-4">
              <p className="label-military text-primary mb-3">Stats</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Posts", value: user.postCount },
                  { label: "Listings", value: user.listingCount },
                  { label: "Games Attended", value: user.gamesAttended },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="label-military text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-black text-primary">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {user.team && (
              <div className="border border-border bg-card p-4">
                <p className="label-military text-primary mb-3">Unit</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10 shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {user.team}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      48 operators
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
