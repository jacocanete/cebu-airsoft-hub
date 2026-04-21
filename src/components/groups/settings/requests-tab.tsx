import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatRelativeTime } from "@/lib/format-time";
import { useGroupJoinRequests, useRespondToJoinRequest } from "@/hooks/use-groups";

export function RequestsTab({ slug }: { slug: string }) {
  const { data: requests = [], isLoading } = useGroupJoinRequests(slug, true);
  const respond = useRespondToJoinRequest(slug);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading requests…</p>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="border border-dashed border-border bg-card/50 px-4 py-10 text-center">
        <p className="label-military text-muted-foreground">No pending requests.</p>
      </div>
    );
  }

  function handle(requestId: string, action: "approve" | "reject", name: string) {
    respond.mutate(
      { requestId, action },
      {
        onSuccess: () =>
          toast.success(
            action === "approve"
              ? `${name} added to the group`
              : `Request from ${name} declined`,
          ),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to respond"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((r) => (
        <div key={r.id} className="flex flex-col gap-3 border border-border bg-card p-3 sm:flex-row sm:items-start">
          <UserAvatar
            name={r.user.name}
            username={r.user.username}
            avatar={r.user.avatar ?? undefined}
            size="md"
            linkToProfile
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {r.user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              u/{r.user.username} · {formatRelativeTime(r.createdAt)}
            </p>
            {r.message && (
              <p className="mt-2 border-l-2 border-primary/40 pl-2 text-xs text-foreground/80 leading-relaxed">
                {r.message}
              </p>
            )}
            {r.user.bio && (
              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                {r.user.bio}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handle(r.id, "approve", r.user.name)}
              disabled={respond.isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => handle(r.id, "reject", r.user.name)}
              disabled={respond.isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
