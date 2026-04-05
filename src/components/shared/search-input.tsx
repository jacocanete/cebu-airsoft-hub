import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// SearchType is defined here to avoid a circular dep with the search route.
// The search route re-exports this type for its own usage.
export const SEARCH_TYPES = [
  "forum",
  "marketplace",
  "events",
  "groups",
  "players",
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

interface SearchInputProps {
  /** Pre-fill the input with this value (e.g. current ?q from the URL). */
  defaultValue?: string;
  /** Preserve the active tab when submitting a new query. */
  currentType?: SearchType;
  className?: string;
  placeholder?: string;
  /** Called after a successful navigation (e.g. to close a mobile drawer). */
  onAfterSubmit?: () => void;
}

export function SearchInput({
  defaultValue = "",
  currentType,
  className,
  placeholder = "Search forum, marketplace, events…",
  onAfterSubmit,
}: SearchInputProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultValue);

  // Sync when the parent passes a new defaultValue (e.g. navigating between
  // different /search?q= URLs without unmounting the navbar).
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    navigate({
      to: "/search",
      search: { q, type: currentType ?? "forum" },
    });
    onAfterSubmit?.();
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
      />
    </form>
  );
}
