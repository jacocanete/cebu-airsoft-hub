// Shared prose className string used in both PostEditor preview and post page.
// Keeping these in sync ensures WYSIWYG accuracy.
export const PROSE_CLASSES = [
  "prose prose-sm dark:prose-invert max-w-none",
  "prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-h2:text-lg prose-h3:text-base",
  "prose-p:text-foreground/90 prose-p:leading-relaxed",
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
  "prose-strong:text-foreground prose-strong:font-bold",
  "prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:font-mono",
  "prose-pre:bg-background prose-pre:border prose-pre:border-border prose-pre:rounded prose-pre:text-xs",
  "prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-blockquote:not-italic",
  "prose-ul:text-foreground/90 prose-ol:text-foreground/90",
  "prose-table:text-sm prose-thead:border-border prose-tr:border-border",
  "prose-th:text-foreground prose-th:font-bold prose-td:text-foreground/80",
  "prose-hr:border-border",
].join(" ");
