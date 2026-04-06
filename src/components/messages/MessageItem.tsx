import { Trash2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessageEmbed } from "@/components/messages/MessageEmbed";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDeleteMessage } from "@/hooks/use-messages";
import type { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  conversationId: string;
  isLast: boolean;
}

export function MessageItem({ message, conversationId, isLast }: MessageItemProps) {
  const { data: session } = useCurrentUser();
  const { mutate: deleteMessage } = useDeleteMessage(conversationId);
  const isMine = message.senderId === session?.user?.id;
  const isDeleted = !!message.deletedAt;

  return (
    <div
      className={cn(
        "group flex gap-2.5",
        isMine ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isMine && (
        <UserAvatar
          name={message.sender.name}
          username={message.sender.username}
          size="sm"
          className="mt-1 shrink-0"
        />
      )}

      <div className={cn("max-w-[75%] min-w-0", isMine && "items-end flex flex-col")}>
        {!isMine && (
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {message.sender.name}
          </p>
        )}

        <div
          className={cn(
            "rounded px-3 py-2 text-sm",
            isDeleted
              ? "italic text-muted-foreground bg-accent/50"
              : isMine
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-foreground",
          )}
        >
          {isDeleted ? (
            "Message deleted"
          ) : (
            <>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              {message.embed && <MessageEmbed embed={message.embed} />}
            </>
          )}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/60",
            isMine && "flex-row-reverse",
          )}
        >
          <span>{formatRelativeTime(message.createdAt)}</span>

          {isMine && !isDeleted && (
            <>
              {/* Read receipt — only show on last sent message */}
              {isLast && message.readAt && (
                <CheckCheck className="h-3 w-3 text-primary" aria-label="Seen" />
              )}
              {/* Delete button — visible on hover */}
              <button
                onClick={() => deleteMessage(message.id)}
                aria-label="Delete message"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/60 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
