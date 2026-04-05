import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RemovalReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the reason string when the mod confirms */
  onConfirm: (reason: string) => void;
  isPending?: boolean;
  targetLabel?: string;
}

export function RemovalReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  targetLabel = "content",
}: RemovalReasonDialogProps) {
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  }

  function handleOpenChange(next: boolean) {
    if (!next) setReason("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {targetLabel}</DialogTitle>
          <DialogDescription>
            Provide a reason for removal. This is recorded in the audit log and
            shown to the author as &quot;[removed by moderator]&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            autoFocus
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for removal (required)..."
            maxLength={500}
            required
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
          />

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !reason.trim()}
              className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
            >
              {isPending ? "Removing…" : "Remove"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
