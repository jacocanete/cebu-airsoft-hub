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
import { useCreateReport } from "@/hooks/use-reports";
import type { ModerationTarget, ReportCategory } from "@/types";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment / bullying" },
  { value: "HATE_SPEECH", label: "Hate speech" },
  { value: "NSFW", label: "NSFW / inappropriate" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OFF_TOPIC", label: "Off-topic" },
  { value: "CHEATING_ACCUSATION_WITHOUT_PROOF", label: "Cheating accusation without proof" },
  { value: "DOXXING", label: "Doxxing / personal info leak" },
  { value: "OTHER", label: "Other" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ModerationTarget;
  targetId: string;
  targetLabel?: string;
}

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetLabel = "content",
}: ReportDialogProps) {
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [reason, setReason] = useState("");
  const createReport = useCreateReport();

  function handleClose(next: boolean) {
    if (!next) {
      setCategory("");
      setReason("");
    }
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;

    createReport.mutate(
      {
        targetType,
        targetId,
        category,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Report submitted", {
            description: "Our moderators will review it shortly.",
          });
          handleClose(false);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Failed to submit report";
          toast.error(msg);
        },
      },
    );
  }

  const needsReason = category === "OTHER";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {targetLabel}</DialogTitle>
          <DialogDescription>
            Select the reason that best describes the issue. Reports are reviewed by our moderators.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="label-military text-foreground mb-1">Reason</legend>
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  value={c.value}
                  checked={category === c.value}
                  onChange={() => setCategory(c.value)}
                  className="accent-primary"
                />
                {c.label}
              </label>
            ))}
          </fieldset>

          {(needsReason || category) && (
            <div>
              <label className="label-military text-foreground mb-1.5 block">
                Additional context {needsReason ? "(required)" : "(optional)"}
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue..."
                required={needsReason}
                maxLength={1000}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
              />
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createReport.isPending ||
                !category ||
                (needsReason && !reason.trim())
              }
              className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
            >
              {createReport.isPending ? "Submitting…" : "Submit report"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
