import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Mail,
  MailCheck,
  MailX,
  MessageSquare,
  Reply,
  ShieldX,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { formatRelativeTime } from "@/lib/format-time";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

export const Route = createFileRoute("/_main/notifications")({
  head: () => ({
    meta: [{ title: "Notifications | Cebu Airsoft Hub" }],
  }),
  component: NotificationsPage,
});

function NotifIcon({ type }: { type: NotificationType }) {
  const cls = "h-4 w-4 shrink-0 mt-0.5";
  switch (type) {
    case "comment_on_post":       return <MessageSquare className={cn(cls, "text-primary")} />;
    case "reply_to_comment":      return <Reply className={cn(cls, "text-blue-400")} />;
    case "group_join_request":    return <Users className={cn(cls, "text-primary")} />;
    case "group_join_approved":   return <Users className={cn(cls, "text-emerald-400")} />;
    case "group_join_rejected":   return <Users className={cn(cls, "text-red-400")} />;
    case "group_invite_received": return <Mail className={cn(cls, "text-primary")} />;
    case "group_invite_accepted": return <MailCheck className={cn(cls, "text-emerald-400")} />;
    case "group_invite_declined": return <MailX className={cn(cls, "text-muted-foreground")} />;
    default:                      return <ShieldX className={cn(cls, "text-red-400")} />;
  }
}

function notifDestination(type: NotificationType, relatedId: string) {
  switch (type) {
    case "group_join_request":
    case "group_join_approved":
    case "group_join_rejected":
    case "group_invite_received":
    case "group_invite_accepted":
    case "group_invite_declined":
      return { to: "/groups/$slug" as const, params: { slug: relatedId } };
    default:
      return { to: "/feed/$id" as const, params: { id: relatedId } };
  }
}

function NotifRow({ notif }: { notif: Notification }) {
  const navigate = useNavigate();
  const { markRead } = useMarkRead();

  function handleClick() {
    // Cache is patched synchronously inside markRead() — no microtask boundary,
    // no race with navigation / component unmount.
    if (!notif.read) {
      markRead(notif.id);
    }
    if (notif.relatedId) {
      navigate(notifDestination(notif.type, notif.relatedId));
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent cursor-pointer select-none",
        !notif.read && "bg-primary/5",
      )}
    >
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          notif.read ? "text-muted-foreground" : "text-foreground",
        )}>
          {notif.message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(notif.createdAt)}
        </p>
      </div>
      {!notif.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
}

function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { markAllRead, isPending: markAllReadPending } = useMarkAllRead();
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <PageHeader eyebrow="Activity" title="Notifications" />
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            disabled={markAllReadPending}
            className="label-military text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="border border-border bg-card divide-y divide-border">
        {isLoading ? (
          <div className="p-4">
            <SkeletonList count={5} height="h-12" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Bell className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => <NotifRow key={n.id} notif={n} />)
        )}
      </div>
    </div>
  );
}
