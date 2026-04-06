interface FilterGroupProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="label-military text-primary mb-3">{label}</p>
      <div className="flex flex-col gap-0.5">
        {["All", ...options].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`cursor-pointer rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
              value === opt
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
