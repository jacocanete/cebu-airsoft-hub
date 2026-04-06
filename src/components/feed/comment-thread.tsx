import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, Minus, Plus, Loader2 } from "lucide-react";
import type { Comment } from "@/types";
import { useCreateComment, useUpdateComment, useCommentVote } from "@/hooks/use-comments";
import { useReplies } from "@/hooks/use-replies";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useRemoveComment, useRestoreComment, useDeleteComment } from "@/hooks/use-moderation";
import { formatRelativeTime } from "@/lib/format-time";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VoteControl } from "@/components/shared/vote-control";
import { ContentActionsMenu } from "@/components/shared/content-actions-menu";
import { RemovedPlaceholder } from "@/components/shared/removed-placeholder";
import { ReportDialog } from "@/components/shared/report-dialog";
import { useCurrentUser } from "@/hooks/use-auth";
import { isMod } from "@/lib/roles";

const MAX_DEPTH = 4;

// ---------------------------------------------------------------------------
// CollapseRail
// ---------------------------------------------------------------------------

interface CollapseRailProps {
  onCollapse: () => void;
}

function CollapseRail({ onCollapse }: CollapseRailProps) {
  return (
    <button
      onClick={onCollapse}
      title="Collapse thread"
      aria-label="Collapse thread"
      className="w-3 min-w-[0.75rem] shrink-0 flex justify-center relative group cursor-pointer hover:bg-accent/30 rounded transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      {/* Full-height vertical line */}
      <span className="w-px bg-border group-hover:bg-primary transition-colors" />
      {/* Minus badge — fades in at the top of the rail on hover */}
      <span
        className="absolute -top-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        aria-hidden="true"
      >
        <Minus className="h-2.5 w-2.5 text-primary bg-card rounded-sm" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CommentItem
// ---------------------------------------------------------------------------

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
  isHighlighted?: boolean;
}

function CommentItem({ comment, postId, depth = 0, isHighlighted = false }: CommentItemProps) {
  // depth >= 2 starts collapsed; top-level + direct replies start expanded
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [highlightedReplyId, setHighlightedReplyId] = useState<string | null>(null);
  const newReplyIdRef = useRef<string | null>(null);
  // Used to restore focus after the inline edit form is dismissed
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { data: session } = useCurrentUser();
  const user = session?.user ?? null;

  const createComment = useCreateComment();
  const commentVote = useCommentVote();
  const requireAuth = useRequireAuth();
  const removeComment = useRemoveComment(postId, comment.id);
  const restoreComment = useRestoreComment(postId, comment.id);
  const deleteComment = useDeleteComment(postId, comment.id);

  const isRemoved = !!comment.deletedAt;
  const userIsMod = isMod(user);
  const updateComment = useUpdateComment(postId, comment.id);

  const replyCount = comment._count.replies;
  const hasReplies = replyCount > 0;

  // Only fetch replies when the node is expanded — respects default-collapsed state
  const { data: replies = [], isLoading: repliesLoading } = useReplies(
    postId,
    comment.id,
    hasReplies && !collapsed,
  );

  // Scroll to and highlight the user's new reply once it arrives in the fetched data
  useEffect(() => {
    const pending = newReplyIdRef.current;
    if (!pending) return;
    if (!replies.some((r) => r.id === pending)) return;

    setHighlightedReplyId(pending);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = document.getElementById(`comment-${pending}`);
    if (el) {
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
    newReplyIdRef.current = null;
  }, [replies]);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    requireAuth(() =>
      createComment.mutate(
        { postId, content: replyText, parentCommentId: comment.id },
        {
          onSuccess: (data) => {
            setReplyText("");
            setReplyOpen(false);
            newReplyIdRef.current = data.id;
          },
        },
      ),
    );
  }

  // ------------------------------------------------------------------
  // Collapsed state — Reddit-style one-line metadata header
  // ------------------------------------------------------------------
  if (collapsed) {
    return (
      <div
        id={`comment-${comment.id}`}
        role="listitem"
        className={`${depth > 0 ? "mt-2" : ""}${isHighlighted ? " border-l-2 border-primary/60 bg-primary/5 rounded -mx-2 px-2 py-1" : ""}`}
      >
        <button
          onClick={() => setCollapsed(false)}
          aria-label={`Expand comment by u/${comment.author.username}`}
          className="flex cursor-pointer items-center gap-2 rounded px-1 -mx-1 py-0.5 text-xs hover:bg-accent/30 transition-colors group"
        >
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
            <Plus className="h-2.5 w-2.5" />
          </span>
          <span className="font-bold text-foreground/80 hover:text-foreground transition-colors">
            u/{comment.author.username}
          </span>
          <span className="text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {replyCount > 0 && (
            <span className="text-muted-foreground">
              · {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Expanded state — rail (if has replies) anchored to the left of the
  // full node (header + content + children) so clicking it collapses
  // the entire subtree including the comment itself
  // ------------------------------------------------------------------
  return (
    <div
      id={`comment-${comment.id}`}
      role="listitem"
      className={`flex gap-2 ${depth > 0 ? "mt-3" : ""}${isHighlighted ? " border-l-2 border-primary/60 bg-primary/5 rounded -mx-2 px-2 py-1" : ""}`}
    >
      {/* Rail spans the full height of this node. Visible only when the
          comment has replies so there's something to collapse into. */}
      {hasReplies ? (
        <CollapseRail onCollapse={() => setCollapsed(true)} />
      ) : (
        // Invisible spacer keeps content columns aligned across siblings
        <div className="w-3 shrink-0" aria-hidden />
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Avatar + toggle + username are kept in a no-wrap group so they
              never break apart on narrow viewports at deep nesting levels */}
          <div className="flex items-center gap-2 shrink-0">
            <UserAvatar
              name={comment.author.name}
              username={comment.author.username}
              size="xs"
              linkToProfile
            />
            {/* [–] toggle — explicit keyboard-friendly collapse affordance */}
              {hasReplies && (
                <button
                  onClick={() => setCollapsed(true)}
                  title="Collapse thread"
                  aria-label="Collapse thread"
                  className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Minus className="h-2.5 w-2.5" />
                </button>
              )}
            <Link
              to="/profile/$username"
              params={{ username: comment.author.username }}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors"
            >
              u/{comment.author.username}
            </Link>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Content + actions — CSS grid animation for collapse/expand */}
        <div
          className={`grid transition-[grid-template-rows] duration-150 ease-out ${
            collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
        >
          <div className="overflow-hidden">
            {isRemoved ? (
              <RemovedPlaceholder
                deletedByAuthor={comment.deletedByAuthor}
                deletedBy={comment.deletedBy}
                deletedAt={comment.deletedAt!}
                className="block mb-2"
              />
            ) : isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateComment.mutate(editContent, {
                    onSuccess: () => {
                      setIsEditing(false);
                      editTriggerRef.current?.focus();
                    },
                  });
                }}
                className="mb-3 flex flex-col gap-2"
              >
                <textarea
                  autoFocus
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={10_000}
                  aria-label="Edit comment"
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updateComment.isPending || !editContent.trim()}
                    className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
                  >
                    {updateComment.isPending ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      editTriggerRef.current?.focus();
                    }}
                    className="rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed mb-2 whitespace-pre-wrap">
                {comment.content}
                {comment.editedAt && (
                  <span className="ml-2 text-[10px] italic text-muted-foreground/70">edited</span>
                )}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mb-1">
              {!isRemoved && (
                <VoteControl
                  upvotes={comment.upvotes}
                  downvotes={comment.downvotes}
                  userVote={comment.userVote}
                  onVote={(value) =>
                    commentVote.mutate({ postId, commentId: comment.id, value })
                  }
                  isPending={commentVote.isPending}
                  layout="horizontal"
                />
              )}
              {!isRemoved && (
                <button
                  onClick={() => setReplyOpen((o) => !o)}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  Reply
                </button>
              )}
              {(user?.id === comment.author.id || userIsMod || !!user) && (
                <span ref={(el) => { if (el) editTriggerRef.current = el.querySelector("button"); }}>
                <ContentActionsMenu
                  isOwner={user?.id === comment.author.id}
                  isModerator={userIsMod}
                  isRemoved={isRemoved}
                  isLoggedIn={!!user}
                  targetLabel="comment"
                  onEdit={
                    user?.id === comment.author.id && !isRemoved
                      ? () => {
                          setEditContent(comment.content);
                          setIsEditing(true);
                        }
                      : undefined
                  }
                  onDelete={() => deleteComment.mutate()}
                  onRemove={(reason) => removeComment.mutate(reason)}
                  onRestore={() => restoreComment.mutate()}
                  onReport={
                    user && user.id !== comment.author.id
                      ? () => setReportOpen(true)
                      : undefined
                  }
                  isPendingRemove={removeComment.isPending}
                  isPendingDelete={deleteComment.isPending}
                  isPendingRestore={restoreComment.isPending}
                />
                </span>
              )}

              <ReportDialog
                open={reportOpen}
                onOpenChange={setReportOpen}
                targetType="COMMENT"
                targetId={comment.id}
                targetLabel="comment"
              />
            </div>

            {/* Inline reply form */}
            {replyOpen && (
              <form onSubmit={handleReply} className="mb-3 flex flex-col gap-2">
                <textarea
                  autoFocus
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Replying to u/${comment.author.username}...`}
                  aria-label={`Reply to u/${comment.author.username}`}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createComment.isPending || !replyText.trim()}
                    className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
                  >
                    {createComment.isPending ? "Replying…" : "Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyOpen(false);
                      setReplyText("");
                    }}
                    className="rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Replies subtree */}
            {hasReplies && (
              <div className="mt-3">
                {repliesLoading ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground py-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading replies…
                  </div>
                ) : depth < MAX_DEPTH ? (
                  <CommentThread
                    comments={replies}
                    postId={postId}
                    depth={depth + 1}
                    highlightIds={highlightedReplyId ? [highlightedReplyId] : undefined}
                  />
                ) : (
                  <Link
                    to="/feed/$id"
                    params={{ id: postId }}
                    className="text-xs text-primary hover:underline"
                  >
                    Continue thread →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentThread
// ---------------------------------------------------------------------------

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  depth?: number;
  highlightIds?: string[];
}

export function CommentThread({ comments, postId, depth = 0, highlightIds }: CommentThreadProps) {
  const highlightSet = useMemo(
    () => (highlightIds && highlightIds.length > 0 ? new Set(highlightIds) : null),
    [highlightIds],
  );
  return (
    <div role="list" className={`flex flex-col ${depth === 0 ? "gap-5" : "gap-0"}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          depth={depth}
          isHighlighted={highlightSet?.has(comment.id) ?? false}
        />
      ))}
    </div>
  );
}
