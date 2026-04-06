import { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { POLL_STATUS_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format-time";
import { usePollVote } from "@/hooks/use-polls";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { PollData } from "@/types";

interface PollProps {
  poll: PollData;
}

export function Poll({ poll }: PollProps) {
  const pollVote = usePollVote(poll.postId, poll.id);
  const requireAuth = useRequireAuth();

  // Local selection state — tracks what the user has checked but not yet submitted,
  // OR the "change vote" pending selection (when re-voting after already voted).
  const hasVoted = poll.userVotes.length > 0;
  const [isChangingVote, setIsChangingVote] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);

  const showResults = (hasVoted && !isChangingVote) || poll.status === "closed";
  // Use pendingSelection when the user is actively picking (first-time vote or
  // change-vote mode). Fall back to poll.userVotes only in read-only results mode.
  const activeSelection = (!hasVoted || isChangingVote) ? pendingSelection : poll.userVotes;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

  function handleSelect(id: string) {
    if (showResults) return;
    if (poll.multiSelect) {
      setPendingSelection((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
      );
    } else {
      setPendingSelection([id]);
    }
  }

  function handleVote() {
    const selection = pendingSelection;
    if (selection.length === 0) return;

    requireAuth(() => {
      pollVote.mutate(selection, {
        onSuccess: () => {
          setIsChangingVote(false);
          setPendingSelection([]);
        },
      });
    });
  }

  function handleChangeVote() {
    setPendingSelection([...poll.userVotes]);
    setIsChangingVote(true);
  }

  function handleCancelChange() {
    setPendingSelection([]);
    setIsChangingVote(false);
  }

  const canVote = poll.status === "open";

  return (
    <div className="border border-primary/20 bg-primary/5 p-5 my-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-sm font-bold uppercase tracking-wide text-foreground">
          {poll.question}
        </p>
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${POLL_STATUS_COLORS[poll.status]}`}
        >
          {poll.status === "open" ? (
            <><Clock className="h-3 w-3" /> Open</>
          ) : (
            "Closed"
          )}
        </span>
      </div>

      {/* Live region announces result changes to screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {showResults && `Poll results: ${poll.options.map((o) => {
          const pct = Math.round((o.votes / (totalVotes || 1)) * 100);
          return `${o.text} ${pct}%`;
        }).join(", ")}`}
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {poll.options.map((option) => {
          const pct = showResults
            ? Math.round((option.votes / (totalVotes || 1)) * 100)
            : 0;
          const isSelected = activeSelection.includes(option.id);
          const isUserVote = poll.userVotes.includes(option.id);
          const isWinner = option.votes === maxVotes && totalVotes > 0;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={showResults || !canVote || pollVote.isPending}
              aria-pressed={!showResults ? isSelected : undefined}
              className={`relative w-full text-left rounded border overflow-hidden transition-colors ${
                isSelected && !showResults
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              } ${showResults || !canVote ? "cursor-default" : "cursor-pointer"} disabled:pointer-events-none`}
            >
              {/* Vote bar — shown when in results mode */}
              {showResults && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    isWinner ? "bg-primary/20" : "bg-muted/60"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-3 py-2.5 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Selection indicator — only shown when not in results mode */}
                  {!showResults && canVote && (
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center ${poll.multiSelect ? "rounded" : "rounded-full"} border ${
                        isSelected ? "border-primary bg-primary" : "border-border bg-background"
                      }`}
                    >
                      {isSelected && (
                        <span className={`${poll.multiSelect ? "h-2.5 w-2.5" : "h-2 w-2 rounded-full"} bg-primary-foreground`} />
                      )}
                    </span>
                  )}
                  {/* Checkmark for the user's actual voted choice in results mode */}
                  {showResults && isUserVote && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {option.text}
                  </span>
                </div>

                {showResults && (
                  <span className={`shrink-0 text-xs font-black ${isWinner ? "text-primary" : "text-muted-foreground"}`}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="label-military text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          {poll.multiSelect && " · Multiple choice"}
          {poll.expiresAt && ` · Closes ${formatRelativeTime(poll.expiresAt)}`}
        </p>

        <div className="flex items-center gap-2">
          {/* Show vote button when not in results mode and poll is open */}
          {!showResults && canVote && (
            <>
              {isChangingVote && (
                <button
                  type="button"
                  onClick={handleCancelChange}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors label-military"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleVote}
                disabled={pendingSelection.length === 0 || pollVote.isPending}
                className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pollVote.isPending ? "Voting…" : isChangingVote ? "Update vote" : "Vote"}
              </button>
            </>
          )}

          {/* Change vote — shown when in results mode and poll is still open */}
          {showResults && canVote && hasVoted && !isChangingVote && (
            <button
              type="button"
              onClick={handleChangeVote}
              className="text-xs text-muted-foreground hover:text-primary transition-colors label-military"
            >
              Change vote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
