import { useState } from "react";
import { Crown, ShieldAlert, UserX } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useChangeMemberRole, useKickMember } from "@/hooks/use-groups";
import type { GroupDetail, GroupMember, GroupRole, SessionUser } from "@/types";

const ROLE_LABEL: Record<GroupRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export function MembersTab({
  group,
  viewer,
}: {
  group: GroupDetail;
  viewer: SessionUser;
}) {
  const viewerRole = group.viewerMembership?.role ?? "MEMBER";

  return (
    <div className="flex flex-col gap-2">
      {group.members.map((m) => (
        <MemberRow
          key={m.userId}
          slug={group.slug}
          member={m}
          viewer={viewer}
          viewerRole={viewerRole}
        />
      ))}
    </div>
  );
}

function MemberRow({
  slug,
  member,
  viewer,
  viewerRole,
}: {
  slug: string;
  member: GroupMember;
  viewer: SessionUser;
  viewerRole: GroupRole;
}) {
  const [kickOpen, setKickOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const kick = useKickMember(slug);
  const changeRole = useChangeMemberRole(slug);

  const isSelf = member.userId === viewer.id;
  const isTargetOwner = member.role === "OWNER";
  const viewerIsOwner = viewerRole === "OWNER";

  // Owner can remove admins and members. Admins can only remove members.
  const canKick =
    !isSelf &&
    !isTargetOwner &&
    (viewerIsOwner || member.role === "MEMBER");

  const canChangeRole = viewerIsOwner && !isSelf && !isTargetOwner;

  function handleKick() {
    kick.mutate(member.userId, {
      onSuccess: () => {
        toast.success(`${member.user.name} removed`);
        setKickOpen(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to remove"),
    });
  }

  function handleRoleChange(role: GroupRole) {
    if (role === "OWNER") {
      setTransferOpen(true);
      return;
    }
    changeRole.mutate(
      { userId: member.userId, role },
      {
        onSuccess: () => toast.success(`Role changed to ${ROLE_LABEL[role]}`),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to change role"),
      },
    );
  }

  function handleTransfer() {
    changeRole.mutate(
      { userId: member.userId, role: "OWNER" },
      {
        onSuccess: () => {
          toast.success(`${member.user.name} is now the owner`);
          setTransferOpen(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Transfer failed"),
      },
    );
  }

  return (
    <div className="flex items-center gap-3 border border-border bg-card p-3">
      <UserAvatar
        name={member.user.name}
        username={member.user.username}
        avatar={member.user.avatar ?? undefined}
        size="md"
        linkToProfile
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold text-foreground">
          {member.user.name}
          {isSelf && (
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
              (you)
            </span>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          u/{member.user.username}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {canChangeRole ? (
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value as GroupRole)}
            aria-label={`Change role for ${member.user.name}`}
            className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground outline-none ring-primary focus:ring-1"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Transfer ownership</option>
          </select>
        ) : (
          <span
            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              member.role === "OWNER"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : member.role === "ADMIN"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {member.role === "OWNER" ? (
              <Crown className="h-3 w-3" />
            ) : member.role === "ADMIN" ? (
              <ShieldAlert className="h-3 w-3" />
            ) : null}
            {ROLE_LABEL[member.role]}
          </span>
        )}

        {canKick && (
          <button
            type="button"
            onClick={() => setKickOpen(true)}
            aria-label={`Remove ${member.user.name}`}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <UserX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Dialog open={kickOpen} onOpenChange={setKickOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {member.user.name}?</DialogTitle>
            <DialogDescription>
              They'll lose access to the group feed. You can invite them back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setKickOpen(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleKick}
              disabled={kick.isPending}
              className="rounded border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
            >
              {kick.isPending ? "Removing…" : "Remove"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer ownership to {member.user.name}?</DialogTitle>
            <DialogDescription>
              You will be demoted to Admin. Only the new owner can transfer ownership back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setTransferOpen(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={changeRole.isPending}
              className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
            >
              {changeRole.isPending ? "Transferring…" : "Confirm transfer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
