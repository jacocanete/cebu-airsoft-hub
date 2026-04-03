import { Link } from "@tanstack/react-router";
import { MessageSquare, ChevronUp, ChevronDown, Pin } from "lucide-react";
import { CATEGORY_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { MOCK_POSTS } from "@/lib/mock-data";

export function PostCard({ post }: { post: (typeof MOCK_POSTS)[number] }) {
  return (
    <article
      className={`flex gap-3 border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent ${
        post.pinned ? "border-primary/30 bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
        <button className="rounded p-0.5 text-muted-foreground transition-colors hover:text-primary">
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-foreground">{post.upvotes}</span>
        <button className="rounded p-0.5 text-muted-foreground transition-colors hover:text-primary">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {post.pinned && (
            <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}`}
          >
            {post.category}
          </span>
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground/60">
              #{tag}
            </span>
          ))}
        </div>

        <Link to="/feed/$id" params={{ id: post.id }}>
          <h2 className="font-semibold text-foreground leading-snug hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Link
            to="/profile/$username"
            params={{ username: post.author.username }}
            className="hover:text-primary transition-colors"
          >
            u/{post.author.username}
          </Link>
          <span>{post.createdAt}</span>
          <Link
            to="/feed/$id"
            params={{ id: post.id }}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {post.commentCount}
          </Link>
        </div>
      </div>
    </article>
  );
}
