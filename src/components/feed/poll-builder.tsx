import { Plus, X, Clock } from "lucide-react";
import type { PollDraft } from "@/types";

interface PollBuilderProps {
  value: PollDraft;
  onChange: (draft: PollDraft) => void;
  onRemove: () => void;
}

const EXPIRY_OPTIONS = [
  { label: "1 hour", value: 1 },
  { label: "6 hours", value: 6 },
  { label: "12 hours", value: 12 },
  { label: "1 day", value: 24 },
  { label: "3 days", value: 72 },
  { label: "7 days", value: 168 },
  { label: "No expiry", value: null },
];

export function PollBuilder({ value, onChange, onRemove }: PollBuilderProps) {
  const update = (partial: Partial<PollDraft>) =>
    onChange({ ...value, ...partial });

  const updateOption = (id: string, text: string) => {
    const options = value.options.map((o) =>
      o.id === id ? { ...o, text } : o,
    );
    update({ options });
  };

  const addOption = () => {
    if (value.options.length >= 6) return;
    update({
      options: [...value.options, { id: crypto.randomUUID(), text: "" }],
    });
  };

  const removeOption = (id: string) => {
    if (value.options.length <= 2) return;
    update({ options: value.options.filter((o) => o.id !== id) });
  };

  return (
    <div className="border border-primary/20 bg-primary/5 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="label-military text-primary">Poll</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove poll"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Question */}
      <div className="flex flex-col gap-1.5">
        <label className="label-military text-foreground">Question</label>
        <input
          type="text"
          value={value.question}
          onChange={(e) => update({ question: e.target.value })}
          placeholder="e.g. Which field should we play at Saturday?"
          className="h-9 rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
        />
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <label className="label-military text-foreground">Options</label>
        {value.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <span className="label-military text-muted-foreground/50 w-4 text-center">{i + 1}</span>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => updateOption(opt.id, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 h-9 rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => removeOption(opt.id)}
              disabled={value.options.length <= 2}
              className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {value.options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 self-start label-military text-primary hover:text-primary/80 transition-colors mt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add option
          </button>
        )}
      </div>

      {/* Options row */}
      <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-border">
        {/* Multi-select toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={value.multiSelect}
            onClick={() => update({ multiSelect: !value.multiSelect })}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              value.multiSelect ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                value.multiSelect ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="label-military text-foreground">Allow multiple choices</span>
        </label>

        {/* Expiry */}
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={value.expiryHours ?? "null"}
            onChange={(e) =>
              update({ expiryHours: e.target.value === "null" ? null : Number(e.target.value) })
            }
            className="h-7 rounded border border-border bg-background px-2 text-xs text-foreground outline-none ring-primary focus:ring-1"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
