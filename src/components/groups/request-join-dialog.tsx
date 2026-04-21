import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRequestJoinGroup } from "@/hooks/use-groups";

const MAX_MESSAGE = 280;

export function RequestJoinDialog({
  open,
  onOpenChange,
  slug,
  groupName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slug: string;
  groupName: string;
}) {
  const [message, setMessage] = useState("");
  const request = useRequestJoinGroup(slug);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    request.mutate(trimmed.length > 0 ? trimmed : undefined, {
      onSuccess: () => {
        toast.success("Request sent");
        onOpenChange(false);
        setMessage("");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to send request"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to join {groupName}</DialogTitle>
          <DialogDescription>
            Admins will review your request. Add a short message so they know who you
            are — optional but helps.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="join-message"
              className="label-military text-foreground mb-1.5 block"
            >
              Message (optional)
            </label>
            <textarea
              id="join-message"
              autoFocus
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              placeholder="Who are you? How often do you play?"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {message.length}/{MAX_MESSAGE}
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={request.isPending}
              className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
            >
              {request.isPending ? "Sending…" : "Send Request"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
