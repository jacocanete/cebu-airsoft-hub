import { ShieldX } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-time";

interface RemovedPlaceholderProps {
  deletedByAuthor: boolean;
  deletedBy: { username: string } | null;
  deletedAt: string;
  /** When true, mods can see the original content via a "Show original" affordance. Future feature. */
  className?: string;
}

export function RemovedPlaceholder({
  deletedByAuthor,
  deletedBy,
  deletedAt,
  className,
}: RemovedPlaceholderProps) {
  const who = deletedByAuthor
    ? "author"
    : deletedBy
      ? `u/${deletedBy.username}`
      : "moderator";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs italic text-muted-foreground/50 ${className ?? ""}`}
    >
      <ShieldX className="h-3 w-3 shrink-0" aria-hidden />
      [removed by {who} · {formatRelativeTime(deletedAt)}]
    </span>
  );
}
