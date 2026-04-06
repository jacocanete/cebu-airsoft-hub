import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { formatRelativeTime } from "@/lib/format-time";
import { usePublicAuditLog } from "@/hooks/use-audit";
import type { AuditLogEntry } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_main/modlog")({
  head: () => ({
    meta: [{ title: "Mod Log | Cebu Airsoft Hub" }],
  }),
  component: ModlogPage,
});

// Human-readable labels for each audit action
const ACTION_LABELS: Record<string, string> = {
  POST_REMOVED:    "removed a post",
  POST_RESTORED:   "restored a post",
  POST_PINNED:     "pinned a post",
  POST_UNPINNED:   "unpinned a post",
  POST_LOCKED:     "locked a post",
  POST_UNLOCKED:   "unlocked a post",
  COMMENT_REMOVED: "removed a comment",
  COMMENT_RESTORED:"restored a comment",
  LISTING_REMOVED: "removed a listing",
  LISTING_RESTORED:"restored a listing",
  EVENT_CANCELLED: "cancelled an event",
  GROUP_REMOVED:   "removed a group",
  USER_BANNED:     "banned a user",
  USER_UNBANNED:   "unbanned a user",
  USER_ROLE_CHANGED:"changed a user's role",
  REPORT_DISMISSED:"dismissed a report",
  REPORT_RESOLVED: "resolved a report",
};

const ACTION_COLORS: Record<string, string> = {
  POST_REMOVED:    "text-red-400",
  COMMENT_REMOVED: "text-red-400",
  LISTING_REMOVED: "text-red-400",
  GROUP_REMOVED:   "text-red-400",
  EVENT_CANCELLED: "text-red-400",
  USER_BANNED:     "text-red-400",
  POST_RESTORED:   "text-emerald-400",
  COMMENT_RESTORED:"text-emerald-400",
  LISTING_RESTORED:"text-emerald-400",
  USER_UNBANNED:   "text-emerald-400",
  POST_PINNED:     "text-primary",
  POST_UNPINNED:   "text-muted-foreground",
  POST_LOCKED:     "text-amber-400",
  POST_UNLOCKED:   "text-emerald-400",
};

function AuditRow({ entry }: { entry: AuditLogEntry }) {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const color = ACTION_COLORS[entry.action] ?? "text-muted-foreground";

  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/40" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <Link
            to="/profile/$username"
            params={{ username: entry.actor.username }}
            className="font-bold text-foreground hover:text-primary transition-colors"
          >
            u/{entry.actor.username}
          </Link>{" "}
          <span className={cn("font-medium", color)}>{label}</span>
          {entry.reason && (
            <span className="text-muted-foreground"> — {entry.reason}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(entry.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ModlogPage() {
  const { data, isLoading } = usePublicAuditLog({ limit: 50 });
  const entries = data?.entries ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4 mb-8">
        <PageHeader
          eyebrow="Transparency"
          title="Mod Log"
          description="A public record of all moderator actions on this platform."
        />
      </div>

      <div className="border border-border bg-card p-4">
        {isLoading ? (
          <SkeletonList count={10} height="h-10" />
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No moderation actions recorded yet.
          </p>
        ) : (
          <div>
            {entries.map((entry) => (
              <AuditRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
