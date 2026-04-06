import { Link } from "@tanstack/react-router";
import { MessageSquare, Pin, Lock } from "lucide-react";
import { CATEGORY_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { VoteControl } from "@/components/shared/vote-control";
import { ContentActionsMenu } from "@/components/shared/content-actions-menu";
import { RemovedPlaceholder } from "@/components/shared/removed-placeholder";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatRelativeTime } from "@/lib/format-time";
import {
  useRemovePost,
  useRestorePost,
  usePinPost,
  useLockPost,
  useDeletePost,
} from "@/hooks/use-moderation";
import { useVote } from "@/hooks/use-posts";
import { useCurrentUser } from "@/hooks/use-auth";
import { isMod, canModerate } from "@/lib/roles";
import type { SoftDeleteFields } from "@/types";

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: readonly string[];
  images: string[];
  pinned: boolean;
  locked: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote: 1 | -1 | 0;
  author: { id: string; username: string; name: string };
  createdAt: string;
  editedAt: string | null;
}

type PostCardFullProps = PostCardProps & SoftDeleteFields;

export function PostCard({ post }: { post: PostCardFullProps }) {
  const { data: session } = useCurrentUser();
  const user = session?.user ?? null;
  const vote = useVote();

  const removePost = useRemovePost(post.id);
  const restorePost = useRestorePost(post.id);
  const pinPost = usePinPost(post.id);
  const lockPost = useLockPost(post.id);
  const deletePost = useDeletePost(post.id);

  const isRemoved = !!post.deletedAt;
  const userIsMod = isMod(user);
  const userIsOwner = canModerate(user, post.author.id) && !userIsMod;

  return (
    <article
      className={`flex gap-3 border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent ${
        post.pinned && !isRemoved ? "border-primary/30 bg-primary/5" : "border-border"
      } ${isRemoved ? "opacity-60" : ""}`}
    >
      <div className="shrink-0 pt-0.5">
        <VoteControl
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote}
          onVote={(value) => vote.mutate({ postId: post.id, value })}
          isPending={vote.isPending}
          layout="vertical"
        />
      </div>

      <div className="flex-1 min-w-0 flex gap-3">
        <div className="flex-1 min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
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
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}`}
          >
            {post.category}
          </span>
          {!isRemoved && post.tags.map((tag) => (
            <Link
              key={tag}
              to="/feed"
              search={{ tag, sort: "new", category: "All" }}
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              #{tag}
            </Link>
          ))}
        </div>

        <Link to="/feed/$id" params={{ id: post.id }}>
          <h2 className="font-semibold text-foreground leading-snug hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        {isRemoved ? (
          <RemovedPlaceholder
            deletedByAuthor={post.deletedByAuthor}
            deletedBy={post.deletedBy}
            deletedAt={post.deletedAt!}
            className="mt-1.5 block"
          />
        ) : (
          <>
            {post.excerpt && (
              <Link to="/feed/$id" params={{ id: post.id }}>
                <p className="mt-1 text-sm text-muted-foreground/70 line-clamp-2 leading-snug">
                  {post.excerpt}
                </p>
              </Link>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <Link
                to="/profile/$username"
                params={{ username: post.author.username }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <UserAvatar name={post.author.name} username={post.author.username} size="xs" />
                <span>u/{post.author.username}</span>
              </Link>
              <span>
                {formatRelativeTime(post.createdAt)}
                {post.editedAt && (
                  <span className="italic ml-1 text-muted-foreground/40">· edited</span>
                )}
              </span>
              <Link
                to="/feed/$id"
                params={{ id: post.id }}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {post.commentCount}
              </Link>
            </div>
          </>
        )}
        </div>

        {/* Image thumbnail — shown when post has images and is not removed */}
        {!isRemoved && post.images?.length > 0 && (
          <Link
            to="/feed/$id"
            params={{ id: post.id }}
            className="shrink-0 hidden sm:block"
          >
            <div className="h-20 w-20 overflow-hidden border border-border bg-muted/20">
              <img
                src={post.images[0]}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Actions menu — only visible to owner or mods */}
      {(userIsOwner || userIsMod) && (
        <div className="shrink-0 self-start">
          <ContentActionsMenu
            isOwner={!!user && user.id === post.author.id}
            isModerator={userIsMod}
            isRemoved={isRemoved}
            isPinned={post.pinned}
            isLocked={post.locked}
            isPost
            targetLabel="post"
            onDelete={() => deletePost.mutate()}
            onRemove={(reason) => removePost.mutate(reason)}
            onRestore={() => restorePost.mutate()}
            onPin={() => pinPost.mutate()}
            onLock={() => lockPost.mutate()}
            isPendingRemove={removePost.isPending}
            isPendingDelete={deletePost.isPending}
            isPendingRestore={restorePost.isPending}
          />
        </div>
      )}
    </article>
  );
}
