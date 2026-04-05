# Comment Votes — Implementation Plan

## Overview

Add upvote/downvote support to comments, mirroring the existing post voting system. This enables "Best" and "Top" comment sort modes (Reddit-style).

## Schema

Add a `CommentVote` model to `prisma/schema.prisma`:

```prisma
model CommentVote {
  userId    String
  commentId String
  value     Int
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  comment   Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@id([userId, commentId])
}
```

Update `Comment` — add `votes CommentVote[]` relation.
Update `User` — add `commentVotes CommentVote[]` relation.

Run `npx prisma migrate dev --name add-comment-votes`.

## Backend

### Vote route

Add `POST /:commentId/vote` to `server/src/routes/comments.ts`. Same pattern as post votes:

- Zod validation: `value` must be `1`, `-1`, or `0`
- `value === 0` deletes the vote, otherwise upsert on `[userId, commentId]`
- Count upvotes/downvotes after mutation
- Respond with `{ upvotes, downvotes, userVote }`
- Socket broadcast: `comment:vote:update` with `{ commentId, upvotes, downvotes }` to the `post:{postId}` room

### Updated comment response shape

Update `commentSelect` to include votes. Compute `upvotes`, `downvotes`, and `userVote` server-side in the GET handlers (same as the posts list endpoint). Add `optionalAuth` middleware to `GET /` and `GET /:commentId/replies` so `userVote` can be determined.

### Comment sort modes

Update `GET /` to support `?sort=best|top|new|old`:

- **Best** (default): Wilson score confidence sort. Favors comments with high confidence of being good (10 up / 0 down ranks higher than 100 up / 50 down). This is Reddit's default comment sort.
- **Top**: Net votes `(upvotes - downvotes)` descending.
- **New**: `createdAt` descending (already exists).
- **Old**: `createdAt` ascending (already exists).

Wilson score function (Reddit's comment ranking):

```ts
function wilsonScore(upvotes: number, downvotes: number): number {
  const n = upvotes + downvotes;
  if (n === 0) return 0;
  const z = 1.96; // 95% confidence
  const p = upvotes / n;
  return (
    (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n)
  );
}
```

Sort is computed in-memory after fetching (same approach as post feed sorting).

## Frontend Types

Update `Comment` type in `src/types/index.ts`:

```ts
export type Comment = {
  id: string;
  content: string;
  author: { id: string; username: string; name: string };
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | 0;
  _count: { replies: number };
  replies?: Comment[];
  createdAt: string;
};
```

## Frontend Hooks

### `useCommentVote` mutation

Add to `src/hooks/use-comments.ts`:

```ts
export function useCommentVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId, value }: {
      postId: string;
      commentId: string;
      value: 1 | -1 | 0;
    }) =>
      api.post(`/api/posts/${postId}/comments/${commentId}/vote`, { value }),
    onSettled: (_data, _err, { postId }) => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["replies"] });
    },
  });
}
```

Optimistic updates can be added later if the invalidation round trip feels slow.

### Socket listener

Add `comment:vote:update` listener inside `useComments`:

```ts
socket.on("comment:vote:update", (data: {
  commentId: string;
  upvotes: number;
  downvotes: number;
}) => {
  qc.invalidateQueries({ queryKey: ["comments", postId] });
  qc.invalidateQueries({ queryKey: ["replies"] });
});
```

### Update `CommentSort` type

```ts
export type CommentSort = "best" | "top" | "new" | "old";
```

## Frontend UI

### Refactor `VoteControl`

Make `VoteControl` accept an `onVote` callback instead of calling `useVote` internally. This decouples it from any specific mutation and makes it reusable for both posts and comments:

```tsx
interface VoteControlProps {
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | 0;
  onVote: (value: 1 | -1 | 0) => void;
  isPending?: boolean;
  layout?: "vertical" | "horizontal";
}
```

Update `PostCard` and `$id.tsx` to pass the appropriate `onVote` handler.

### Comment thread

Add `VoteControl` to the actions bar in `comment-thread.tsx`, inline before the Reply button:

```tsx
<div className="flex items-center gap-3 mb-1">
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
  <button onClick={() => setReplyOpen((o) => !o)}>Reply</button>
  ...
</div>
```

### Sort buttons

Update `$id.tsx` to include "Best", "Top", "New", "Old" tabs for comment sorting. Default to "Best".

## Files Changed

| File | Action | What |
|------|--------|------|
| `prisma/schema.prisma` | Edit | Add `CommentVote` model, update `Comment` and `User` relations |
| Migration | Run | `npx prisma migrate dev --name add-comment-votes` |
| `server/src/routes/comments.ts` | Edit | Add vote route, update selects, add auth to GETs, add Wilson sort |
| `src/types/index.ts` | Edit | Add vote fields to `Comment` type |
| `src/hooks/use-comments.ts` | Edit | Add `useCommentVote`, socket listener, update `CommentSort` |
| `src/components/shared/vote-control.tsx` | Edit | Accept `onVote` callback prop |
| `src/components/feed/comment-thread.tsx` | Edit | Add `VoteControl` to comment actions |
| `src/components/feed/post-card.tsx` | Edit | Pass `onVote` to `VoteControl` |
| `src/routes/_main/feed/$id.tsx` | Edit | Pass `onVote` to `VoteControl`, add Best/Top sort buttons |
| `src/lib/mock-data.ts` | Edit | Update mock comments with vote fields |

## Execution Order

1. Schema + migration (everything depends on the DB model)
2. Backend route + updated selects
3. Frontend types
4. Hooks (`useCommentVote` + socket listener)
5. `VoteControl` refactor (`onVote` prop)
6. Comment thread UI
7. Sort modes (Best + Top)
8. Type-check + verify
