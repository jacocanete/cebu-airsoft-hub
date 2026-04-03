import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronUp,
  ChevronDown,
  Share2,
  Flag,
  Pin,
  Shield,
} from "lucide-react";
import { CommentThread } from "@/components/feed/comment-thread";
import { CATEGORY_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { Poll } from "@/components/feed/poll";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROSE_CLASSES } from "@/lib/prose";
import { MOCK_POST_DETAIL, MOCK_COMMENTS, MOCK_POLL } from "@/lib/mock-data";
import { BackLink } from "@/components/shared/back-link";
import { UserAvatar } from "@/components/shared/user-avatar";

export const Route = createFileRoute("/_main/feed/$id")({
  head: () => ({
    meta: [{ title: "Post | Detachment Reaper" }],
  }),
  component: PostPage,
});



function PostPage() {
  const post = MOCK_POST_DETAIL;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BackLink to="/feed" label="Back to Forum" />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex-1 min-w-0">
          <div className="border border-border bg-card p-6 mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.pinned && (
                <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Pin className="h-3 w-3" /> Pinned
                </span>
              )}
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}`}>
                {post.category}
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground/60">#{tag}</span>
              ))}
            </div>

            <h1 className="text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <UserAvatar name={post.author.name} username={post.author.username} size="sm" linkToProfile />
              <div>
                <div className="flex items-center gap-2">
                  <Link to="/profile/$username" params={{ username: post.author.username }} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                    {post.author.name}
                  </Link>
                  {post.author.team && (
                    <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Shield className="h-2.5 w-2.5" />{post.author.team}
                    </span>
                  )}
                </div>
                <p className="label-military text-muted-foreground/60">
                  u/{post.author.username} · {post.createdAt} · {post.viewCount.toLocaleString()} views
                </p>
              </div>
            </div>

            <div className={`pt-4 ${PROSE_CLASSES}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>

            <Poll poll={MOCK_POLL} />

            <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
              <div className="flex items-center gap-1 border border-border rounded overflow-hidden">
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <ChevronUp className="h-3.5 w-3.5" />
                  {post.upvotes}
                </button>
                <div className="w-px h-6 bg-border" />
                <button className="px-2.5 py-1.5 text-muted-foreground hover:bg-accent transition-colors">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <button className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 label-military text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
              <button className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 label-military text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Flag className="h-3.5 w-3.5" />
                Report
              </button>
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border flex-wrap gap-3">
              <p className="label-military text-primary">{post.commentCount} Comments</p>
              <div className="flex gap-0.5">
                {["Best", "New", "Old"].map((s) => (
                  <button
                    key={s}
                    className={`rounded px-2.5 py-1 label-military transition-colors ${
                      s === "Best" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-2">
              <textarea
                rows={3}
                placeholder="Write a reply... (Markdown supported)"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none font-mono"
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground/40">
                  **bold** · *italic* · `code` · &gt; quote
                </p>
                <button className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors">
                  Comment
                </button>
              </div>
            </div>

            <CommentThread comments={MOCK_COMMENTS} />
          </div>
        </div>

        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Author</p>
            <Link to="/profile/$username" params={{ username: post.author.username }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <UserAvatar name={post.author.name} username={post.author.username} size="md" linkToProfile />
              <div>
                <p className="text-sm font-bold text-foreground">{post.author.name}</p>
                <p className="label-military text-muted-foreground/60">u/{post.author.username}</p>
              </div>
            </Link>
            {post.author.team && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Shield className="h-3 w-3" />{post.author.team}
                </span>
              </div>
            )}
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Stats</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Upvotes", value: post.upvotes },
                { label: "Comments", value: post.commentCount },
                { label: "Views", value: post.viewCount.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="label-military text-muted-foreground">{label}</span>
                  <span className="text-sm font-black text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-2">Got something to share?</p>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Post your guides, reviews, or questions in the forum.
            </p>
            <Link
              to="/feed/new"
              className="block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors"
            >
              Create a post
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
