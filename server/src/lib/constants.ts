/**
 * Server-side constants duplicated from src/lib/constants.ts.
 * Keep in sync manually — both lists must match.
 */
export const FORUM_CATEGORIES = [
  "General",
  "Gear Reviews",
  "Tips & Tactics",
  "Buy/Sell",
  "Memes",
  "News",
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];
