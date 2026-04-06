import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { useSendMessage } from "@/hooks/use-messages";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [value, setValue] = useState("");
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isPending) return;
    sendMessage(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Submit on Enter (not Shift+Enter which adds a newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    // Auto-grow up to ~5 lines
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
        rows={1}
        className="flex-1 resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        style={{ minHeight: "2.25rem", maxHeight: "7.5rem" }}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={!value.trim() || isPending}
        aria-label="Send message"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50 disabled:cursor-not-allowed glow-red"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
