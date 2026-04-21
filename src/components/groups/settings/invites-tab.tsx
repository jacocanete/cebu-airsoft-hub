import { useMemo, useState, useEffect } from "react";
import { Search, Send, X } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatRelativeTime } from "@/lib/format-time";
import { useSearchUsers } from "@/hooks/use-search";
import {
  useCancelGroupInvite,
  useGroupInvites,
  useSendGroupInvite,
} from "@/hooks/use-groups";
import type { GroupDetail } from "@/types";

export function InvitesTab({ group }: { group: GroupDetail }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const { data: users = [], isLoading: searching } = useSearchUsers(debounced);
  const { data: invites = [], isLoading: loadingInvites } = useGroupInvites(
    group.slug,
    true,
  );

  const sendInvite = useSendGroupInvite(group.slug);
  const cancelInvite = useCancelGroupInvite(group.slug);

  const memberIds = useMemo(
    () => new Set(group.members.map((m) => m.userId)),
    [group.members],
  );
  const invitedIds = useMemo(
    () => new Set(invites.map((i) => i.invited.id)),
    [invites],
  );

  const candidates = useMemo(
    () =>
      users.filter((u) => !memberIds.has(u.id) && !invitedIds.has(u.id)),
    [users, memberIds, invitedIds],
  );

  function handleInvite(userId: string, name: string) {
    sendInvite.mutate(userId, {
      onSuccess: () => {
        toast.success(`Invite sent to ${name}`);
        setQuery("");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to send invite"),
    });
  }

  function handleCancel(inviteId: string, name: string) {
    cancelInvite.mutate(inviteId, {
      onSuccess: () => toast.success(`Invite to ${name} cancelled`),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to cancel"),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-military text-foreground mb-1.5">Invite a user</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name…"
            aria-label="Search users to invite"
            className="w-full rounded border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>

        {debounced.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {searching && (
              <p className="px-1 py-2 text-xs text-muted-foreground">Searching…</p>
            )}
            {!searching && candidates.length === 0 && (
              <p className="px-1 py-2 text-xs text-muted-foreground">
                No matches. (Existing members and invitees are hidden.)
              </p>
            )}
            {candidates.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 border border-border bg-card p-2.5"
              >
                <UserAvatar
                  name={u.name}
                  username={u.username}
                  avatar={u.avatar}
                  size="sm"
                  linkToProfile
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    u/{u.username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInvite(u.id, u.name)}
                  disabled={sendInvite.isPending}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  Invite
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="label-military text-foreground mb-2">Pending invites</p>
        {loadingInvites ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : invites.length === 0 ? (
          <div className="border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <p className="label-military text-muted-foreground">
              No pending invites.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 border border-border bg-card p-2.5"
              >
                <UserAvatar
                  name={inv.invited.name}
                  username={inv.invited.username}
                  avatar={inv.invited.avatar ?? undefined}
                  size="sm"
                  linkToProfile
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {inv.invited.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    u/{inv.invited.username} · invited by u/
                    {inv.invitedBy.username} · {formatRelativeTime(inv.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCancel(inv.id, inv.invited.name)}
                  disabled={cancelInvite.isPending}
                  aria-label={`Cancel invite for ${inv.invited.name}`}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
