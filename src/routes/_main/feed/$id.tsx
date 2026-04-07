import { useState, useRef, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { postDetailQueryOptions } from "@/hooks/use-posts";
import { Flag, Pin, Lock } from "lucide-react";
import { ShareButton } from "@/components/shared/share-button";
import { CommentThread } from "@/components/feed/comment-thread";
import { VoteControl } from "@/components/shared/vote-control";
import { AnimatedCount } from "@/components/shared/animated-count";
import { CATEGORY_COLORS, FALLBACK_BADGE, FORUM_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/shared/badge";
import { Poll } from "@/components/feed/poll";
import { PostEditor } from "@/components/feed/post-editor";
import { TagInput } from "@/components/feed/tag-input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROSE_CLASSES } from "@/lib/prose";
import { stripMarkdown } from "@/lib/markdown";
import { BackLink } from "@/components/shared/back-link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { SkeletonCard } from "@/components/shared/skeleton-list";
import { usePostDetail, useUpdatePost, useVote } from "@/hooks/use-posts";
import { useComments, useCreateComment, type CommentSort } from "@/hooks/use-comments";
import { usePostRoom } from "@/hooks/use-post-room";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRemovePost, useRestorePost, usePinPost, useLockPost, useDeletePost } from "@/hooks/use-moderation";
import { ReportDialog } from "@/components/shared/report-dialog";
import { ContentActionsMenu } from "@/components/shared/content-actions-menu";
import { RemovedPlaceholder } from "@/components/shared/removed-placeholder";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { PostImageSlider } from "@/components/shared/post-image-slider";
import { ImageUpload } from "@/components/shared/image-upload";
import type { Upload } from "@/types";
import { isMod } from "@/lib/roles";
import type { PollData, PostDetail } from "@/types";
import { formatRelativeTime } from "@/lib/format-time";

function normalizePoll(poll: NonNullable<PostDetail["poll"]>): PollData {
  const options = poll.options.map((o) => ({
    id: o.id,
    text: o.text,
    votes: o._count?.votes ?? o.votes ?? 0,
  }));
  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);
  const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;
  return {
    id: poll.id,
    postId: poll.postId,
    question: poll.question,
    options,
    totalVotes,
    multiSelect: poll.multiSelect,
    status: isExpired ? "closed" : "open",
    expiresAt: poll.expiresAt,
    userVotes: poll.userVotes ?? [],
  };
}


export const Route = createFileRoute("/_main/feed/$id")({
  // ensureQueryData seeds the React Query cache before the component mounts.
  // useSuspenseQuery in usePostDetail then reads from cache synchronously on
  // both server and client, so there is never a loading state that could
  // cause a hydration mismatch.
  loader: ({ params }) =>
    queryClient.ensureQueryData(postDetailQueryOptions(params.id)),
  pendingComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SkeletonCard />
    </div>
  ),
  head: ({ loaderData }) => {
    const post = loaderData as PostDetail | undefined;
    if (!post) {
      return { meta: [{ title: "Post | Cebu Airsoft Hub" }] };
    }

    const title = `${post.title} — Cebu Airsoft Hub`;
    const excerpt = post.deletedAt
      ? ""
      : stripMarkdown(post.content).slice(0, 200) +
        (post.content.length > 200 ? "…" : "");

    return {
      meta: [
        { title },
        ...(excerpt ? [{ name: "description", content: excerpt }] : []),
        { property: "og:title", content: post.title },
        ...(excerpt ? [{ property: "og:description", content: excerpt }] : []),
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Cebu Airsoft Hub" },
        { property: "article:author", content: `u/${post.author.username}` },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: post.title },
        ...(excerpt ? [{ name: "twitter:description", content: excerpt }] : []),
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  usePostRoom(id);
  const { data: post } = usePostDetail(id);
  const [commentSort, setCommentSort] = useState<CommentSort>("best");
  const { data: comments = [] } = useComments(id, commentSort);
  const createComment = useCreateComment();
  const requireAuth = useRequireAuth();
  const { data: session } = useCurrentUser();
  const [commentText, setCommentText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<Upload[]>([]);

  // Pinned new comments — client-side only, resets on navigation
  const [pinnedNewIds, setPinnedNewIds] = useState<string[]>([]);
  const newCommentIdRef = useRef<string | null>(null);

  // All hooks called unconditionally — before any early return
  const vote = useVote();
  const updatePost = useUpdatePost(id);
  const removePost = useRemovePost(id);
  const restorePost = useRestorePost(id);
  const pinPost = usePinPost(id);
  const lockPost = useLockPost(id);
  const deletePost = useDeletePost(id);

  // Reorder the server-sorted list so the user's own new comments always
  // appear first, regardless of the active sort mode. Deleted pinned comments
  // are dropped from the pin section and revert to their natural position.
  const orderedComments = useMemo(() => {
    if (pinnedNewIds.length === 0) return comments;
    const pinnedSet = new Set(pinnedNewIds);
    const pinned: typeof comments = [];
    for (const pinnedId of pinnedNewIds) {
      const c = comments.find((x) => x.id === pinnedId);
      if (c && !c.deletedAt) pinned.push(c);
    }
    const rest = comments.filter((c) => !pinnedSet.has(c.id));
    return [...pinned, ...rest];
  }, [comments, pinnedNewIds]);

  // Scroll to the new comment once it arrives in the fetched data.
  // Runs after every comments update; exits early if no scroll is pending.
  useEffect(() => {
    const pending = newCommentIdRef.current;
    if (!pending) return;
    if (!comments.some((c) => c.id === pending)) return;

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
    newCommentIdRef.current = null;
  }, [comments]);

  const user = session?.user ?? null;
  const upvotes = post.upvotes ?? 0;
  const downvotes = post.downvotes ?? 0;
  const commentCount = post.commentCount ?? 0;
  const userVote = (post.votes.find((v) => v.userId === user?.id)?.value ?? 0) as 1 | -1 | 0;
  const pollData = useMemo(
    () => (post.poll ? normalizePoll(post.poll) : null),
    [post.poll],
  );
  const isRemoved = !!post.deletedAt;
  const userIsMod = isMod(user);

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    requireAuth(() =>
      createComment.mutate(
        { postId: id, content: commentText },
        {
          onSuccess: (data) => {
            setCommentText("");
            setPinnedNewIds((prev) => [data.id, ...prev]);
            newCommentIdRef.current = data.id;
          },
        },
      ),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BackLink to="/feed" label="Back to Forum" />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex-1 min-w-0">
          <div className="border border-border bg-card p-6 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                {post.pinned && !isRemoved && (
                  <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Pin className="h-3 w-3" aria-hidden /> Pinned
                  </span>
                )}
                {post.locked && !isRemoved && (
                  <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                    <Lock className="h-3 w-3" aria-hidden /> Locked
                  </span>
                )}
                <Badge colorClass={CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}>
                  {post.category}
                </Badge>
                {!isRemoved && post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    to="/feed"
                    search={{ tag, sort: "new", category: "All" }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
              {(user?.id === post.author.id || userIsMod) && (
                <ContentActionsMenu
                  isOwner={user?.id === post.author.id}
                  isModerator={userIsMod}
                  isRemoved={isRemoved}
                  isPinned={post.pinned}
                  isLocked={post.locked}
                  isPost
                  targetLabel="post"
                  onEdit={() => {
                    setEditTitle(post.title);
                     setEditContent(post.content);
                     setEditCategory(post.category);
                     setEditTags([...post.tags]);
                     setEditImages(
                       (post.images ?? []).map((url) => ({
                         id: url,
                         key: url,
                         thumbKey: null,
                         url,
                         thumbUrl: null,
                         filename: "",
                         mimeType: "image/webp",
                         size: 0,
                         width: null,
                         height: null,
                         context: "POST_IMAGE" as const,
                         uploaderId: post.author.id,
                         createdAt: post.createdAt,
                       })),
                     );
                     setIsEditing(true);
                  }}
                  onDelete={() => deletePost.mutate()}
                  onRemove={(reason) => removePost.mutate(reason)}
                  onRestore={() => restorePost.mutate()}
                  onPin={() => pinPost.mutate()}
                  onLock={() => lockPost.mutate()}
                  isPendingRemove={removePost.isPending}
                  isPendingDelete={deletePost.isPending}
                  isPendingRestore={restorePost.isPending}
                />
              )}
            </div>

            {isEditing ? (
              /* ── Edit form ───────────────────────────────────────────── */
              <div className="flex flex-col gap-4 py-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={200}
                  placeholder="Title"
                  aria-label="Post title"
                  className="input-field text-base font-bold"
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  aria-label="Post category"
                  className="input-field w-auto"
                >
                  {FORUM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <PostEditor id="edit-post-body" value={editContent} onChange={setEditContent} minRows={8} />
                <div className="flex flex-col gap-1.5">
                  <label className="label-military text-foreground">Tags</label>
                  <TagInput tags={editTags} onChange={setEditTags} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label-military text-foreground">
                    Images{" "}
                    <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
                      (optional, up to 10)
                    </span>
                  </label>
                  <ImageUpload
                    context="POST_IMAGE"
                    maxFiles={10}
                    value={editImages}
                    onChange={setEditImages}
                  />
                </div>
                <div className="flex gap-2 justify-end border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={updatePost.isPending || !editTitle.trim() || !editContent.trim()}
                    onClick={() =>
                      updatePost.mutate(
                        {
                          title: editTitle,
                          content: editContent,
                          category: editCategory,
                          tags: editTags,
                          images: editImages.map((u) => u.url),
                        },
                        { onSuccess: () => setIsEditing(false) },
                      )
                    }
                    className="btn-primary"
                  >
                    {updatePost.isPending ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Read-only view ──────────────────────────────────────── */
              <>
                <h1 className="text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl mb-4">
                  {post.title}
                </h1>

                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <UserAvatar
                    name={post.author.name}
                    username={post.author.username}
                    size="sm"
                    linkToProfile
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/profile/$username"
                        params={{ username: post.author.username }}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {post.author.name}
                      </Link>
                    </div>
                    <p className="label-military text-muted-foreground" suppressHydrationWarning>
                      u/{post.author.username} · {formatRelativeTime(post.createdAt)}
                      {post.editedAt && (
                        <span className="italic ml-1 text-muted-foreground/70" suppressHydrationWarning>
                          · edited {formatRelativeTime(post.editedAt)}
                        </span>
                      )}
                    </p>

                  </div>
                </div>

                {isRemoved ? (
                  <div className="py-6">
                    <RemovedPlaceholder
                      deletedByAuthor={post.deletedByAuthor}
                      deletedBy={post.deletedBy}
                      deletedAt={post.deletedAt!}
                    />
                  </div>
                ) : (
                  <>
                    {post.images && post.images.length > 0 && (
                      <>
                        <div className="pt-4">
                          <PostImageSlider
                            images={post.images}
                            alt={post.title}
                            onImageClick={(i) => { setLightboxIndex(i); setLightboxOpen(true); }}
                          />
                        </div>
                        <ImageLightbox
                          images={post.images}
                          initialIndex={lightboxIndex}
                          open={lightboxOpen}
                          onOpenChange={setLightboxOpen}
                          alt={post.title}
                        />
                      </>
                    )}
                    <div className={`py-4 ${PROSE_CLASSES}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>
                  </>
                )}
              </>
            )}

            {!isRemoved && pollData && <Poll poll={pollData} />}

            <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
              <VoteControl
                upvotes={upvotes}
                downvotes={downvotes}
                userVote={userVote}
                onVote={(value) => vote.mutate({ postId: id, value })}
                isPending={vote.isPending}
                layout="horizontal"
              />

              <ShareButton />
              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 label-military text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Flag className="h-3.5 w-3.5" />
                Report
              </button>

              <ReportDialog
                open={reportOpen}
                onOpenChange={setReportOpen}
                targetType="POST"
                targetId={id}
                targetLabel="post"
              />
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border flex-wrap gap-3">
              <p className="label-military text-primary flex items-center gap-1">
                <AnimatedCount value={commentCount} />
                Comments
              </p>
              <div role="group" aria-label="Sort comments" className="flex gap-0.5">
                {(["best", "top", "new", "old"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setCommentSort(s)}
                    aria-pressed={commentSort === s}
                    className={`cursor-pointer rounded px-2.5 py-1 label-military transition-colors ${
                      commentSort === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {s === "best" ? "Best" : s === "top" ? "Top" : s === "new" ? "New" : "Old"}
                  </button>
                ))}
              </div>
            </div>

            {post.locked ? (
              <div className="mb-6 rounded border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-400 label-military">
                This post is locked — new comments are disabled.
              </div>
            ) : (
              <form onSubmit={handleComment} className="mb-6 flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={createComment.isPending || !commentText.trim()}
                    className="rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
                  >
                    Comment
                  </button>
                </div>
              </form>
            )}

            {comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No comments yet — be the first to share your thoughts.
              </p>
            ) : (
              <CommentThread
                comments={orderedComments}
                postId={id}
                highlightIds={pinnedNewIds}
              />
            )}
          </div>
        </div>

        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
          <div className="border border-border bg-card p-4">
            <p className="sidebar-label">Author</p>
            <Link
              to="/profile/$username"
              params={{ username: post.author.username }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                name={post.author.name}
                username={post.author.username}
                size="md"
              />
              <div>
                <p className="text-sm font-bold text-foreground">
                  {post.author.name}
                </p>
                <p className="label-military text-muted-foreground">
                  u/{post.author.username}
                </p>
              </div>
            </Link>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="sidebar-label">Stats</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="label-military text-muted-foreground">Score</span>
                <AnimatedCount value={upvotes - downvotes} className="text-sm font-black text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="label-military text-muted-foreground">Comments</span>
                <AnimatedCount value={commentCount} className="text-sm font-black text-primary" />
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="sidebar-label mb-2">
              Got something to share?
            </p>
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
