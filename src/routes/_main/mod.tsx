import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldAlert,
  ClipboardList,
  CheckCheck,
  XCircle,
  ExternalLink,
  Users,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { formatRelativeTime } from "@/lib/format-time";
import { useReports, useResolveReport } from "@/hooks/use-reports";
import { useModAuditLog } from "@/hooks/use-audit";
import { useSearchUsers } from "@/hooks/use-search";
import { useBanUser, useUnbanUser, useChangeRole } from "@/hooks/use-ban";
import { isMod, isAdmin } from "@/lib/roles";
import { useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Report, AuditLogEntry, UserListItem, Role } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/mod")({
  head: () => ({
    meta: [{ title: "Mod Dashboard | Detachment Reaper" }],
  }),
  beforeLoad: ({ context }) => {
    if (!isMod(context.session?.user)) {
      throw redirect({ to: "/feed" });
    }
  },
  component: ModPage,
});

// ---------------------------------------------------------------------------
// Report categories — human-readable
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE_SPEECH: "Hate speech",
  NSFW: "NSFW",
  MISINFORMATION: "Misinformation",
  OFF_TOPIC: "Off-topic",
  CHEATING_ACCUSATION_WITHOUT_PROOF: "Cheating (no proof)",
  DOXXING: "Doxxing",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  RESOLVED_ACTIONED: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  RESOLVED_DISMISSED: "text-muted-foreground border-border bg-card",
};

// ---------------------------------------------------------------------------
// Report row
// ---------------------------------------------------------------------------

function ReportRow({ report }: { report: Report }) {
  const resolve = useResolveReport();

  function handleResolve(action: "dismiss" | "action_taken") {
    resolve.mutate(
      { id: report.id, action },
      {
        onSuccess: () =>
          toast.success(action === "dismiss" ? "Report dismissed" : "Report resolved"),
        onError: () => toast.error("Failed to resolve report"),
      },
    );
  }

  const targetPath = (() => {
    switch (report.targetType) {
      case "POST":    return `/feed/${report.targetId}`;
      case "COMMENT": return `/feed/${report.targetId}`;
      case "LISTING": return `/marketplace/${report.targetId}`;
      case "USER":    return `/profile/${report.targetId}`;
      case "EVENT":   return `/events/${report.targetId}`;
      case "GROUP":   return `/groups/${report.targetId}`;
    }
  })();

  return (
    <div className="border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            STATUS_COLORS[report.status] ?? STATUS_COLORS.OPEN,
          )}>
            {report.status.replace("RESOLVED_", "").replace("_", " ")}
          </span>
          <span className="label-military text-muted-foreground">
            {report.targetType}
          </span>
          <span className="label-military text-muted-foreground">
            {CATEGORY_LABELS[report.category] ?? report.category}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatRelativeTime(report.createdAt)}
        </span>
      </div>

      {report.reason && (
        <p className="text-sm text-foreground/80 italic">"{report.reason}"</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span>
          Reported by{" "}
          <Link
            to="/profile/$username"
            params={{ username: report.reporter.username }}
            className="font-bold text-foreground hover:text-primary transition-colors"
          >
            u/{report.reporter.username}
          </Link>
        </span>
        <a
          href={targetPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          View target <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {report.status === "OPEN" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleResolve("action_taken")}
            disabled={resolve.isPending}
            className="inline-flex items-center gap-1.5 rounded bg-emerald-600/20 border border-emerald-500/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-400 hover:bg-emerald-600/30 transition-colors disabled:opacity-60"
          >
            <CheckCheck className="h-3 w-3" />
            Action taken
          </button>
          <button
            onClick={() => handleResolve("dismiss")}
            disabled={resolve.isPending}
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors disabled:opacity-60"
          >
            <XCircle className="h-3 w-3" />
            Dismiss
          </button>
        </div>
      )}

      {report.resolvedBy && (
        <p className="text-xs text-muted-foreground/60">
          Resolved by u/{report.resolvedBy.username}
          {report.resolutionNote && ` — "${report.resolutionNote}"`}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit row (mod view)
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  POST_REMOVED:     "removed a post",
  POST_RESTORED:    "restored a post",
  POST_PINNED:      "pinned a post",
  POST_UNPINNED:    "unpinned a post",
  POST_LOCKED:      "locked a post",
  POST_UNLOCKED:    "unlocked a post",
  COMMENT_REMOVED:  "removed a comment",
  COMMENT_RESTORED: "restored a comment",
  LISTING_REMOVED:  "removed a listing",
  LISTING_RESTORED: "restored a listing",
  EVENT_CANCELLED:  "cancelled an event",
  GROUP_REMOVED:    "removed a group",
  USER_BANNED:      "banned a user",
  USER_UNBANNED:    "unbanned a user",
  USER_ROLE_CHANGED:"changed a user's role",
  REPORT_DISMISSED: "dismissed a report",
  REPORT_RESOLVED:  "resolved a report",
};

function AuditRow({ entry }: { entry: AuditLogEntry }) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <Link
            to="/profile/$username"
            params={{ username: entry.actor.username }}
            className="font-bold text-foreground hover:text-primary transition-colors"
          >
            u/{entry.actor.username}
          </Link>{" "}
          <span className="text-foreground/80">
            {ACTION_LABELS[entry.action] ?? entry.action}
          </span>
          {entry.reason && (
            <span className="text-muted-foreground"> — {entry.reason}</span>
          )}
          {!entry.public && (
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">
              private
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {formatRelativeTime(entry.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Users search + mod actions
// ---------------------------------------------------------------------------

function UserRow({ user }: { user: UserListItem & { username: string } }) {
  const { data: session } = useCurrentUser();
  const viewer = session?.user ?? null;
  const viewerIsAdmin = isAdmin(viewer);

  const ban = useBanUser(user.username);
  const unban = useUnbanUser(user.username);
  const changeRole = useChangeRole(user.username);

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0 flex-wrap">
      <Link
        to="/profile/$username"
        params={{ username: user.username }}
        className="font-bold text-sm text-foreground hover:text-primary transition-colors flex-1 min-w-0 truncate"
      >
        u/{user.username}
        <span className="ml-2 text-muted-foreground font-normal text-xs">
          {user.name}
        </span>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {viewerIsAdmin && (
          <select
            defaultValue={undefined}
            onChange={(e) => {
              if (!e.target.value) return;
              changeRole.mutate(e.target.value as Role, {
                onSuccess: () => toast.success("Role updated"),
                onError: () => toast.error("Failed to update role"),
              });
              e.target.value = "";
            }}
            className="rounded border border-border bg-card px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground outline-none"
            aria-label="Change role"
          >
            <option value="">Role…</option>
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}
        <button
          onClick={() =>
            ban.mutate(
              { reason: "Banned from mod dashboard", durationDays: 7 },
              { onSuccess: () => toast.success("Banned"), onError: () => toast.error("Failed") },
            )
          }
          disabled={ban.isPending}
          title="Ban 7 days"
          className="inline-flex items-center gap-1 rounded border border-red-500/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
        >
          <ShieldBan className="h-3 w-3" />
          Ban
        </button>
        <button
          onClick={() =>
            unban.mutate(undefined, {
              onSuccess: () => toast.success("Unbanned"),
              onError: () => toast.error("Not banned or failed"),
            })
          }
          disabled={unban.isPending}
          title="Lift ban"
          className="inline-flex items-center gap-1 rounded border border-emerald-500/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-60"
        >
          <ShieldCheck className="h-3 w-3" />
          Unban
        </button>
      </div>
    </div>
  );
}

function UsersTab() {
  const [q, setQ] = useState("");
  const { data: users = [], isLoading } = useSearchUsers(q);

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search users by username or name…"
        className="mb-4 h-9 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
      />
      {!q ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter a username or name to search.
        </p>
      ) : isLoading ? (
        <SkeletonList count={5} height="h-10" />
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No users found for "{q}".
        </p>
      ) : (
        <div className="border border-border bg-card p-4">
          {users.map((u) => (
            <UserRow key={u.id} user={u as UserListItem & { username: string }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = "reports" | "audit" | "users";

function ModPage() {
  const [tab, setTab] = useState<Tab>("reports");
  const { data: session } = useCurrentUser();
  const [reportStatus, setReportStatus] = useState<"OPEN" | "RESOLVED_ACTIONED" | "RESOLVED_DISMISSED" | undefined>("OPEN");

  const { data: reportsData, isLoading: reportsLoading } = useReports({
    status: reportStatus,
    limit: 30,
  });
  const { data: auditData, isLoading: auditLoading } = useModAuditLog({ limit: 50 });

  const reports = reportsData?.reports ?? [];
  const auditEntries = auditData?.entries ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4 mb-8">
        <PageHeader eyebrow="Staff" title="Mod Dashboard" />
        <Link
          to="/modlog"
          className="label-military text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          Public modlog <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Tab strip */}
      <div className="flex border-b border-border mb-6">
        {([
          ["reports",  "Reports",   <ShieldAlert className="h-3.5 w-3.5" />],
          ["audit",    "Audit Log", <ClipboardList className="h-3.5 w-3.5" />],
          ["users",    "Users",     <Users className="h-3.5 w-3.5" />],
        ] as const).map(([t, label, icon]) => (
          <button
            key={t}
            onClick={() => setTab(t as Tab)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors -mb-px",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <>
          {/* Status filter */}
          <div className="flex gap-1 mb-4">
            {([
              ["OPEN", "Open"],
              ["RESOLVED_ACTIONED", "Actioned"],
              ["RESOLVED_DISMISSED", "Dismissed"],
              [undefined, "All"],
            ] as const).map(([value, label]) => (
              <button
                key={String(value)}
                onClick={() => setReportStatus(value)}
                className={cn(
                  "rounded px-3 py-1.5 label-military transition-colors",
                  reportStatus === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {reportsLoading ? (
            <SkeletonList count={5} height="h-28" />
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No reports in this category.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((r) => (
                <ReportRow key={r.id} report={r} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "users" && <UsersTab />}

      {tab === "audit" && (
        <div className="border border-border bg-card p-4">
          {auditLoading ? (
            <SkeletonList count={10} height="h-10" />
          ) : auditEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No audit entries yet.
            </p>
          ) : (
            <div>
              {auditEntries.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
