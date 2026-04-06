import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  CalendarDays,
  MapPin,
  MessageSquare,
  ChevronUp,
  Users,
  ShieldBan,
  ShieldCheck,
  StickyNote,
  Plus,
} from "lucide-react";
import { MessageButton } from "@/components/shared/MessageButton";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { SkeletonCard } from "@/components/shared/skeleton-list";
import { useUserProfile, useUserPosts } from "@/hooks/use-users";
import { useCurrentUser } from "@/hooks/use-auth";
import { useBanUser, useUnbanUser, useChangeRole } from "@/hooks/use-ban";
import { useModNotes, useAddModNote } from "@/hooks/use-mod-notes";
import { isMod, isAdmin } from "@/lib/roles";
import { ROLE_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format-time";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CSSProperties } from "react";
import type { Role } from "@/types";

const HERO_STYLE: CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)",
};

export const Route = createFileRoute("/_main/profile/$username")({
  head: () => ({
    meta: [{ title: "Profile | Detachment Reaper" }],
  }),
  component: ProfilePage,
});

const TABS = ["Posts", "Comments", "Listings"] as const;
type Tab = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Ban dialog
// ---------------------------------------------------------------------------

function BanDialog({
  open,
  onOpenChange,
  username,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  username: string;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<"1" | "7" | "30" | "permanent">("7");
  const ban = useBanUser(username);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const durationDays = duration === "permanent" ? undefined : Number(duration);
    ban.mutate(
      { reason, durationDays },
      {
        onSuccess: () => {
          toast.success("User banned");
          onOpenChange(false);
          setReason("");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to ban user"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban u/{username}</DialogTitle>
          <DialogDescription>
            Banned users cannot log in or perform any actions on the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-military text-foreground mb-1.5 block">
              Reason (required)
            </label>
            <textarea
              autoFocus
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              maxLength={500}
              placeholder="Reason for ban..."
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
            />
          </div>
          <div>
            <label className="label-military text-foreground mb-1.5 block">
              Duration
            </label>
            <div className="flex gap-1">
              {([["1", "1 day"], ["7", "7 days"], ["30", "30 days"], ["permanent", "Permanent"]] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDuration(value)}
                    className={`rounded px-3 py-1.5 label-military transition-colors ${
                      duration === value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={ban.isPending || !reason.trim()}
              className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
            >
              {ban.isPending ? "Banning…" : "Issue Ban"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Mod notes panel
// ---------------------------------------------------------------------------

function ModNotesPanel({ username }: { username: string }) {
  const { data: notes = [], isLoading } = useModNotes(username);
  const addNote = useAddModNote(username);
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    addNote.mutate(content.trim(), {
      onSuccess: () => {
        setContent("");
        toast.success("Note added");
      },
    });
  }

  return (
    <div className="border border-amber-500/30 bg-amber-500/5 p-4">
      <p className="label-military text-amber-400 mb-3 flex items-center gap-1.5">
        <StickyNote className="h-3.5 w-3.5" />
        Mod Notes
      </p>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-muted-foreground mb-3">No notes yet.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-3">
          {notes.map((note) => (
            <div key={note.id} className="text-xs border-l-2 border-amber-500/40 pl-2">
              <p className="text-foreground/80">{note.content}</p>
              <p className="text-muted-foreground/60 mt-0.5">
                u/{note.author.username} · {formatRelativeTime(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a mod note..."
          maxLength={500}
          className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={addNote.isPending || !content.trim()}
          className="inline-flex items-center gap-1 rounded border border-amber-500/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-60"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------

function ProfilePage() {
  const { username } = Route.useParams();
  const { data: session } = useCurrentUser();
  const viewer = session?.user ?? null;

  const { data: user, isLoading } = useUserProfile(username);
  const { data: posts = [] } = useUserPosts(username);
  const [tab, setTab] = useState<Tab>("Posts");
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const unban = useUnbanUser(username);
  const changeRole = useChangeRole(username);

  // All hooks must be called before early return
  const viewerIsMod = isMod(viewer);
  const viewerIsAdmin = isAdmin(viewer);
  const isOwnProfile = viewer?.id === user?.id;

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SkeletonCard />
      </div>
    );
  }

  const primaryGroup = user.memberships[0]?.group ?? null;
  const recentPosts = posts.slice(0, 5);
  const activeBan = user.bans[0] ?? null;
  const isBanned = !!activeBan;

  function handleUnban() {
    unban.mutate(undefined, {
      onSuccess: () => toast.success("Ban lifted"),
      onError: () => toast.error("Failed to lift ban"),
    });
  }

  function handleRoleChange(role: Role) {
    changeRole.mutate(role, {
      onSuccess: () => toast.success(`Role changed to ${role}`),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to change role"),
    });
  }

  return (
    <div className="flex flex-col">
      <div className="h-40 w-full border-b border-border sm:h-48" style={HERO_STYLE} />

      {/* Ban banner */}
      {isBanned && (
        <div className="border-b border-red-500/40 bg-red-500/10 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-red-400">
            This account is banned
            {activeBan.expiresAt
              ? ` until ${formatRelativeTime(activeBan.expiresAt)}`
              : " permanently"}
            {activeBan.reason ? ` — ${activeBan.reason}` : ""}
          </p>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="relative -mt-12 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <UserAvatar
            name={user.name}
            size="2xl"
            className="border-4 border-background"
          />

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                {user.name}
              </h1>
              {user.role !== "USER" && (
                <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ROLE_COLORS[user.role]}`}>
                  <Shield className="h-3 w-3" />
                  {user.role === "ADMIN" ? "Admin" : "Moderator"}
                </span>
              )}
              {primaryGroup && (
                <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Shield className="h-3 w-3" />
                  {primaryGroup.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>u/{user.username}</span>
              {user.playStyle && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.playStyle}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Message button — visible to authenticated non-own profiles */}
          {!isOwnProfile && (
            <div className="pb-1 shrink-0">
              <MessageButton
                recipientId={user.id}
                recipientName={user.name}
              />
            </div>
          )}

          {/* Mod actions on profile — only visible to mods, not own profile */}
          {viewerIsMod && !isOwnProfile && (
            <div className="flex items-center gap-2 pb-1 shrink-0">
              {isBanned ? (
                <button
                  onClick={handleUnban}
                  disabled={unban.isPending}
                  className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 px-3 py-1.5 label-military text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-60"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Lift Ban
                </button>
              ) : (
                <button
                  onClick={() => setBanDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded border border-red-500/40 px-3 py-1.5 label-military text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <ShieldBan className="h-3.5 w-3.5" />
                  Ban
                </button>
              )}
              {viewerIsAdmin && (
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  className="rounded border border-border bg-card px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground outline-none ring-primary focus:ring-1"
                  aria-label="Change user role"
                >
                  <option value="USER">User</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10 pb-12">
          <div className="flex-1 min-w-0">
            {user.bio && (
              <div className="border border-border bg-card p-5 mb-4">
                <p className="label-military text-primary mb-2">Bio</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Mod notes — only visible to mods */}
            {viewerIsMod && (
              <div className="mb-4">
                <ModNotesPanel username={username} />
              </div>
            )}

            <div className="border border-border bg-card">
              <div className="flex border-b border-border">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-widest transition-colors ${
                      tab === t
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-col divide-y divide-border">
                {tab === "Posts" && recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">
                        {post._count.votes}
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
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post._count.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {tab !== "Posts" && (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    Coming soon.
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
            <div className="border border-border bg-card p-4">
              <p className="label-military text-primary mb-3">Stats</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Posts", value: user._count.posts },
                  { label: "Listings", value: user._count.listings },
                  { label: "Games Attended", value: user._count.rsvps },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="label-military text-muted-foreground">{label}</span>
                    <span className="text-sm font-black text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {primaryGroup && (
              <div className="border border-border bg-card p-4">
                <p className="label-military text-primary mb-3">Unit</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10 shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{primaryGroup.name}</p>
                    <Link
                      to="/groups/$slug"
                      params={{ slug: primaryGroup.slug }}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      View group
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <BanDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        username={username}
      />
    </div>
  );
}
