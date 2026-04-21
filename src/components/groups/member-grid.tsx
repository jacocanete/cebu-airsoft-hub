import { Link } from "@tanstack/react-router";
import { Crown, ShieldAlert } from "lucide-react";
import type { GroupMember } from "@/types";

const ROLE_BADGE: Record<GroupMember["role"], { label: string; icon: typeof Crown; className: string } | null> = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  ADMIN: {
    label: "Admin",
    icon: ShieldAlert,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  MEMBER: null,
};

export function MemberGrid({ members }: { members: GroupMember[] }) {
  if (members.length === 0) {
    return (
      <div className="border border-border bg-card p-8 text-center">
        <p className="label-military text-muted-foreground">No operators yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {members.map((m) => {
        const badge = ROLE_BADGE[m.role];
        return (
          <Link
            key={m.userId}
            to="/profile/$username"
            params={{ username: m.user.username }}
            className="group flex flex-col border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent"
          >
            <div className="relative mb-3 aspect-square w-full overflow-hidden border border-border bg-muted">
              {m.user.avatar ? (
                <img
                  src={m.user.avatar}
                  alt={m.user.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-black text-primary">
                  {m.user.name[0].toUpperCase()}
                </div>
              )}
              {badge && (
                <span
                  className={`absolute left-1 top-1 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${badge.className}`}
                >
                  <badge.icon className="h-2.5 w-2.5" />
                  {badge.label}
                </span>
              )}
            </div>
            <p className="truncate text-xs font-black uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
              {m.user.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              u/{m.user.username}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
