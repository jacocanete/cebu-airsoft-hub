import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";

// 100dvh (dynamic viewport height) correctly accounts for mobile browser chrome
// (address bar, bottom nav) on iOS Safari where 100vh includes hidden UI areas.
const THREAD_CONTAINER_STYLE: CSSProperties = { height: "calc(100dvh - 56px)" };
import { ArrowLeft, ShieldOff, ShieldCheck } from "lucide-react";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessageItem } from "@/components/messages/MessageItem";
import { MessageInput } from "@/components/messages/MessageInput";
import { useConversation, useMessages, useMarkConversationRead, conversationQueryOptions } from "@/hooks/use-messages";
import { useBlockUser, useUnblockUser, useIsBlocked } from "@/hooks/use-blocks";
import { useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/_main/messages/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(conversationQueryOptions(params.id)),
  pendingComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <SkeletonList count={3} height="h-10" />
    </div>
  ),
  head: () => ({
    meta: [{ title: "Message | Cebu Airsoft Hub" }],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { id } = Route.useParams();
  const { data: session } = useCurrentUser();
  const { data: conversation } = useConversation(id);
  const { data: messagesData, isLoading: msgsLoading, fetchNextPage, hasNextPage } =
    useMessages(id);
  const { markRead } = useMarkConversationRead(id);
  const { mutate: blockUser } = useBlockUser();
  const { mutate: unblockUser } = useUnblockUser();
  const isBlocked = useIsBlocked(conversation.participant.id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didMarkRead = useRef(false);

  // All messages in chronological order (infinite query returns newest-first pages)
  const allMessages = useMemo(
    () => (messagesData?.pages ?? []).flatMap((p) => p.messages).reverse(),
    [messagesData],
  );

  // Mark conversation as read once on mount
  useEffect(() => {
    if (didMarkRead.current) return;
    didMarkRead.current = true;
    markRead();
  }, [markRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  return (
    <div
      className="mx-auto flex max-w-2xl flex-col px-4 sm:px-6"
      style={THREAD_CONTAINER_STYLE}
    >
      {/* Thread header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border py-4">
        <Link
          to="/messages"
          aria-label="Back to inbox"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <UserAvatar
          name={conversation.participant.name}
          username={conversation.participant.username}
          size="sm"
          linkToProfile
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground leading-none">
            {conversation.participant.name}
          </p>
          <p className="label-military mt-0.5 truncate">{conversation.subject}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Conversation options"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isBlocked ? (
              <DropdownMenuItem
                onSelect={() => unblockUser(conversation.participant.id)}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Unblock user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => blockUser(conversation.participant.id)}
                className="flex items-center gap-2"
              >
                <ShieldOff className="h-3.5 w-3.5" />
                Block user
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages — flex-1 + min-h-0 lets this shrink inside the fixed-height
          parent. overflow-y-auto makes only this region scroll. */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="label-military mx-auto text-muted-foreground hover:text-primary transition-colors"
          >
            Load older messages
          </button>
        )}

        {msgsLoading ? (
          <SkeletonList count={5} height="h-10" />
        ) : allMessages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Send the first one below.
          </p>
        ) : (
          allMessages.map((message, idx) => {
            const isMine = message.senderId === session?.user?.id;
            const isLastSentByMe =
              isMine &&
              !allMessages.slice(idx + 1).some((m) => m.senderId === session?.user?.id);

            return (
              <MessageItem
                key={message.id}
                message={message}
                conversationId={id}
                isLast={isLastSentByMe}
              />
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — shrink-0 keeps it pinned at the bottom */}
      <div className={cn("shrink-0 border-t border-border py-4", isBlocked && "opacity-50 pointer-events-none")}>
        {isBlocked ? (
          <p className="text-center text-sm text-muted-foreground py-2">
            You have blocked this user.
          </p>
        ) : (
          <MessageInput conversationId={id} />
        )}
      </div>
    </div>
  );
}
