// Shared UI constants used across multiple pages.
// Import from here instead of defining inline per-file.

// Badge color maps

export const CATEGORY_COLORS: Record<string, string> = {
  General:          "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Gear Reviews":   "border border-violet-500/40 bg-violet-500/10 text-violet-400",
  "Tips & Tactics": "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Buy/Sell":       "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  Memes:            "border border-pink-500/40 bg-pink-500/10 text-pink-400",
  News:             "border border-primary/40 bg-primary/10 text-primary",
};

export const CONDITION_COLORS: Record<string, string> = {
  "New":       "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Like New":  "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Used":      "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  "For Parts": "border border-primary/40 bg-primary/10 text-primary",
};

export const LISTING_STATUS_COLORS: Record<string, string> = {
  Available: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  Reserved:  "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  Sold:      "border border-border bg-muted text-muted-foreground",
};

export const GAME_TYPE_COLORS: Record<string, string> = {
  MilSim:       "border border-stone-500/40 bg-stone-500/10 text-stone-400",
  CQB:          "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  Speedsoft:    "border border-violet-500/40 bg-violet-500/10 text-violet-400",
  "Open Field": "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Night Game": "border border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  Upcoming:  "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  Ongoing:   "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  Completed: "border border-border bg-muted text-muted-foreground",
  Cancelled: "border border-primary/40 bg-primary/10 text-primary",
};

export const POLL_STATUS_COLORS: Record<string, string> = {
  open:   "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  closed: "border border-border bg-muted text-muted-foreground",
};

export const FALLBACK_BADGE = "border border-border bg-muted text-muted-foreground";

// Category / filter lists

/** Forum post categories (without "All" — add "All" in filter UIs as needed) */
export const FORUM_CATEGORIES = [
  "General",
  "Gear Reviews",
  "Tips & Tactics",
  "Buy/Sell",
  "Memes",
  "News",
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

/** Marketplace item categories */
export const MARKETPLACE_CATEGORIES = [
  "Rifles",
  "Pistols",
  "SMGs",
  "Shotguns",
  "Gear & Apparel",
  "Accessories",
  "Parts",
  "Ammo & BBs",
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

/** Marketplace item conditions */
export const CONDITIONS = [
  "New",
  "Like New",
  "Used",
  "For Parts",
] as const;

export type Condition = (typeof CONDITIONS)[number];

/** Airsoft game types */
export const GAME_TYPES = [
  "MilSim",
  "CQB",
  "Speedsoft",
  "Open Field",
  "Night Game",
] as const;

export type GameType = (typeof GAME_TYPES)[number];
