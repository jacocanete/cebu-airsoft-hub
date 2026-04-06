/**
 * Pure helper for optimistic vote count updates.
 * Removes the previous vote then applies the new one.
 */
export function applyVote(
  upvotes: number,
  downvotes: number,
  prev: 1 | -1 | 0,
  next: 1 | -1 | 0,
): { upvotes: number; downvotes: number } {
  let u = upvotes;
  let d = downvotes;
  if (prev === 1) u--;
  if (prev === -1) d--;
  if (next === 1) u++;
  if (next === -1) d++;
  return { upvotes: u, downvotes: d };
}
