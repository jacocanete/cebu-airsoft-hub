import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronUp, ChevronDown, MessageSquare, ChevronRight, Shield } from "lucide-react";
import type { Comment } from "@/types";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [vote, setVote] = useState<1 | -1 | 0>(0);

  const score = comment.upvotes + vote;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 4;

  return (
    <div className={`flex gap-2 ${depth > 0 ? "mt-3" : ""}`}>
      {/* Collapse rail */}
      {depth > 0 && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-4 shrink-0 flex justify-center pt-1 group"
          aria-label="Collapse thread"
        >
          <span className="w-px flex-1 bg-border group-hover:bg-primary transition-colors" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Link
            to="/profile/$username"
            params={{ username: comment.author.username }}
            className="text-xs font-bold text-foreground hover:text-primary transition-colors"
          >
            u/{comment.author.username}
          </Link>
          {comment.author.team && (
            <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Shield className="h-2.5 w-2.5" />
              {comment.author.team}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">{comment.createdAt}</span>
        </div>

        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2"
          >
            <ChevronRight className="h-3 w-3" />
            Show {comment.replies?.length ?? 0} replies
          </button>
        ) : (
          <>
            {/* Content */}
            <p className="text-sm text-foreground/90 leading-relaxed mb-2 whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-1">
              {/* Votes */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setVote(vote === 1 ? 0 : 1)}
                  className={`p-0.5 rounded transition-colors ${vote === 1 ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <span className={`text-xs font-bold min-w-[20px] text-center ${score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {score}
                </span>
                <button
                  onClick={() => setVote(vote === -1 ? 0 : -1)}
                  className={`p-0.5 rounded transition-colors ${vote === -1 ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Reply */}
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                Reply
              </button>

              {hasReplies && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  Collapse
                </button>
              )}
            </div>

            {/* Inline reply input */}
            {replyOpen && (
              <div className="mb-3 flex flex-col gap-2">
                <textarea
                  autoFocus
                  rows={3}
                  placeholder={`Replying to u/${comment.author.username}...`}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
                />
                <div className="flex gap-2">
                  <button className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors">
                    Reply
                  </button>
                  <button
                    onClick={() => setReplyOpen(false)}
                    className="rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {hasReplies && depth < maxDepth && (
              <div className="mt-1">
                <CommentThread comments={comment.replies!} depth={depth + 1} />
              </div>
            )}

            {/* Too deep — flatten */}
            {hasReplies && depth >= maxDepth && (
              <button className="text-xs text-primary hover:underline">
                Continue thread →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface CommentThreadProps {
  comments: Comment[];
  depth?: number;
}

export function CommentThread({ comments, depth = 0 }: CommentThreadProps) {
  return (
    <div className={`flex flex-col ${depth === 0 ? "gap-5" : "gap-0"}`}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} depth={depth} />
      ))}
    </div>
  );
}
