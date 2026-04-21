import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Clock, Lock, LogIn, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { RequestJoinDialog } from "@/components/groups/request-join-dialog";
import { useRespondToGroupInvite } from "@/hooks/use-groups";
import type { GroupDetail, SessionUser } from "@/types";

export function JoinButton({
  group,
  viewer,
}: {
  group: GroupDetail;
  viewer: SessionUser | null;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const respond = useRespondToGroupInvite();

  if (!viewer) {
    return (
      <Link
        to="/login"
        search={{ redirect: `/groups/${group.slug}` }}
        className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <LogIn className="h-3.5 w-3.5" />
        Log in to join
      </Link>
    );
  }

  if (group.viewerMembership) {
    return null;
  }

  if (group.viewerInvite?.status === "PENDING") {
    const inviteId = group.viewerInvite.id;
    function handle(action: "accept" | "decline") {
      respond.mutate(
        { inviteId, action },
        {
          onSuccess: () =>
            toast.success(action === "accept" ? "Welcome aboard" : "Invite declined"),
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : "Failed to respond"),
        },
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => handle("accept")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" />
          Accept
        </button>
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => handle("decline")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" />
          Decline
        </button>
      </div>
    );
  }

  if (group.viewerJoinRequest?.status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Request pending
      </span>
    );
  }

  if (group.joinPolicy === "INVITE_ONLY") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Invite only
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Request to join
      </button>
      <RequestJoinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slug={group.slug}
        groupName={group.name}
      />
    </>
  );
}
