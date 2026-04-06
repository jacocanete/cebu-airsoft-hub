import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { ConversationCard } from "@/components/messages/ConversationCard";
import { useConversations } from "@/hooks/use-messages";

export const Route = createFileRoute("/_main/messages/")({
  head: () => ({
    meta: [{ title: "Inbox | Detachment Reaper" }],
  }),
  component: InboxPage,
});

function InboxPage() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations();

  const conversations = data?.pages.flatMap((p) => p.conversations) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <PageHeader eyebrow="Comms" title="Inbox" />
      </div>

      <div className="border border-border bg-card divide-y divide-border">
        {isLoading ? (
          <div className="p-4">
            <SkeletonList count={5} height="h-14" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Mail className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Start a conversation from a user&apos;s profile or an event page.
            </p>
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationCard key={c.id} conversation={c} />
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="label-military text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading…" : "Load more conversations"}
          </button>
        </div>
      )}
    </div>
  );
}
