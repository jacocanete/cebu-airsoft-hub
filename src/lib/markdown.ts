// Keep in sync with server/src/lib/markdown.ts on the server.
// Shared across process boundaries as a deliberate two-copy pattern
// rather than a build-config monorepo package.

export function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → anchor text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/[*_~>-]/g, "") // bold, italic, strikethrough, blockquote, list
    .replace(/\s+/g, " ")
    .trim();
}
