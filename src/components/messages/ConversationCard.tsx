import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useCurrentUser } from "@/hooks/use-auth";
import type { ConversationListItem } from "@/types";

interface ConversationCardProps {
  conversation: ConversationListItem;
  isActive?: boolean;
}

export function ConversationCard({ conversation, isActive }: ConversationCardProps) {
  const { data: session } = useCurrentUser();
  const hasUnread = conversation.unreadCount > 0;

  const lastMsgPreview = conversation.lastMessage
    ? conversation.lastMessage.senderId === session?.user?.id
      ? `You: ${conversation.lastMessage.content}`
      : conversation.lastMessage.content
    : "No messages yet";

  return (
    <Link
      to="/messages/$id"
      params={{ id: conversation.id }}
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent",
        isActive && "bg-accent",
        hasUnread && !isActive && "bg-primary/5",
      )}
    >
      <UserAvatar
        name={conversation.participant.name}
        username={conversation.participant.username}
        size="sm"
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground",
            )}
          >
            {conversation.participant.name}
          </p>
          {conversation.lastMessageAt && (
            <span className="shrink-0 text-xs text-muted-foreground/60">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>

        <p className="mt-0.5 label-military truncate">{conversation.subject}</p>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-xs",
              hasUnread ? "text-foreground/80" : "text-muted-foreground",
            )}
          >
            {lastMsgPreview}
          </p>
          {hasUnread && (
            <span className="flex h-4 min-w-[1rem] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
