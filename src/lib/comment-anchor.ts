const PREFIX = "comment-";

export function commentAnchorId(id: string): string {
  return `${PREFIX}${id}`;
}

export function parseCommentAnchor(hash: string): string | null {
  const clean = hash.replace(/^#/, "");
  return clean.startsWith(PREFIX) ? clean.slice(PREFIX.length) : null;
}

export function scrollToCommentAnchor(id: string): boolean {
  const el = document.getElementById(commentAnchorId(id));
  if (!el) return false;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  el.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
  });
  return true;
}
