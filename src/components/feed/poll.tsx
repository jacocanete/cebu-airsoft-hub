import { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { POLL_STATUS_COLORS } from "@/lib/constants";
import type { PollData } from "@/types";

interface PollProps {
  poll: PollData;
}

export function Poll({ poll }: PollProps) {
  const [voted, setVoted] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    if (voted) return;
    if (poll.multiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const handleVote = () => {
    if (selected.length === 0) return;
    setVoted(true);
  };

  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

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

      <div className="flex flex-col gap-2 mb-4">
        {poll.options.map((option) => {
          const pct = voted || poll.status === "closed"
            ? Math.round((option.votes / (poll.totalVotes || 1)) * 100)
            : 0;
          const isSelected = selected.includes(option.id);
          const isWinner = option.votes === maxVotes;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={voted || poll.status === "closed"}
              className={`relative w-full text-left rounded border overflow-hidden transition-colors ${
                isSelected && !voted
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              } ${voted || poll.status === "closed" ? "cursor-default" : "cursor-pointer"}`}
            >
              {/* Vote bar behind */}
              {(voted || poll.status === "closed") && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    isWinner ? "bg-primary/20" : "bg-muted/60"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-3 py-2.5 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Checkbox/radio indicator */}
                  {!voted && poll.status === "open" && (
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? "border-primary bg-primary" : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </span>
                  )}
                  {voted && isSelected && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {option.text}
                  </span>
                </div>

                {(voted || poll.status === "closed") && (
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
      <div className="flex items-center justify-between gap-4">
        <p className="label-military text-muted-foreground/60">
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
          {poll.multiSelect && " · Multiple choice"}
          {poll.expiresAt && ` · Closes ${poll.expiresAt}`}
        </p>
        {!voted && poll.status === "open" && (
          <button
            onClick={handleVote}
            disabled={selected.length === 0}
            className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Vote
          </button>
        )}
        {voted && (
          <button
            onClick={() => { setVoted(false); setSelected([]); }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors label-military"
          >
            Change vote
          </button>
        )}
      </div>
    </div>
  );
}
