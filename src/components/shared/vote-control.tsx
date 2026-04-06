import { ChevronUp, ChevronDown } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AnimatedCount } from "@/components/shared/animated-count";

interface VoteControlProps {
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | 0;
  onVote: (value: 1 | -1 | 0) => void;
  isPending?: boolean;
  layout?: "vertical" | "horizontal";
}

export function VoteControl({
  upvotes,
  downvotes,
  userVote,
  onVote,
  isPending = false,
  layout = "vertical",
}: VoteControlProps) {
  const requireAuth = useRequireAuth();
  const score = upvotes - downvotes;

  function handleVote(value: 1 | -1) {
    // Toggle: clicking the active vote removes it
    const next: 1 | -1 | 0 = userVote === value ? 0 : value;
    requireAuth(() => onVote(next));
  }

  const scoreColor =
    userVote === 1
      ? "text-primary"
      : userVote === -1
        ? "text-destructive"
        : "text-muted-foreground";

  const isVertical = layout === "vertical";

  return (
    <div
      className={`flex items-center gap-0.5 ${isVertical ? "flex-col" : "flex-row"}`}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          handleVote(1);
        }}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        disabled={isPending}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded cursor-pointer transition-colors disabled:cursor-not-allowed ${
          userVote === 1
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        {/* key change replays the animation when vote state changes */}
        <ChevronUp
          key={`up-${userVote}`}
          className={`${isVertical ? "h-4 w-4" : "h-3.5 w-3.5"} ${userVote === 1 ? "animate-vote-pop" : ""}`}
        />
      </button>

      <span aria-hidden="true">
        <AnimatedCount
          value={score}
          className={`text-xs font-bold min-w-[1.25rem] text-center tabular-nums ${scoreColor}`}
        />
      </span>
      <span className="sr-only">score: {score}</span>

      <button
        onClick={(e) => {
          e.preventDefault();
          handleVote(-1);
        }}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        disabled={isPending}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded cursor-pointer transition-colors disabled:cursor-not-allowed ${
          userVote === -1
            ? "text-destructive"
            : "text-muted-foreground hover:text-destructive"
        }`}
      >
        <ChevronDown
          key={`down-${userVote}`}
          className={`${isVertical ? "h-4 w-4" : "h-3.5 w-3.5"} ${userVote === -1 ? "animate-vote-pop" : ""}`}
        />
      </button>
    </div>
  );
}
