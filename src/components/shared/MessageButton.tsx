import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCreateConversation } from "@/hooks/use-messages";
import { useIsBlocked } from "@/hooks/use-blocks";
import { ApiError } from "@/lib/api";
import type { ConversationContext } from "@/types";

interface MessageButtonProps {
  recipientId: string;
  recipientName: string;
  contextType?: ConversationContext;
  contextId?: string;
  /** Optional default message text — useful for contextual initiation */
  defaultMessage?: string;
  className?: string;
  variant?: "default" | "ghost";
}

export function MessageButton({
  recipientId,
  recipientName,
  contextType,
  contextId,
  defaultMessage,
  className = "",
  variant = "default",
}: MessageButtonProps) {
  const navigate = useNavigate();
  const { data: session } = useCurrentUser();
  const { mutate: createConversation, isPending } = useCreateConversation();
  const isBlocked = useIsBlocked(recipientId);

  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState(
    defaultMessage ?? `Hi ${recipientName}!`,
  );

  // Close modal on Escape
  useEffect(() => {
    if (!showPrompt) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowPrompt(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showPrompt]);

  // Don't render for unauthenticated users, own profile, or blocked users
  if (!session?.user || session.user.id === recipientId || isBlocked) {
    return null;
  }

  function handleSend() {
    if (!message.trim()) return;
    createConversation(
      { recipientId, initialMessage: message.trim(), contextType, contextId },
      {
        onSuccess: ({ conversationId }) => {
          setShowPrompt(false);
          navigate({ to: "/messages/$id", params: { id: conversationId } });
        },
        onError: (err) => {
          const msg =
            err instanceof ApiError && err.status === 403
              ? "You can't message this user."
              : "Failed to send message. Please try again.";
          toast.error(msg);
        },
      },
    );
  }

  const buttonClasses =
    variant === "ghost"
      ? `flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors ${className}`
      : `flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent ${className}`;

  return (
    <>
      <button
        onClick={() => setShowPrompt(true)}
        disabled={isPending}
        aria-label={`Message ${recipientName}`}
        className={buttonClasses}
      >
        <Mail className="h-3.5 w-3.5" />
        Message
      </button>

      {showPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Message ${recipientName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrompt(false);
          }}
        >
          <div className="w-full max-w-sm rounded border border-border bg-card p-5 shadow-xl">
            <p className="label-military text-primary mb-1">New Message</p>
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground mb-4">
              To: {recipientName}
            </h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              autoFocus
              className="w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Write your message…"
            />

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPrompt(false)}
                className="label-military text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isPending}
                className="rounded bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50 glow-red"
              >
                {isPending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
