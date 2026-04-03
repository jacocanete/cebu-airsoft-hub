const CATEGORY_COLORS = {
  General: "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Gear Reviews": "border border-violet-500/40 bg-violet-500/10 text-violet-400",
  "Tips & Tactics": "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Buy/Sell": "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  Memes: "border border-pink-500/40 bg-pink-500/10 text-pink-400",
  News: "border border-primary/40 bg-primary/10 text-primary"
};
const CONDITION_COLORS = {
  "New": "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Like New": "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Used": "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  "For Parts": "border border-primary/40 bg-primary/10 text-primary"
};
const LISTING_STATUS_COLORS = {
  Available: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  Reserved: "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  Sold: "border border-border bg-muted text-muted-foreground"
};
const GAME_TYPE_COLORS = {
  MilSim: "border border-stone-500/40 bg-stone-500/10 text-stone-400",
  CQB: "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  Speedsoft: "border border-violet-500/40 bg-violet-500/10 text-violet-400",
  "Open Field": "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Night Game": "border border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
};
const EVENT_STATUS_COLORS = {
  Upcoming: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  Ongoing: "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  Completed: "border border-border bg-muted text-muted-foreground",
  Cancelled: "border border-primary/40 bg-primary/10 text-primary"
};
const POLL_STATUS_COLORS = {
  open: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  closed: "border border-border bg-muted text-muted-foreground"
};
const FALLBACK_BADGE = "border border-border bg-muted text-muted-foreground";
const FORUM_CATEGORIES = [
  "General",
  "Gear Reviews",
  "Tips & Tactics",
  "Buy/Sell",
  "Memes",
  "News"
];
const MARKETPLACE_CATEGORIES = [
  "Rifles",
  "Pistols",
  "SMGs",
  "Shotguns",
  "Gear & Apparel",
  "Accessories",
  "Parts",
  "Ammo & BBs"
];
const CONDITIONS = [
  "New",
  "Like New",
  "Used",
  "For Parts"
];
const GAME_TYPES = [
  "MilSim",
  "CQB",
  "Speedsoft",
  "Open Field",
  "Night Game"
];
export {
  CONDITION_COLORS as C,
  EVENT_STATUS_COLORS as E,
  FALLBACK_BADGE as F,
  GAME_TYPE_COLORS as G,
  LISTING_STATUS_COLORS as L,
  MARKETPLACE_CATEGORIES as M,
  POLL_STATUS_COLORS as P,
  CONDITIONS as a,
  CATEGORY_COLORS as b,
  FORUM_CATEGORIES as c,
  GAME_TYPES as d
};
