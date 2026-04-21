import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Crown,
  DoorOpen,
  Lock,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { CSSProperties } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GroupLogo } from "@/components/groups/group-logo";
import { JoinButton } from "@/components/groups/join-button";
import { useLeaveGroup } from "@/hooks/use-groups";
import type { GroupDetail, GroupRole, SessionUser } from "@/types";

const HERO_STYLE: CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)",
};

const ROLE_BADGE: Record<
  GroupRole,
  { label: string; icon: typeof Crown; className: string } | null
> = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  ADMIN: {
    label: "Admin",
    icon: ShieldAlert,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  MEMBER: null,
};

function MemberActions({ group }: { group: GroupDetail }) {
  const [leaveOpen, setLeaveOpen] = useState(false);
  const leave = useLeaveGroup(group.slug);
  const role = group.viewerMembership?.role;
  const isStaff = role === "OWNER" || role === "ADMIN";
  const canLeave = role === "MEMBER" || role === "ADMIN";

  function handleLeave() {
    leave.mutate(undefined, {
      onSuccess: () => {
        toast.success("You left the group");
        setLeaveOpen(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to leave"),
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isStaff && (
        <Link
          to="/groups/$slug/settings"
          params={{ slug: group.slug }}
          className="relative inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
          {group.pendingJoinRequestCount && group.pendingJoinRequestCount > 0 ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {group.pendingJoinRequestCount}
            </span>
          ) : null}
        </Link>
      )}
      {canLeave && (
        <>
          <button
            type="button"
            onClick={() => setLeaveOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <DoorOpen className="h-3.5 w-3.5" />
            Leave
          </button>
          <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave {group.name}?</DialogTitle>
                <DialogDescription>
                  You'll lose access to the group feed. You can request to join again later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setLeaveOpen(false)}
                  className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={leave.isPending}
                  className="rounded border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
                >
                  {leave.isPending ? "Leaving…" : "Leave group"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export function GroupHeader({
  group,
  viewer,
}: {
  group: GroupDetail;
  viewer: SessionUser | null;
}) {
  const memberCount = group.members.length;
  const viewerRole = group.viewerMembership?.role ?? null;
  const roleBadge = viewerRole ? ROLE_BADGE[viewerRole] : null;
  const isMember = !!group.viewerMembership;

  return (
    <div className="flex flex-col">
      {group.banner ? (
        <div className="h-40 w-full border-b border-border sm:h-48 overflow-hidden">
          <img
            src={group.banner}
            alt={`${group.name} banner`}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      ) : (
        <div
          className="h-40 w-full border-b border-border sm:h-48"
          style={HERO_STYLE}
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="relative -mt-12 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <GroupLogo
            name={group.name}
            logo={group.logo}
            size="2xl"
            className="border-4 border-background"
          />

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                {group.name}
              </h1>
              {roleBadge && (
                <span
                  className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleBadge.className}`}
                >
                  <roleBadge.icon className="h-3 w-3" />
                  {roleBadge.label}
                </span>
              )}
              {group.joinPolicy === "INVITE_ONLY" && (
                <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Invite only
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount} {memberCount === 1 ? "operator" : "operators"}
              </span>
              <span className="inline-flex items-center gap-1" suppressHydrationWarning>
                <CalendarDays className="h-3 w-3" />
                Formed{" "}
                {new Date(group.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="pb-1 shrink-0">
            {isMember ? (
              <MemberActions group={group} />
            ) : (
              <JoinButton group={group} viewer={viewer} />
            )}
          </div>
        </div>

        {group.description && (
          <p className="mb-6 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            {group.description}
          </p>
        )}
      </div>
    </div>
  );
}
