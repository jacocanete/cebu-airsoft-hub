import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "idle" | "copied" | "error";

interface ShareButtonProps {
  /** URL to copy. Defaults to `window.location.href` at click time. */
  url?: string;
  /** Idle-state label. Defaults to "Share". */
  label?: string;
  className?: string;
}

export function ShareButton({ url, label = "Share", className }: ShareButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  // Reset to idle after 1.8 s. Cleanup on unmount prevents stale-state warnings.
  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), 1800);
    return () => clearTimeout(t);
  }, [status]);

  async function handleClick() {
    const href = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (!href) return;

    try {
      await navigator.clipboard.writeText(href);
      setStatus("copied");
    } catch {
      setStatus("error");
      toast.error("Couldn't copy link", {
        description: "Your browser blocked clipboard access.",
      });
    }
  }

  const copied = status === "copied";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      aria-label={copied ? "Link copied" : "Copy link to share"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-3 py-1.5 label-military transition-all duration-200 motion-reduce:transition-none",
        copied
          ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {/* Icon wrapper — fixed dimensions so the button width doesn't shift */}
      <span className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        <Share2
          className={cn(
            "absolute h-3.5 w-3.5 transition-all duration-200 motion-reduce:transition-none",
            copied
              ? "rotate-12 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100",
          )}
          aria-hidden
        />
        <Check
          className={cn(
            "absolute h-3.5 w-3.5 transition-all duration-200 motion-reduce:transition-none",
            copied
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-12 scale-50 opacity-0",
          )}
          aria-hidden
        />
      </span>

      <span className="transition-colors duration-200 motion-reduce:transition-none">
        {copied ? "Copied!" : label}
      </span>
    </button>
  );
}
