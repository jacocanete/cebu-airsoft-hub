# Pass 3 — React Patterns

Code quality review focusing on canonical React best practices, re-render correctness, state management, React Query usage, and TanStack Router patterns.

---

## 1. Illegal `useEffect` Data Fetching

No violations found. All data fetching uses React Query hooks in `src/hooks/`. The `useEffect` calls in hook files (`use-posts.ts`, `use-comments.ts`, `use-events.ts`, `use-notifications.ts`, `use-messages.ts`) are all legitimate Socket.io side-effect setup, not data fetching.

---

## 2. Index Keys in Dynamic Lists

### Finding 2-A — `circular-text.tsx`: Index key on letter spans

**File:** `src/components/ui/circular-text.tsx` (line 125)
**Issue:** React — `key={i}` (index) used in `.map()` over `Array.from(text)` letters.
**Impact:** Low — The text string rarely changes at runtime, and letters have no independent state. But if the `text` prop changes (e.g., animated text cycling), React will reuse DOM nodes incorrectly, and per-letter animations will fire on the wrong characters.
**Fix:** Use a composite key that changes when text content changes:

```tsx
{letters.map((letter, i) => (
  <span key={`${i}-${letter}`} ...>
    {letter}
  </span>
))}
```

### Finding 2-B — `poll-builder.tsx`: Index key on dynamic options list (pre-existing)

**File:** `src/components/feed/poll-builder.tsx` (line 73)
**Issue:** React — `value.options.map((opt, i) => <div key={opt.id}>` — actually **correct** because `opt.id` is already used. The poll options already have stable `id` fields (generated with `crypto.randomUUID()` on creation). No fix needed.
**Status:** ✅ Correct — uses `key={opt.id}`.

---

## 3. Inline Object and Array Literals in Props

### Finding 3-A — `letter-glitch.tsx`: Multiple inline style objects

**File:** `src/components/ui/letter-glitch.tsx` (lines 193–217)
**Issue:** React — Three `style={{ ... }}` objects defined inline: one on the wrapper `<div>`, one on the outer vignette `<div>`, one on the center vignette `<div>`. Each creates a new reference on every render.
**Impact:** Low — `LetterGlitch` is a canvas component that re-renders only when props change. The vignette divs are leaf nodes. Practical re-render impact is negligible, but extracting clarifies intent.
**Fix:** Extract to module-level constants:

```tsx
const WRAPPER_STYLE: React.CSSProperties = {
  position: "relative", width: "100%", height: "100%", overflow: "hidden",
};
const OUTER_VIGNETTE_STYLE: React.CSSProperties = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 100%)",
};
const CENTER_VIGNETTE_STYLE: React.CSSProperties = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
};
```

### Finding 3-B — `profile/$username.tsx`: Inline style object in render body

**File:** `src/routes/_main/profile/$username.tsx` (line 275)
**Issue:** React — The hero banner `<div>` uses an inline `style={{ background: "linear-gradient(...)" }}` computed directly in JSX. New object on every render of `ProfilePage`.
**Impact:** Low — `ProfilePage` renders infrequently. Cosmetic only.
**Fix:** Extract to a module-level constant:

```tsx
const HERO_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)",
};
// ...
<div className="h-40 w-full border-b border-border sm:h-48" style={HERO_STYLE} />
```

### Finding 3-C — `messages/$id.tsx`: Inline style on thread container

**File:** `src/routes/_main/messages/$id.tsx` (line 73)
**Issue:** React — `style={{ minHeight: "calc(100vh - 56px)" }}` is an inline object literal.
**Impact:** Low — `ThreadPage` re-renders on new messages but the div is structural with no memoized children. Purely cosmetic.
**Fix:** Extract to a module-level constant or move to a Tailwind arbitrary value utility.

---

## 4. Missing `useMemo` for Expensive Computations

### Finding 4-A — `messages/$id.tsx`: `allMessages` flatMap + reverse not memoized

**File:** `src/routes/_main/messages/$id.tsx` (lines 40–42)
**Issue:** React — `allMessages` is derived via `.flatMap().reverse()` on every render. `ThreadPage` re-renders whenever new messages arrive and on `useEffect` for scroll-to-bottom — so this runs on every message received.

```tsx
// Runs on every render — not memoized
const allMessages = (messagesData?.pages ?? [])
  .flatMap((p) => p.messages)
  .reverse();
```

**Impact:** Medium — In an active chat, pages accumulate (30 messages per page × N pages). `.flatMap()` + `.reverse()` on hundreds of messages on every render is unnecessary work.
**Fix:**

```tsx
const allMessages = useMemo(
  () => (messagesData?.pages ?? []).flatMap((p) => p.messages).reverse(),
  [messagesData],
);
```

### Finding 4-B — `feed/$id.tsx`: `normalizePoll` called inline without memoization

**File:** `src/routes/_main/feed/$id.tsx` (line 176)
**Issue:** React — `normalizePoll(post.poll)` is called inline in the render body. It does a `.reduce()`, `.map()`, and a `new Date()` comparison on every render. `PostPage` re-renders on comment sort changes, vote updates, etc.

```tsx
// Called on every render — result is a new object reference
const pollData = post.poll ? normalizePoll(post.poll) : null;
```

**Impact:** Low-Medium — The poll options array is small (2–6 items), so computation cost is trivial. However, `pollData` being a new object reference on every render means `<Poll poll={pollData} />` always receives a "changed" prop, defeating any future memoization on `Poll`.
**Fix:**

```tsx
const pollData = useMemo(
  () => (post.poll ? normalizePoll(post.poll) : null),
  [post.poll],
);
```

---

## 5. Missing `useCallback` for Callbacks Passed to Children

### Finding 5-A — `feed/$id.tsx`: `handleComment` recreated on every render

**File:** `src/routes/_main/feed/$id.tsx` (line 180)
**Issue:** React — `handleComment` is defined as a plain function inside `PostPage` and passed to `<form onSubmit={handleComment}>`. `PostPage` has 9+ `useState` declarations and re-renders frequently (on `commentText` keystroke, `commentSort` changes, vote updates, etc.). Each re-render recreates `handleComment`, though this is a form submit handler so the impact is low.
**Impact:** Low — Not passed to a `React.memo` child. The performance impact is negligible in practice.
**Fix:**

```tsx
const handleComment = useCallback(
  (e: React.FormEvent) => {
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
  },
  [id, commentText, requireAuth, createComment],
);
```

---

## 6. State That Should Be Derived

### Finding 6-A — `events/index.tsx`: `tab` and `gameType` stored in state when they should be URL params

**File:** `src/routes/_main/events/index.tsx` (lines 19–20)
**Issue:** Router/React — `tab` (Upcoming/Past) and `gameType` filter are stored in `useState`. Users cannot share a filtered view via URL, and back-button navigation does not restore filter state. This belongs in URL search params. See Finding 12-B for the full treatment.
**Impact:** Medium — Shareable URLs are a core UX feature.

### Finding 6-B — `marketplace/index.tsx`: `category` and `condition` stored in state

**File:** `src/routes/_main/marketplace/index.tsx` (lines 19–20)
**Issue:** Router/React — Same as 6-A. Filter state lives in `useState`, not in URL search params.
**Impact:** Medium — same shareability concern.

### Finding 6-C — `poll.tsx`: `handleVote` reads `pendingSelection` redundantly

**File:** `src/components/feed/poll.tsx` (line 43)
**Issue:** React — Minor: `handleVote` computes `const selection = isChangingVote ? pendingSelection : pendingSelection;` — both branches return the same value. The `isChangingVote` branch was presumably meant to use a different source (e.g., `poll.userVotes` for the initial vote case), but the logic is already correct upstream because `pendingSelection` is populated in both paths. This is dead conditional logic, not a derived-state issue.
**Fix:** Simplify to `const selection = pendingSelection;`.

---

## 7. Stale Closures in `useEffect` and Event Handlers

### Finding 7-A — `messages/$id.tsx`: Unstable `markRead` reference in `useEffect` deps

**File:** `src/routes/_main/messages/$id.tsx` (lines 44–49)
**Issue:** React — `markRead` from `useMarkConversationRead` is listed as a dependency of the "mark read on mount" `useEffect`. `markRead` is defined as a plain function inside `useMarkConversationRead`, recreated on every render of `ThreadPage`. The effect re-fires every time `markRead` changes identity. The `didMarkRead` ref guard prevents multiple actual API calls, but the effect callback still runs on every render.

```tsx
useEffect(() => {
  if (didMarkRead.current) return; // guard works but effect still fires every render
  didMarkRead.current = true;
  markRead();
}, [markRead]); // markRead is recreated on every render
```

**Impact:** Medium — The ref guard prevents the actual bug (duplicate API calls), but the `useEffect` running on every render is wasteful. If the guard were ever removed, this would be a live bug.
**Fix:** Either wrap `markRead` in `useCallback` inside `useMarkConversationRead`, or use a ref + empty deps:

```tsx
const markReadRef = useRef(markRead);
markReadRef.current = markRead;

useEffect(() => {
  markReadRef.current();
}, []); // only runs on mount
```

### Finding 7-B — `use-messages.ts`: `session?.user` object as dep instead of primitive

**File:** `src/hooks/use-messages.ts` (line 208)
**Issue:** React — `session?.user` (an object reference) is used as a `useEffect` dependency. Any re-render that produces a new session object reference (even with the same content) will re-register socket listeners. `session?.user?.id` (a string primitive) is a more stable dependency.
**Impact:** Low — The session object is fetched once with a 5-minute `staleTime`, so identity changes are rare in practice.
**Fix:** Replace `session?.user` with `session?.user?.id` in the effect dependency arrays in `useConversations` (line 88) and `useMessages` (line 208).

---

## 8. `useEffect` Cleanup Omissions

### Finding 8-A — `letter-glitch.tsx`: `resizeTimeout` not cleared on unmount — rAF loop leak ⚠️

**File:** `src/components/ui/letter-glitch.tsx` (lines 174–188)
**Issue:** React — `handleResize` uses a debounce timeout stored in local `let resizeTimeout`. The cleanup function cancels the rAF loop and removes the resize listener, but does NOT call `clearTimeout(resizeTimeout)`. If the component unmounts during the 100ms debounce window, `resizeTimeout` fires after unmount, calling `resizeCanvas()` and `requestAnimationFrame(animate)` on a detached canvas — leaking a rAF loop that will run indefinitely.

```tsx
return () => {
  cancelAnimationFrame(animationRef.current);
  window.removeEventListener("resize", handleResize);
  // MISSING: clearTimeout(resizeTimeout)
};
```

**Impact:** High — Persistent rAF loop after component unmount causes continuous CPU usage. Reproducible by: navigate to the landing page (which mounts `LetterGlitch`), trigger a window resize, then navigate away within 100ms.
**Fix:**

```tsx
return () => {
  cancelAnimationFrame(animationRef.current);
  clearTimeout(resizeTimeout); // add this
  window.removeEventListener("resize", handleResize);
};
```

### Finding 8-B — `use-notifications.ts`: `socket.connect()` without paired disconnect

**File:** `src/hooks/use-notifications.ts` (line 38)
**Issue:** React — `useUnreadCount` calls `socket.connect()` when authenticated but does not call `socket.disconnect()` in cleanup. Only `socket.off("notification:new", handleNew)` is called.

```tsx
useEffect(() => {
  if (!session?.user) return;
  socket.connect(); // connects
  // ...
  return () => {
    socket.off("notification:new", handleNew); // MISSING: paired disconnect
  };
}, [session?.user, qc]);
```

**Impact:** Medium — The socket is a module-level singleton. `socket.connect()` is idempotent when already connected. The practical risk is that the socket remains connected after logout. Compare with `use-post-room.ts` (line 9–15) and `use-events.ts` (line 19–34) which both carefully track `wasConnected` before connecting and only disconnect if they were the ones to connect.
**Fix:** Align with the `wasConnected` guard pattern:

```tsx
useEffect(() => {
  if (!session?.user) return;
  const wasConnected = socket.connected;
  if (!wasConnected) socket.connect();
  // ...
  return () => {
    socket.off("notification:new", handleNew);
    if (!wasConnected) socket.disconnect();
  };
}, [session?.user, qc]);
```

### Finding 8-C — `use-messages.ts`: Same `socket.connect()` without paired disconnect in two hooks

**File:** `src/hooks/use-messages.ts` (lines 38, 127)
**Issue:** React — Both `useConversations` (line 38) and `useMessages` (line 127) call `socket.connect()` without a paired disconnect. Same issue as Finding 8-B.
**Impact:** Medium — Same as 8-B.
**Fix:** Apply the same `wasConnected` guard pattern as `use-post-room.ts`.

---

## 9. Component Responsibility and Size

### Finding 9-A — `feed/$id.tsx`: `PostPage` manages 9 independent `useState` declarations

**File:** `src/routes/_main/feed/$id.tsx` (lines 102–116)
**Issue:** React — `PostPage` manages: `commentSort`, `commentText`, `reportOpen`, `isEditing`, `editTitle`, `editContent`, `editCategory`, `editTags`, `pinnedNewIds` — 9 separate `useState` calls. The edit form state (5 fields) is interleaved with comment submission state and UI state.

The component is 510 lines and handles:
1. Post detail display (read-only)
2. Post editing (inline form with 5 fields)
3. Comment submission
4. Comment sorting
5. New comment scrolling/pinning
6. Moderation actions (pin, lock, remove, restore, delete)
7. Vote interaction

**Impact:** Medium — The component is comprehensible but above the threshold. The false early return at line 163 means 5 of the `useState` hooks (edit state) are allocated before the loading skeleton is shown.
**Fix:** Extract the inline edit form into a `PostEditForm` component that manages its own state:

```tsx
function PostEditForm({ post, onCancel }: { post: PostDetail; onCancel: () => void }) {
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editCategory, setEditCategory] = useState(post.category);
  const [editTags, setEditTags] = useState([...post.tags]);
  const updatePost = useUpdatePost(post.id);
  // ...
}
```

This reduces `PostPage` from 9 to 4 `useState` calls.

### Finding 9-B — `comment-thread.tsx`: `CommentItem` manages 7 `useState` declarations

**File:** `src/components/feed/comment-thread.tsx` (lines 62–68)
**Issue:** React — `CommentItem` manages: `collapsed`, `replyOpen`, `replyText`, `reportOpen`, `isEditing`, `editContent`, `highlightedReplyId` — 7 pieces of state. This component is also rendered recursively (up to `MAX_DEPTH = 4`). A post with 50 top-level comments + 200 nested replies mounts ~250 `CommentItem` instances, each holding all 7 state slots.
**Impact:** Medium — The states are cohesive (all serve a single complex interactive node), but the edit form and reply form sub-forms could be extracted into child components that only mount when active.
**Fix:** Extract `CommentEditForm` and `CommentReplyForm` as separate components. This removes 4 `useState` calls from `CommentItem` (`isEditing`, `editContent`, `replyOpen`, `replyText`), reducing it to 3 (`collapsed`, `reportOpen`, `highlightedReplyId`).

### Finding 9-C — `profile/$username.tsx`: 505-line file with mixed concerns

**File:** `src/routes/_main/profile/$username.tsx`
**Issue:** React/Structure — `ProfilePage` handles profile display, tab switching, ban dialog state, mod notes (correctly extracted into `ModNotesPanel`), ban/unban actions, role change actions, and the posts tab list. File is 505 lines.
**Impact:** Low — The `BanDialog` and `ModNotesPanel` extractions keep individual render functions focused. Issues are structural (file size), not causing runtime problems.

### Finding 9-D — `mod.tsx`: 452-line file with multiple subcomponents

**File:** `src/routes/_main/mod.tsx`
**Issue:** React/Structure — Defines `ReportRow`, `AuditRow`, `UserRow`, `UsersTab`, and `ModPage` in one file. Each is meaningful on its own.
**Impact:** Low — All subcomponents are unexported. The file is at the structural hygiene boundary.

---

## 10. Prop Drilling

### Finding 10-A — `comment-thread.tsx`: `postId` drilled 4 levels deep

**File:** `src/components/feed/comment-thread.tsx`
**Issue:** React — `postId` is passed `PostPage` → `CommentThread` → `CommentItem` → (recursively) nested `CommentThread` → `CommentItem`. `CommentThread` does not use `postId` itself — it only forwards it to `CommentItem`. At max depth, the chain is 4 levels.
**Impact:** Medium — Not causing bugs today, but adding a new shared prop (e.g., `locked` to disable replies on locked posts) requires changing 4 component signatures.
**Fix:** Create a `PostContext` that holds `postId` (and potentially `locked`) and consume it directly inside `CommentItem`:

```tsx
const PostContext = createContext<{ postId: string }>({ postId: "" });

// CommentThread: wrap in Provider, remove postId from its own props
export function CommentThread({ comments, postId, depth = 0, highlightIds }: CommentThreadProps) {
  return (
    <PostContext.Provider value={{ postId }}>
      <div className={...}>
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} depth={depth} ... />
        ))}
      </div>
    </PostContext.Provider>
  );
}

// CommentItem: read from context instead of props
function CommentItem({ comment, depth = 0, isHighlighted = false }: CommentItemProps) {
  const { postId } = useContext(PostContext);
  // ...
}
```

---

## 11. React Query Anti-Patterns

### Finding 11-A — `use-reports.ts`: `URLSearchParams` built outside `queryFn`

**File:** `src/hooks/use-reports.ts` (lines 19–30)
**Issue:** Query — The `URLSearchParams` object is constructed in the hook body (outside `queryFn`), then closed over inside `queryFn`. While the `queryKey` includes `filters` (so a filter change creates a new cache entry), this pattern means params are computed as a side-effect of the hook render rather than inside `queryFn` where they belong.

```tsx
// params built here — outside queryFn
const params = new URLSearchParams();
if (filters?.status) params.set("status", filters.status);
// ...

return useQuery({
  queryKey: ["reports", filters],
  queryFn: () => api.get(`/api/reports${params.size ? `?${params}` : ""}`),
  // ^ closes over params from above
});
```

**Impact:** Low — No current bug since `queryKey` includes all filter state. Fragile if filters drift from the key.
**Fix:** Build params inside `queryFn`:

```tsx
return useQuery({
  queryKey: ["reports", filters],
  queryFn: () => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    // ...
    return api.get(`/api/reports${params.size ? `?${params}` : ""}`);
  },
  staleTime: 30_000,
});
```

### Finding 11-B — `use-marketplace.ts`: Inconsistent `queryKey` shape

**File:** `src/hooks/use-marketplace.ts` (lines 13–14, 28–29)
**Issue:** Query — `useListings` uses a flat 5-element key: `["listings", condition, category, q, status]`. `useListingDetail` uses `["listings", id]`. The list key mixes filter params inline alongside the resource identifier. Compare with the posts pattern which uses `["posts", "infinite", ...]` vs `["posts", id]` — a structured namespace.
**Impact:** Low — Current invalidation (`queryKey: ["listings"]` prefix match) works correctly. The inconsistency complicates future targeted invalidations.
**Fix:** Adopt the nested structure pattern:

```tsx
queryKey: ["listings", "list", { condition: filters?.condition, category: filters?.category, q: filters?.q, status: filters?.status }]
```

### Finding 11-C — `use-search.ts` ↔ `use-posts.ts`: Cross-domain key coupling

**File:** `src/hooks/use-search.ts` (line 19), `src/hooks/use-posts.ts` (lines 48–51)
**Issue:** Query — `useSearchPosts` uses `["search", "posts", q]`. The `patchPostInAllCaches` helper in `use-posts.ts` explicitly targets `["search", "posts"]` for optimistic updates (lines 48–51). The search query key shape is hardcoded in a different file. If someone changes the search key without updating `patchPostInAllCaches`, vote optimistic updates will silently stop working for search results.
**Impact:** Medium — Currently correct but fragile cross-file dependency.
**Fix:** Export a key builder from `use-search.ts` and import it in `use-posts.ts`:

```tsx
// use-search.ts
export const searchPostsQueryKey = (q?: string) =>
  q ? (["search", "posts", q] as const) : (["search", "posts"] as const);

// use-posts.ts — patchPostInAllCaches
qc.setQueriesData<InfiniteData<PostsPage>>(
  { queryKey: searchPostsQueryKey(), exact: false },
  patchPages,
);
```

### Finding 11-D — `use-messages.ts`: Dead code block in `useMarkConversationRead`

**File:** `src/hooks/use-messages.ts` (lines 369–375)
**Issue:** Query — Inside `useMarkConversationRead.markRead()`, the second `setQueryData(CONVERSATIONS_KEY, ...)` call is a no-op. It reads the conversation list to compute `delta` but then always returns `prev` unchanged regardless of `delta`:

```tsx
qc.setQueryData<ConversationsPage>(CONVERSATIONS_KEY, (prev) => {
  if (!prev) return prev;
  const conv = prev.conversations.find((c) => c.id === conversationId);
  const delta = conv?.unreadCount ?? 0;
  if (delta === 0) return prev;
  return prev; // ← always returns prev, never decrements anything
});
```

The actual unread badge decrement is done correctly in the next `setQueryData` call on `UNREAD_MESSAGES_KEY`. The dead block appears to be an incomplete refactor.
**Impact:** Low — No incorrect behavior. Pure dead code that misleads readers.
**Fix:** Remove the dead `setQueryData(CONVERSATIONS_KEY, ...)` block entirely (lines 369–375).

---

## 12. TanStack Router Anti-Patterns

### Finding 12-A — `mod.tsx`: Raw `<a href>` for internal navigation

**File:** `src/routes/_main/mod.tsx` (lines 126–132)
**Issue:** Router — The `ReportRow` component uses `<a href={targetPath}>` to link to reported content. This bypasses TanStack Router, forcing a full page navigation instead of client-side routing, and skips route preloading and React Query cache warming.

```tsx
<a
  href={targetPath}
  target="_blank"
  rel="noopener noreferrer"
>
  View target <ExternalLink className="h-3 w-3" />
</a>
```

**Impact:** Medium — The `target="_blank"` hints at opening a new tab, which `<Link>` also supports. The `targetPath` is computed as a raw string (`/feed/${report.targetId}`), bypassing typed route params.
**Fix:** Replace with typed `<Link>` switched on `targetType`:

```tsx
function ReportTargetLink({ report }: { report: Report }) {
  const sharedProps = {
    target: "_blank" as const,
    rel: "noopener noreferrer",
    className: "inline-flex items-center gap-1 hover:text-foreground transition-colors",
  };
  switch (report.targetType) {
    case "POST":
    case "COMMENT":
      return <Link to="/feed/$id" params={{ id: report.targetId }} {...sharedProps}>View target <ExternalLink className="h-3 w-3" /></Link>;
    case "LISTING":
      return <Link to="/marketplace/$id" params={{ id: report.targetId }} {...sharedProps}>View target <ExternalLink className="h-3 w-3" /></Link>;
    case "USER":
      return <Link to="/profile/$username" params={{ username: report.targetId }} {...sharedProps}>View target <ExternalLink className="h-3 w-3" /></Link>;
    case "EVENT":
      return <Link to="/events/$id" params={{ id: report.targetId }} {...sharedProps}>View target <ExternalLink className="h-3 w-3" /></Link>;
    case "GROUP":
      return <Link to="/groups/$slug" params={{ slug: report.targetId }} {...sharedProps}>View target <ExternalLink className="h-3 w-3" /></Link>;
  }
}
```

### Finding 12-B — Filter state in `useState` instead of URL search params

**File:** `src/routes/_main/events/index.tsx` (lines 19–20), `src/routes/_main/marketplace/index.tsx` (lines 19–20)
**Issue:** Router — `tab`/`gameType` (events) and `category`/`condition` (marketplace) are stored in `useState`. Filter state is not persisted in the URL, so:
1. Filtered views cannot be bookmarked or shared
2. Page refresh resets filters
3. Back-button navigation does not restore filters

**Impact:** Medium — Shareable filtered URLs are a core UX feature on a community platform. The forum page correctly uses `validateSearch` with `Route.useSearch()` — the same pattern should apply to events and marketplace.
**Fix:** Add `validateSearch` to both routes and use `Route.useSearch()`:

```tsx
// events/index.tsx
export const Route = createFileRoute("/_main/events/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (["Upcoming", "Past"] as const).includes(search.tab as "Upcoming" | "Past")
      ? (search.tab as "Upcoming" | "Past")
      : ("Upcoming" as const),
    gameType: typeof search.gameType === "string" ? search.gameType : "All",
  }),
  // ...
});

function EventsPage() {
  const { tab, gameType } = Route.useSearch();
  const navigate = Route.useNavigate();
  // Replace setTab/setGameType with navigate({ search: (prev) => ({ ...prev, tab: next }) })
}
```

### Finding 12-C — `feed/new.tsx`: Generic `useNavigate` instead of `Route.useNavigate()`

**File:** `src/routes/_main/feed/new.tsx` (line 49)
**Issue:** Router — `useNavigate` is imported from `@tanstack/react-router` directly. The typed alternative is `Route.useNavigate()` which provides compile-time checks for `to`, `params`, and `search`.
**Impact:** Low — Currently navigates to `/feed/$id` which is a known route. A typo in `to` will not be caught at compile time.
**Fix:**

```tsx
// Remove: import { useNavigate } from "@tanstack/react-router" (keep other imports)
const navigate = Route.useNavigate();
```

---

## 13. Additional Findings

### Finding 13-A — `profile/$username.tsx`: `roleBadgeColor` map defined inline in render

**File:** `src/routes/_main/profile/$username.tsx` (lines 264–268)
**Issue:** React/Convention — `roleBadgeColor` is a `Record<string, string>` defined inside `ProfilePage`'s render body. It is a static constant that never depends on props or state. It creates a new object on every render and violates the project convention that all badge color maps belong in `src/lib/constants.ts`.

```tsx
const roleBadgeColor: Record<string, string> = {
  ADMIN: "border-red-500/40 bg-red-500/10 text-red-400",
  MODERATOR: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  USER: "border-border bg-card text-muted-foreground",
};
```

**Impact:** Low — `ProfilePage` renders infrequently. Cosmetic and convention violation.
**Fix:** Move to `src/lib/constants.ts` and export as `ROLE_COLORS`:

```tsx
// constants.ts
export const ROLE_COLORS: Record<string, string> = {
  ADMIN: "border-red-500/40 bg-red-500/10 text-red-400",
  MODERATOR: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  USER: "border-border bg-card text-muted-foreground",
};
```

### Finding 13-B — `mod.tsx`: Local `STATUS_COLORS` and `CATEGORY_LABELS` maps

**File:** `src/routes/_main/mod.tsx` (lines 42–58)
**Issue:** Convention — `STATUS_COLORS` and `CATEGORY_LABELS` are static color/label maps defined at the module level inside the route file rather than in `src/lib/constants.ts`. Per the project conventions, all badge color maps are centralized in `constants.ts`.
**Impact:** Low — No runtime issue.

### Finding 13-C — `poll.tsx`: Redundant conditional in `handleVote`

**File:** `src/components/feed/poll.tsx` (line 43)
**Issue:** React — `const selection = isChangingVote ? pendingSelection : pendingSelection;` — both branches are identical. Dead conditional logic that likely intended different behavior in an earlier version.
**Impact:** Low — No incorrect behavior.
**Fix:** Simplify to `const selection = pendingSelection;`.

---

## Summary

| # | Category | File(s) | Impact |
|---|---|---|---|
| 2-A | Index key on `CircularText` letters | `circular-text.tsx:125` | Low |
| 3-A | Inline style objects (canvas) | `letter-glitch.tsx:193` | Low |
| 3-B | Inline style on profile hero | `profile/$username.tsx:275` | Low |
| 3-C | Inline style on thread container | `messages/$id.tsx:73` | Low |
| 4-A | `allMessages` flatMap not memoized | `messages/$id.tsx:40` | **Medium** |
| 4-B | `normalizePoll` called inline | `feed/$id.tsx:176` | Low–Medium |
| 5-A | `handleComment` recreated each render | `feed/$id.tsx:180` | Low |
| 6-A/B | Filter state in `useState` (events + marketplace) | `events/index.tsx`, `marketplace/index.tsx` | **Medium** |
| 6-C | Dead conditional in `handleVote` | `poll.tsx:43` | Low |
| 7-A | Unstable `markRead` ref in `useEffect` deps | `messages/$id.tsx:44` | **Medium** |
| 7-B | `session?.user` object as dep (prefer ID) | `use-messages.ts:88,208` | Low |
| **8-A** | **rAF loop leak — `resizeTimeout` not cleared** | `letter-glitch.tsx:185` | **High** |
| 8-B | `socket.connect()` unpaired in notifications | `use-notifications.ts:38` | **Medium** |
| 8-C | `socket.connect()` unpaired in messages | `use-messages.ts:38,127` | **Medium** |
| 9-A | `PostPage` has 9 `useState` declarations | `feed/$id.tsx:102` | Medium |
| 9-B | `CommentItem` has 7 `useState` declarations | `comment-thread.tsx:62` | Medium |
| 9-C | `ProfilePage` is 505 lines | `profile/$username.tsx` | Low |
| 9-D | `mod.tsx` multi-component (452 lines) | `mod.tsx` | Low |
| 10-A | `postId` prop drilled 4 levels | `comment-thread.tsx` | Medium |
| 11-A | `URLSearchParams` outside `queryFn` | `use-reports.ts:19` | Low |
| 11-B | Inconsistent `queryKey` for listings | `use-marketplace.ts:14` | Low |
| 11-C | Cross-domain key coupling (search ↔ posts) | `use-search.ts`, `use-posts.ts:48` | **Medium** |
| 11-D | Dead code in `useMarkConversationRead` | `use-messages.ts:369` | Low |
| 12-A | Raw `<a href>` for internal nav in `ReportRow` | `mod.tsx:126` | **Medium** |
| 12-B | Filter state should be URL search params | `events/index.tsx`, `marketplace/index.tsx` | **Medium** |
| 12-C | Generic `useNavigate` instead of `Route.useNavigate()` | `feed/new.tsx:49` | Low |
| 13-A | `roleBadgeColor` map inline in render | `profile/$username.tsx:264` | Low |
| 13-B | `STATUS_COLORS`/`CATEGORY_LABELS` in route file | `mod.tsx:42` | Low |
| 13-C | Dead conditional in `handleVote` | `poll.tsx:43` | Low |

---

### Top Priority Fixes

1. **`letter-glitch.tsx:185` — rAF loop leak after unmount** (High): Add `clearTimeout(resizeTimeout)` to the `useEffect` cleanup. The component currently leaks an infinite `requestAnimationFrame` loop if the user navigates away from the landing page during a window resize debounce. One-line fix.

2. **`messages/$id.tsx:44` — unstable `markRead` in `useEffect` deps** (Medium): The effect re-fires on every render due to `markRead` being a new function reference each time. The `didMarkRead` ref guard prevents duplicate API calls, but the effect overhead on every render is unnecessary. Stabilize `markRead` with `useCallback` in `useMarkConversationRead` or switch to a ref+empty-deps pattern.

3. **`messages/$id.tsx:40` — `allMessages` derivation not memoized** (Medium): Wrap `.flatMap().reverse()` in `useMemo`. In an active conversation this derivation runs on every incoming message event.

4. **`events/index.tsx` and `marketplace/index.tsx` — filter state in `useState`** (Medium): Move `tab`/`gameType` and `category`/`condition` to URL search params via `validateSearch` + `Route.useSearch()`. These pages support community discovery — filtered views should produce shareable URLs just like the forum page does.

5. **`use-notifications.ts:38` and `use-messages.ts:38,127` — `socket.connect()` without paired disconnect** (Medium): Apply the `wasConnected` guard pattern from `use-post-room.ts` to prevent the socket staying open after logout.

6. **`mod.tsx:126` — Raw `<a href>` for internal navigation** (Medium): Replace with typed `<Link>` for all 5 report target types. Enables client-side navigation and route preloading from the mod dashboard.

7. **`use-messages.ts:369` — dead `setQueryData` block** (Low): Remove the no-op `setQueryData(CONVERSATIONS_KEY, ...)` call. It always returns `prev` unchanged and misleads future maintainers.

8. **`profile/$username.tsx:264` — `roleBadgeColor` in render body** (Low): Move to `src/lib/constants.ts` as `ROLE_COLORS` per the project's centralized badge color map convention.
