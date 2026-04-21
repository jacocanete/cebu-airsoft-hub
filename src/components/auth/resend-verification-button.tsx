import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useResendVerification } from "@/hooks/use-auth";

const COOLDOWN_MS = 60_000;

interface ResendVerificationButtonProps {
  email: string;
  className?: string;
}

export function ResendVerificationButton({ email, className }: ResendVerificationButtonProps) {
  const resend = useResendVerification();
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (cooldownUntil === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const remaining = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  const onCooldown = remaining > 0;

  useEffect(() => {
    if (cooldownUntil !== null && remaining === 0) {
      setCooldownUntil(null);
    }
  }, [cooldownUntil, remaining]);

  function handleClick() {
    if (onCooldown || resend.isPending) return;
    resend.mutate(email, {
      onSuccess: () => {
        toast.success("Verification email sent. Check your inbox.");
        setCooldownUntil(Date.now() + COOLDOWN_MS);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to send verification email");
      },
    });
  }

  const label = resend.isPending
    ? "Sending…"
    : onCooldown
      ? `Resend in ${remaining}s`
      : "Resend verification email";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={resend.isPending || onCooldown}
      className={
        className ??
        "flex h-10 w-full items-center justify-center gap-2 rounded border border-border bg-background text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-muted disabled:opacity-60 disabled:hover:bg-background"
      }
    >
      <Mail className="h-4 w-4" />
      {label}
    </button>
  );
}
