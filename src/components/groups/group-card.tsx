import { Link } from "@tanstack/react-router";
import { Shield, Users } from "lucide-react";
import { MOCK_GROUPS } from "@/lib/mock-data";

export function GroupCard({ group }: { group: (typeof MOCK_GROUPS)[number] }) {
  return (
    <Link
      to="/groups/$slug"
      params={{ slug: group.slug }}
      className="group flex flex-col border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="flex h-12 w-12 items-center justify-center border border-primary/30 bg-primary/10 shrink-0">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {group.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {group.memberCount} operators
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
        {group.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {group.memberCount} members
        </span>
        <span className="inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {group.gameCount} games
        </span>
      </div>
    </Link>
  );
}
