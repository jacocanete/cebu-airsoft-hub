import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROSE_CLASSES } from "@/lib/prose";
import {
  Bold,
  Italic,
  Link2,
  Image,
  Code,
  Quote,
  List,
  ListOrdered,
} from "lucide-react";

interface PostEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: (selected: string) => { text: string; offset: number };
}

const TOOLBAR: ToolbarButton[] = [
  {
    icon: Bold,
    label: "Bold",
    action: (s) => ({ text: `**${s || "bold text"}**`, offset: s ? 0 : 2 }),
  },
  {
    icon: Italic,
    label: "Italic",
    action: (s) => ({ text: `*${s || "italic text"}*`, offset: s ? 0 : 1 }),
  },
  {
    icon: Link2,
    label: "Link",
    action: (s) => ({ text: `[${s || "link text"}](url)`, offset: s ? 0 : 1 }),
  },
  {
    icon: Image,
    label: "Image",
    action: (s) => ({ text: `![${s || "alt text"}](image-url)`, offset: s ? 0 : 2 }),
  },
  {
    icon: Code,
    label: "Code",
    action: (s) => ({ text: `\`${s || "code"}\``, offset: s ? 0 : 1 }),
  },
  {
    icon: Quote,
    label: "Blockquote",
    action: (s) => ({ text: `> ${s || "quote"}`, offset: s ? 0 : 2 }),
  },
  {
    icon: List,
    label: "Bullet list",
    action: (s) => ({ text: `- ${s || "item"}`, offset: s ? 0 : 2 }),
  },
  {
    icon: ListOrdered,
    label: "Numbered list",
    action: (s) => ({ text: `1. ${s || "item"}`, offset: s ? 0 : 3 }),
  },
];

export function PostEditor({
  value,
  onChange,
  placeholder = "Write your post... (Markdown supported)",
  minRows = 10,
}: PostEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (btn: ToolbarButton) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const { text, offset } = btn.action(selected);
    const newVal = value.slice(0, start) + text + value.slice(end);
    onChange(newVal);
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        selected ? start + text.length : start + offset,
        selected ? start + text.length : start + offset + (selected.length || text.length - offset * 2)
      );
    });
  };

  return (
    <div className="flex flex-col border border-border bg-background">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
            tab === "write"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
            tab === "preview"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Toolbar */}
      {tab === "write" && (
        <div className="flex items-center gap-0.5 border-b border-border px-2 py-1.5 flex-wrap">
          {TOOLBAR.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.label}
                type="button"
                title={btn.label}
                onClick={() => insertMarkdown(btn)}
                className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Write / Preview content */}
      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground resize-y font-mono leading-relaxed"
        />
      ) : (
        <div className="min-h-[200px] px-4 py-3">
          {value.trim() ? (
            <div className={PROSE_CLASSES}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {/* Footer hint */}
      {tab === "write" && (
        <div className="border-t border-border px-4 py-1.5">
          <p className="text-[11px] text-muted-foreground/50">
            Markdown supported · **bold** · *italic* · `code` · &gt; quote
          </p>
        </div>
      )}
    </div>
  );
}
