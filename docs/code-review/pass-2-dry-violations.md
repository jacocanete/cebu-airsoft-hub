# Pass 2 — DRY Violations

Code quality review focusing on duplicated logic, patterns, types, constants, and validation.

Reviewed: `src/routes/`, `src/components/`, `src/hooks/`, `src/lib/`, `server/src/`

---

## 1. Inline Badge Render Pattern (No `<Badge>` Component)

**Files:**
- `src/components/feed/post-card.tsx:87`
- `src/routes/_main/feed/$id.tsx:219`
- `src/components/marketplace/listing-card.tsx:29,34`
- `src/components/marketplace/listing-sidebar.tsx:104,210`
- `src/routes/_main/marketplace/$id.tsx:59,64`
- `src/components/events/event-card.tsx:28,33`
- `src/routes/_main/events/$id.tsx:58,63`
- `src/routes/_main/search.tsx:254,257`

**Count:** 13 occurrences across 8 files

**Issue:** [DRY] — The badge render pattern is copy-pasted everywhere. Every badge renders with `inline-flex items-center rounded px-2 py-0.5 font-semibold uppercase tracking-wide` plus a dynamic color class. The color maps (`CATEGORY_COLORS`, `CONDITION_COLORS`, `LISTING_STATUS_COLORS`, `GAME_TYPE_COLORS`, `EVENT_STATUS_COLORS`) are all correctly centralized in `src/lib/constants.ts` and imported properly — that part is clean. The problem is there is no `<Badge>` component abstracting the shared wrapper markup. Each file assembles the badge span from scratch.

```tsx
// Repeated verbatim in 8 files — only the color lookup changes
<span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CONDITION_COLORS[listing.condition] ?? FALLBACK_BADGE}`}>
  {listing.condition}
</span>
```

Note: there are two font size variants in use — `text-xs` (post-card, event detail, feed detail) and `text-[10px]` (listing-card, event-card, marketplace/$id). This inconsistency itself is a DRY symptom.

**Impact:** Medium — 13 instances, ~1–2 lines each. A `<Badge>` component would also enforce the `text-xs` vs `text-[10px]` decision once and everywhere.

**Fix:** Extract a `<Badge>` component to `src/components/shared/badge.tsx`:

```tsx
interface BadgeProps {
  colorClass: string;
  children: React.ReactNode;
  size?: "xs" | "sm";
}

export function Badge({ colorClass, children, size = "xs" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 ${size === "xs" ? "text-xs" : "text-[10px]"} font-semibold uppercase tracking-wide ${colorClass}`}
    >
      {children}
    </span>
  );
}
```

Usage: `<Badge colorClass={CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}>{post.category}</Badge>`

---

## 2. Inline Page Header Pattern (Not Using `<PageHeader>`)

**Files:**
- `src/routes/_main/settings.tsx:73–75`
- `src/routes/_main/marketplace/new.tsx:77–79`
- `src/routes/_main/events/new.tsx:19–21`
- `src/routes/_main/groups/new.tsx:19–21`

**Count:** 4 occurrences across 4 route files

**Issue:** [DRY] — The `<PageHeader>` shared component exists at `src/components/shared/page-header.tsx` and renders `border-l-2 border-primary pl-3` + eyebrow + heading. Four routes that use a `new.*` or `settings` layout bypass it entirely and reproduce the pattern inline:

```tsx
// src/routes/_main/settings.tsx:73–75 — SHOULD use <PageHeader>
<div className="border-l-2 border-primary pl-3 mb-8">
  <p className="label-military text-primary">Account</p>
  <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Settings</h1>
</div>

// src/routes/_main/marketplace/new.tsx:77–79 — SHOULD use <PageHeader>
<div className="border-l-2 border-primary pl-3 mb-8">
  <p className="label-military text-primary">Marketplace</p>
  <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Sell an Item</h1>
</div>
```

Compare with routes that do use the component correctly:
- `src/routes/_main/feed/index.tsx:135` — `<PageHeader eyebrow="Community" title="Forum" />`
- `src/routes/_main/marketplace/index.tsx:49` — `<PageHeader ... />`

**Impact:** Medium — `<PageHeader>` already exists and is used by 8 routes. These 4 are inconsistent with the rest of the codebase.

**Fix:** Replace all 4 inline blocks with `<PageHeader>` (plus `className="mb-8"` if the component doesn't add that by default):

```tsx
// Before (settings.tsx)
<div className="border-l-2 border-primary pl-3 mb-8">
  <p className="label-military text-primary">Account</p>
  <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Settings</h1>
</div>

// After
<PageHeader eyebrow="Account" title="Settings" className="mb-8" />
```

---

## 3. Inline Input Field Style (No `input` Utility Class)

**Files (full-width input):**
- `src/routes/_auth/register.tsx:61,79,99,119,148`
- `src/routes/_auth/login.tsx:62,90`

**Files (scoped input):**
- `src/routes/_main/feed/new.tsx:88,94`
- `src/routes/_main/marketplace/new.tsx:112,127,144,167`
- `src/routes/_main/feed/$id.tsx:295`

**Count:** 14 occurrences across 5 files

**Issue:** [DRY] — The input field Tailwind class string is reproduced verbatim in every form:

```
"h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
```

There is no `input` utility class in `globals.css` and no shared `<Input>` or `<FormInput>` component outside the shadcn `ui/` directory (which is not wired into these forms). Every new form field must copy this string manually.

**Impact:** High — 14 occurrences; a missed class on any one field creates visual inconsistency. The pattern is also scattered across auth routes which have their own separate component copies (`src/components/auth/login-form.tsx`, `src/components/auth/signup-form.tsx`) alongside the route-level forms.

**Fix:** Add an `input-field` utility class in `src/styles/globals.css`:

```css
@layer components {
  .input-field {
    @apply h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground;
  }
}
```

Then all occurrences simplify to `className="input-field"`.

---

## 4. Primary Button Style Repeated Across 7 Files

**Files:**
- `src/routes/_main/feed/new.tsx:147`
- `src/routes/_main/feed/$id.tsx:343,565`
- `src/routes/_main/marketplace/new.tsx:202`
- `src/routes/_main/marketplace/index.tsx:99`
- `src/routes/_main/events/index.tsx:125`
- `src/routes/_main/settings.tsx:183`

**Count:** 7 occurrences across 6 files

**Issue:** [DRY] — The primary action button style (`rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`) is hand-typed in every route that needs a submit or CTA button. Padding varies slightly between instances (`px-3 py-2`, `px-4 py-2`, `px-6 py-2.5`) without semantic reason.

```tsx
// src/routes/_main/feed/new.tsx:147
className="rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"

// src/routes/_main/marketplace/index.tsx:99
className="block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors"
```

**Impact:** Medium — Inconsistent padding between buttons causes visual regressions; any design change to the primary button requires touching 7 files.

**Fix:** Add a `btn-primary` utility class in `globals.css`:

```css
@layer components {
  .btn-primary {
    @apply rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed;
  }
}
```

---

## 5. Ghost/Cancel Button Style Repeated

**Files:**
- `src/routes/_main/feed/new.tsx:142`
- `src/routes/_main/feed/$id.tsx:324`
- `src/routes/_main/marketplace/new.tsx:194`

**Count:** 3 occurrences across 3 files

**Issue:** [DRY] — The secondary/cancel button pattern is reproduced identically:

```tsx
className="rounded border border-border px-4 py-2 label-military text-muted-foreground hover:bg-accent transition-colors"
```

**Impact:** Low-Medium — fewer files but still requires touching 3 places on any design change.

**Fix:** Add a `btn-ghost` utility class in `globals.css`:

```css
@layer components {
  .btn-ghost {
    @apply rounded border border-border px-4 py-2 label-military text-muted-foreground hover:bg-accent transition-colors;
  }
}
```

---

## 6. Mock Data Still Present — Migration Incomplete

**Files:** `src/lib/mock-data.ts` (531 lines)

**Issue:** [DRY] — `src/lib/mock-data.ts` is self-described as a temporary migration aid ("Replace each MOCK_* import in a route with the corresponding hook from src/hooks/, then delete this file once all routes are migrated"). However, **no route or component currently imports from it**. The file is 531 lines of dead exported constants.

Verification — `rg "from.*mock-data" src/routes/ src/components/` returns no output.

**Status of all routes:**

| Route | Data Source |
|---|---|
| `feed/index.tsx` | `usePostsInfinite` ✅ |
| `feed/$id.tsx` | `usePostDetail`, `useComments` ✅ |
| `feed/new.tsx` | `createPost` mutation ✅ |
| `marketplace/index.tsx` | `useListings` ✅ |
| `marketplace/$id.tsx` | `useListingDetail` ✅ |
| `marketplace/new.tsx` | `createListing` mutation ✅ |
| `events/index.tsx` | `useEventsList` ✅ |
| `events/$id.tsx` | `useEventDetail` ✅ |
| `groups/index.tsx` | `useGroups` ✅ |
| `groups/$slug.tsx` | stub ("coming soon") |
| `profile/$username.tsx` | `useUserProfile` ✅ |
| `settings.tsx` | `useCurrentUser` ✅ |
| `notifications.tsx` | `useNotifications` ✅ |
| `messages/index.tsx` | `useConversations` ✅ |
| `messages/$id.tsx` | `useMessageRoom` ✅ |
| `mod.tsx` | `useReports` ✅ |
| `modlog.tsx` | `useAuditLog` ✅ |
| `search.tsx` | `useSearch*` hooks ✅ |

**Impact:** High — `src/lib/mock-data.ts` is 531 lines of dead code that is never imported. It should be deleted. Its continued presence creates confusion about migration status.

**Fix:** Delete `src/lib/mock-data.ts` entirely. All routes are fully wired to real API hooks.

---

## 7. `staleTime` — Inconsistent Format (Mixed Notation)

**Files:** All 15 hook files in `src/hooks/`

**Count:** 30+ `staleTime` values, no consistent notation

**Issue:** [DRY] — `staleTime` values use three incompatible notations without any shared constants:

| Notation | Files Using It | Value |
|---|---|---|
| `60 * 1000` | `use-events`, `use-groups`, `use-marketplace`, `use-uploads`, `use-users` | 60 seconds |
| `60_000` | `use-audit`, `use-messages`, `use-notifications` | 60 seconds |
| `30 * 1000` | `use-posts`, `use-comments`, `use-replies`, `use-events` | 30 seconds |
| `30_000` | `use-audit`, `use-messages`, `use-mod-notes`, `use-reports`, `use-search` (as `STALE_TIME`) | 30 seconds |
| `5 * 60 * 1000` | `use-auth`, `use-marketplace` | 5 minutes |
| `5 * 60_000` | `use-blocks`, `use-messages` | 5 minutes |

Only `use-search.ts` defines a local `STALE_TIME` constant — the rest hardcode the value inline.

The global default in `src/lib/query-client.ts:25` is `staleTime: 30 * 1000`. Any hook that sets `staleTime: 30 * 1000` or `30_000` is redundantly overriding the default to the same value.

**Hooks overriding to the same value as the default:**
- `src/hooks/use-posts.ts:81,92` — `staleTime: 30 * 1000` (same as default)
- `src/hooks/use-comments.ts:43` — `staleTime: 30 * 1000` (same as default)
- `src/hooks/use-replies.ts:13` — `staleTime: 30 * 1000` (same as default)
- `src/hooks/use-reports.ts:30` — `staleTime: 30_000` (same as default)
- `src/hooks/use-mod-notes.ts:9` — `staleTime: 30_000` (same as default)

**Impact:** Medium — No runtime bugs, but a maintenance hazard. Changing the default stale time requires auditing 30+ lines. The redundant overrides mask intentional vs. accidental differences.

**Fix:** Add named constants to `src/lib/query-client.ts` and export them:

```ts
// src/lib/query-client.ts
export const STALE = {
  SHORT:   30_000,   // 30s — default for most queries
  MEDIUM:  60_000,   // 60s — lower-traffic data
  LONG:    5 * 60_000, // 5m — session, slow-changing data
} as const;
```

Then remove the 5 redundant overrides (they match the default) and update the remaining hooks to use `STALE.MEDIUM` or `STALE.LONG` where explicitly needed.

---

## 8. Query Key Format Inconsistency — `"conversations"` vs `"conversation"`

**Files:** `src/hooks/use-messages.ts:112,130`

**Count:** 2 related hooks in 1 file

**Issue:** [DRY] — The messages hook uses two closely related but structurally inconsistent query keys:

```ts
// List of conversations
const CONVERSATIONS_KEY = ["conversations"] as const;   // line 23

// Single conversation detail
queryKey: ["conversation", id] as const,                // line 130 — singular, different root!
```

This breaks the standard parent→child key nesting convention used everywhere else in the codebase (`["events"]` / `["events", id]`, `["listings"]` / `["listings", id]`, `["users", username]` / `["users", username, "posts"]`). Invalidating `["conversations"]` will NOT cascade to `["conversation", id]` entries because they share no key prefix.

Contrast with the correct pattern in other hooks:
```ts
// use-events.ts — correct parent/child nesting
queryKey: ["events"]          // list
queryKey: ["events", id]      // detail — shares prefix, cascades on invalidation
```

**Impact:** Medium — `invalidateQueries({ queryKey: ["conversations"] })` does not invalidate the single conversation cache. This means stale conversation detail data can persist after a new message arrives or a conversation is created, leading to subtle display bugs.

**Fix:** Normalize to the standard nesting pattern:

```ts
const CONVERSATIONS_KEY = ["conversations"] as const;
// Change line 130 from:
queryKey: ["conversation", id] as const,
// To:
queryKey: ["conversations", id] as const,
```

Then update the 6 references to `["conversation", id]` in the same file accordingly.

---

## 9. Inline `border-l-2` Sidebar Section Headers

**Files:**
- `src/routes/_main/feed/$id.tsx:456` — `label-military text-primary` eyebrow for section heads in sidebar
- `src/routes/_main/events/$id.tsx:98,135,166,200,233` — same pattern (`label-military text-primary mb-3`)
- `src/routes/_main/marketplace/$id.tsx:94` — `label-military text-primary mb-4`
- `src/routes/_main/profile/$username.tsx:399,517,534` — sidebar section labels

**Count:** ~10 occurrences across 4 detail route files

**Issue:** [DRY] — Sidebar section labels (`<p className="label-military text-primary mb-3">Section Title</p>`) appear repeatedly as raw `<p>` tags in every detail route's sidebar. There is no `<SectionLabel>` or `<SidebarSection>` component abstraction.

```tsx
// src/routes/_main/events/$id.tsx:98
<p className="label-military text-primary mb-3">Mission Brief</p>

// src/routes/_main/events/$id.tsx:166
<p className="label-military text-primary mb-3">RSVP</p>

// src/routes/_main/profile/$username.tsx:399
<p className="label-military text-primary mb-2">Bio</p>
```

Note the `mb-3` vs `mb-2` inconsistency — a shared component would standardize this.

**Impact:** Low — cosmetic inconsistency, no logic duplication. Easy to extract.

**Fix:** A trivial `<SidebarLabel>` component or a CSS utility class:

```tsx
// src/components/shared/sidebar-label.tsx
export function SidebarLabel({ children }: { children: React.ReactNode }) {
  return <p className="label-military text-primary mb-3">{children}</p>;
}
```

---

## 10. `staleTime: 60 * 1000` on `useListings` List Query Overrides Default Unnecessarily — But So Does Missing `enabled`

**Files:** `src/hooks/use-marketplace.ts:39–41`

**Issue:** [DRY] — `useListingDetail(id: string)` calls `useSuspenseQuery(listingDetailQueryOptions(id))`. `listingDetailQueryOptions` accepts `id: string` (non-optional), but the call site in `src/routes/_main/marketplace/$id.tsx` uses a route param that TanStack Router guarantees is non-null. This is fine.

However, `useSellerReviews(listingId: string)` at `use-marketplace.ts:50–56` has `enabled: !!listingId` — guarding against an empty string — but its type signature says `string` (not `string | undefined`). The `enabled` flag there is defensive dead code (a `string` can never be `undefined`, only empty). This is a minor type-guard inconsistency rather than a DRY issue, but worth noting.

**Impact:** Low

---

## 11. Auth Route Has Parallel Form Component Copies

**Files:**
- `src/routes/_auth/login.tsx` + `src/components/auth/login-form.tsx`
- `src/routes/_auth/register.tsx` + `src/components/auth/signup-form.tsx`

**Count:** 2 duplicate form implementations

**Issue:** [DRY] — Both the route file and a separate component file implement the same form. For example, `src/routes/_auth/login.tsx` defines a full login form with state, submit handler, and JSX. `src/components/auth/login-form.tsx` does the same. It's unclear which one is actually rendered. If the route renders the component, the route-level form is dead code; if the route renders its own form inline, the component file is dead.

```tsx
// src/routes/_auth/login.tsx:50–116 — standalone form in route file
// src/components/auth/login-form.tsx — separate component with same form

// src/routes/_auth/register.tsx — standalone form in route file
// src/components/auth/signup-form.tsx — separate component with same form
```

**Impact:** High — whichever version is not rendered is dead code; any bug fix must be applied to both, creating divergence risk.

**Fix:** Check which form is actually mounted in the route's render output. Delete the unused version. The route should delegate entirely to the component.

---

## 12. `"conversation"` / `"conversations"` Inconsistency in Socket Handler

**Files:** `src/hooks/use-messages.ts`

**Issue:** [DRY] — Related to Finding 8. The socket event handler at line 65 calls `qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY })` (the list), but never invalidates `["conversation", id]` (the detail). This means the conversation subject/context shown in `messages/$id.tsx` will not refresh when a new conversation is created via socket push.

---

## Summary

| # | Category | Occurrences | Files Affected | Impact |
|---|---|---|---|---|
| 1 | Badge wrapper markup repeated | 13 | 8 | Medium |
| 2 | `<PageHeader>` not used in 4 routes | 4 | 4 | Medium |
| 3 | Input field style string repeated | 14 | 5 | High |
| 4 | Primary button style repeated | 7 | 6 | Medium |
| 5 | Ghost/cancel button style repeated | 3 | 3 | Low-Medium |
| 6 | `mock-data.ts` — 531 lines of dead code | 531 lines | 1 | High |
| 7 | `staleTime` notation inconsistent + redundant overrides | 30+ | 15 | Medium |
| 8 | `"conversation"` vs `"conversations"` query key mismatch | 2 | 1 | Medium |
| 9 | Sidebar section label `<p>` repeated | ~10 | 4 | Low |
| 10 | `enabled: !!listingId` dead guard on `string` type | 1 | 1 | Low |
| 11 | Auth route + component both implement same form | 2 pairs | 4 | High |
| 12 | Socket handler misses conversation detail invalidation | 1 | 1 | Medium |

---

### What is NOT a DRY Violation

- **Color maps** — `CATEGORY_COLORS`, `CONDITION_COLORS`, `LISTING_STATUS_COLORS`, `GAME_TYPE_COLORS`, `EVENT_STATUS_COLORS`, `POLL_STATUS_COLORS`, and `FALLBACK_BADGE` are all correctly centralized in `src/lib/constants.ts`. Every file imports from there; none redefine inline color maps. ✅
- **`FORUM_CATEGORIES`, `MARKETPLACE_CATEGORIES`, `CONDITIONS`, `GAME_TYPES`** — all correctly imported from `src/lib/constants.ts` wherever used. ✅
- **`PROSE_CLASSES`** — used in all 3 locations that render `<ReactMarkdown>` (`post-editor.tsx`, `feed/$id.tsx`, `marketplace/$id.tsx`). No inline prose string detected. ✅
- **`useCurrentUser()`** — universally used for auth state. No `localStorage` reads or raw `api.get("/api/auth/get-session")` calls in components (the one in `__root.tsx:29` is the SSR loader, which is correct). ✅
- **Server auth middleware** — `requireAuth` / `optionalAuth` / `requireRole` are applied consistently across all server routes. No route re-implements session checking manually. ✅
- **Type definitions** — all shared types are in `src/types/index.ts`. Props interfaces are correctly local to their component files, not exported into the types index. No duplicate type shapes found. ✅
- **Tag input** — the `<TagInput>` component (`src/components/feed/tag-input.tsx`) already encapsulates tag logic (Enter/comma to add, Backspace to remove, `maxTags` prop). It is used by `feed/new.tsx` and `feed/$id.tsx` correctly. ✅
- **`BackLink`**, **`SkeletonList`**, **`SkeletonCard`**, **`UserAvatar`**, **`FilterGroup`** — all used consistently by the routes that need them. No inline reimplementations found. ✅

---

### Top Priority Fixes

1. **Delete `src/lib/mock-data.ts`** — it is 531 lines of dead code with zero active imports. Delete it now.
2. **Auth route/component duplication** — determine which of `login.tsx` / `login-form.tsx` and `register.tsx` / `signup-form.tsx` is actually rendered and delete the unused copy.
3. **Add `input-field` utility class** — 14 copy-pasted input style strings across auth and form routes; one CSS utility class eliminates all of them.
4. **Fix `"conversation"` query key** — rename to `["conversations", id]` to restore proper cache cascade invalidation (Finding 8).
5. **Add `btn-primary` / `btn-ghost` utility classes** — 10 button style copies across 8 route files.
6. **Replace 4 inline page headers with `<PageHeader>`** — the component already exists and works.
7. **Standardize `staleTime` notation** — extract `STALE` constants to `query-client.ts` and remove 5 redundant overrides that duplicate the default value.
