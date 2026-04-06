# Pass 5 — Accessibility & UX

Code quality review focusing on touch targets, form labels, aria attributes, alt text, keyboard navigation, contrast, and screen reader support.

Reviewed against WCAG 2.1 AA. Project is dark-mode first with small uppercase text — contrast is a primary concern.

---

## 1. Touch Target Issues (WCAG 2.5.5)

Minimum required: 44×44px. In Tailwind, `size-11` = 44px. Padding contributes to the hit area.

---

**File:** `src/components/shared/vote-control.tsx` (lines 44–63, 70–88)
**Issue:** Touch — Vote buttons are critically undersized. Vertical layout: `p-0.5` (2px per side) + `h-4 w-4` icon (16px) = **20×20px**. Horizontal layout: `p-0.5` + `h-3.5 w-3.5` (14px) = **18×18px**. This is the most touch-heavy interaction on the platform (every post and comment has vote buttons).
**Impact:** Critical
**Fix:** Add `min-h-11 min-w-11` to both buttons, or increase padding to `p-3.5` (14px × 2 + 16px = 44px). The `h-4 w-4` icon can remain small inside a larger tap target.

---

**File:** `src/components/feed/comment-thread.tsx` (lines 30–45, 198–205)
**Issue:** Touch — `CollapseRail` button is `w-3` (12px) wide with no explicit height constraint — it stretches to the comment height, but the width is far below 44px. The `[–]` collapse toggle button is `h-4 w-4` (16×16px) with no padding at all.
**Impact:** High
**Fix:** For the rail: add `min-w-11`. For the `[–]` toggle: change to `inline-flex h-6 w-6` at minimum, preferably `h-8 w-8` with a negative margin trick to avoid shifting layout.

---

**File:** `src/components/feed/tag-input.tsx` (lines 52–59)
**Issue:** Touch — Tag remove `<X>` button has no explicit size — contains only a `h-3 w-3` icon (12px) with zero explicit padding. Rendered size is approximately **12×12px**.
**Impact:** High
**Fix:** Add `p-1` and `inline-flex items-center justify-center` to the button, giving approximately 20×20px. For full WCAG compliance, use `min-h-11 min-w-11 -mx-1` with a negative margin to avoid disrupting the tag pill layout.

---

**File:** `src/components/feed/poll-builder.tsx` (lines 83–91)
**Issue:** Touch — Option remove `<X>` buttons have no size specified — `h-4 w-4` icon (16px) only, zero padding = **16×16px**.
**Impact:** High
**Fix:** Add `p-2` to the remove buttons, or `inline-flex h-8 w-8 items-center justify-center`.

---

**File:** `src/components/feed/post-editor.tsx` (lines 128–137)
**Issue:** Touch — Toolbar formatting buttons use `p-1.5` (6px per side) + `h-3.5 w-3.5` icon (14px) = **26×26px**. Affects Bold, Italic, Link, Code, Blockquote, List, Numbered List buttons.
**Impact:** Medium
**Fix:** Change to `p-2.5` (10px per side) + 14px icon = 34px, or use `p-3` + remove icon size constraint to get 44px. Alternatively add `min-h-11 min-w-11`.

---

**File:** `src/components/shared/content-actions-menu.tsx` (line 78)
**Issue:** Touch — "More actions" trigger button is `h-6 w-6` (24×24px). Used on every post card and comment thread.
**Impact:** High
**Fix:** Change to `h-8 w-8` or `h-11 w-11`. On the feed list, use negative margin to avoid layout disruption: `h-8 w-8 -my-1`.

---

**File:** `src/components/layout/navbar.tsx` (lines 80–103)
**Issue:** Touch — Desktop notification and messages link buttons are `h-8 w-8` (32×32px). Falls 12px short of the 44px minimum on both axes.
**Impact:** Medium
**Fix:** Change to `h-11 w-11` or add negative margin: `h-11 w-11 -mx-1.5`.

---

**File:** `src/components/shared/image-upload.tsx` (lines 34–43)
**Issue:** Touch — The thumbnail remove button inside `UploadThumbnail` is `h-5 w-5` (20×20px). It's only visible on hover, but still must be reachable by touch.
**Impact:** Medium
**Fix:** Change to `h-8 w-8` or `min-h-11 min-w-11`.

---

## 2. Form Label Associations (WCAG 1.3.1, 4.1.2)

---

**File:** `src/components/feed/post-editor.tsx` (lines 144–151)
**Issue:** Label — The main `<textarea>` inside `PostEditor` has no `id` and no associated `<label>`. The consuming page (`feed/new.tsx` line 102) uses `<label className="label-military">Body</label>` with no `htmlFor`. There is no programmatic association between the label and the editor textarea.
**Impact:** High
**Fix:** Add an `id` prop to `PostEditor` (e.g., `id?: string`), apply it to the `<textarea>`, and update all call sites to pass a matching `htmlFor` on the label. Example: `<PostEditor id="post-body" ...>` and `<label htmlFor="post-body">Body</label>`.

---

**File:** `src/components/feed/poll-builder.tsx` (lines 60–67, 72–73)
**Issue:** Label — "Question" label at line 60 and "Options" label at line 72 use `<label>` elements without `htmlFor`. The question `<input>` at line 62 has no `id`. The option inputs at line 77 also have no `id`.
**Impact:** High
**Fix:** Add unique `id` attributes to each input and match them with `htmlFor` on the labels. For the options array, use `id={`poll-option-${opt.id}`}` and `htmlFor={`poll-option-${opt.id}`}`.

---

**File:** `src/routes/_main/profile/$username.tsx` (lines 99–100, 114–115)
**Issue:** Label — In `BanDialog`, the "Reason" `<textarea>` at line 102 and "Duration" label at line 114 have no `htmlFor`/`id` associations. The textarea is unlabeled programmatically.
**Impact:** Medium
**Fix:** Add `id="ban-reason"` to the textarea and `htmlFor="ban-reason"` to the label.

---

**File:** `src/routes/_main/profile/$username.tsx` (line 201)
**Issue:** Label — The mod note input in `ModNotesPanel` (`<input type="text" ... placeholder="Add a mod note...">`) has no `<label>` element at all — not even an `aria-label`. Placeholder text is not a substitute for a label (WCAG 1.3.1).
**Impact:** Medium
**Fix:** Add `aria-label="Add a mod note"` to the input.

---

**File:** `src/routes/_main/feed/$id.tsx` (lines 288–305)
**Issue:** Label — In the inline post edit form, the title `<input>` (line 289) and category `<select>` (line 297) have no associated labels. The edit form is completely label-free.
**Impact:** Medium
**Fix:** Add `aria-label="Post title"` and `aria-label="Post category"` to the respective fields, or add visible `<label>` elements.

---

**File:** `src/routes/_main/feed/$id.tsx` (lines 479–484)
**Issue:** Label — The main comment textarea has no associated label. `placeholder="Write a comment..."` is not a label.
**Impact:** High
**Fix:** Add `aria-label="Write a comment"` to the textarea.

---

**File:** `src/components/feed/comment-thread.tsx` (lines 244–250, 342–348)
**Issue:** Label — Both the edit form textarea and the reply textarea in `CommentItem` lack labels. The reply textarea uses placeholder text only.
**Impact:** Medium
**Fix:** Add `aria-label="Edit comment"` and `aria-label={`Reply to u/${comment.author.username}`}` respectively.

---

**File:** `src/routes/_main/feed/new.tsx` (lines 100–103)
**Issue:** Label — The "Body" label (`<label className="label-military text-foreground">Body</label>`) has no `htmlFor` linking it to `PostEditor`. `PostEditor` doesn't expose an `id` prop for its textarea. This is a cascading gap from the `PostEditor` issue above.
**Impact:** High — duplicate of the PostEditor issue, but the consuming code is also broken.
**Fix:** See PostEditor fix above.

---

**File:** `src/routes/_main/feed/new.tsx` (lines 105–118)
**Issue:** Label — The "Images" label has no `htmlFor`. `ImageUpload` exposes no `id` prop; its hidden file input has `aria-hidden="true"`. The drop zone button has `aria-label="Upload image"` which partially compensates, but the section header label is not associated.
**Impact:** Low
**Fix:** Add `aria-label` or `aria-labelledby` to the `ImageUpload` container button pointing to the label element.

---

## 3. Missing `aria-label` on Icon Buttons (WCAG 4.1.2)

---

**File:** `src/routes/_main/events/$id.tsx` (line 113)
**Issue:** Aria — The "Report" button contains a `Flag` icon and text "Report" — that's fine. However the button has no `type="button"` attribute, defaulting to `type="submit"` inside a form if one exists. More critically, it performs no action (`onClick` is absent); clicking it is silently a no-op.
**Impact:** Medium
**Fix:** Add `type="button"` and wire up the `onClick` handler (open a report dialog, etc.).

---

**File:** `src/components/ui/circular-text.tsx` (lines 106–148)
**Issue:** Aria — The spinning `CircularText` component is a `motion.div` with `cursor-pointer` and `onMouseEnter`/`onMouseLeave` hover handlers. It has no `role`, no `aria-label`, and no `aria-hidden`. Screen readers will encounter it as an unlabeled interactive region with 40+ individual `<span>` letter elements.
**Impact:** Medium
**Fix:** Add `aria-hidden="true"` to the `motion.div` since the text is purely decorative.

---

**File:** `src/components/feed/post-card.tsx` (lines 141–148)
**Issue:** Aria — The comment count link (`<Link>`) contains a `MessageSquare` icon and a bare number (e.g., `5`). Screen readers will announce "5" with no context. There is no `aria-label` and no sr-only text.
**Impact:** Medium
**Fix:** Add `aria-label={`${post.commentCount} comments`}` to the link, or add `<span className="sr-only"> comments</span>` after the count.

---

**File:** `src/routes/_main/profile/$username.tsx` (lines 434–438)
**Issue:** Aria — In the profile Posts tab, a `ChevronUp` icon with a vote count is rendered as purely visual decoration (not interactive), but neither the icon nor its wrapper has `aria-hidden`. Screen readers will try to announce the icon.
**Impact:** Low
**Fix:** Add `aria-hidden="true"` to the `ChevronUp` icon.

---

**File:** `src/components/shared/MessageButton.tsx`
**Issue:** Aria — This component is imported in multiple places but wasn't fully read. Needs verification that the button has an `aria-label` if it contains only an icon.
**Impact:** Medium
**Fix:** Verify and add `aria-label` if not present.

---

## 4. Image Alt Text (WCAG 1.1.1)

---

**File:** `src/components/shared/user-avatar.tsx` (lines 44–49)
**Issue:** Alt — When `avatar` is a real image, `alt={name}` is used. This is correct. However when the avatar component is used next to a visible username (e.g., in `PostCard`, `CommentThread`, `ConversationCard`), the avatar image duplicates information that is already present in adjacent text. It should use `alt=""` to be decorative in those contexts.
**Impact:** Low
**Fix:** Add an `alt?: string` prop defaulting to `""` when the component is used adjacent to visible name text. Pass `alt={name}` only when the image is the only identification (e.g., standalone profile picture).

---

**File:** `src/components/feed/post-card.tsx` (lines 162–166)
**Issue:** Alt — The thumbnail image uses `alt=""`, treating it as purely decorative. The thumbnail is inside a `<Link to="/feed/$id">` wrapper — screen readers need some indication that the link exists and is a post image. The empty alt removes all context.
**Impact:** Medium
**Fix:** Use `alt={`${post.title} — post image`}` so the link is annotated, or add an `aria-label` to the wrapping `<Link>`.

---

**File:** `src/routes/_main/feed/$id.tsx` (lines 390–397)
**Issue:** Alt — Post detail page images use `alt={`Image ${i + 1}`}`. This is generic and not descriptive. The post title is available.
**Impact:** Low
**Fix:** Use `alt={`${post.title} — image ${i + 1} of ${post.images.length}`}`.

---

**File:** `src/components/ui/letter-glitch.tsx` (line 208)
**Issue:** Alt/SR — The `<canvas>` element has no `aria-hidden`, no `role`, and no `alt`-equivalent. Screen readers may attempt to interact with it or announce it as an unlabeled graphic.
**Impact:** High
**Fix:** Add `aria-hidden="true"` and `role="presentation"` to the `<canvas>` element. The wrapper `<div>` in `hero.tsx` (line 11) already has `pointer-events-none` but that is a mouse concern, not an AT concern.

---

**File:** `src/components/ui/circular-text.tsx` (line 106)
**Issue:** Alt/SR — See item 3 above (aria section). The spinning text component is not hidden from screen readers despite being purely decorative.
**Impact:** Medium
**Fix:** Add `aria-hidden="true"` to the wrapper `motion.div`.

---

## 5. Keyboard Navigation (WCAG 2.1.1, 2.4.7)

---

**File:** `src/components/feed/comment-thread.tsx` (lines 30–45)
**Issue:** Keyboard — `CollapseRail` is a `<button>` element — good for keyboard access. However `w-3` (12px) makes it extremely difficult to visually locate for keyboard users who need to see where focus landed. The visible focus indicator on a 12px-wide strip is essentially invisible.
**Impact:** Medium
**Fix:** Increase the rail width or ensure a visible `focus-visible:ring-2` style is applied. The current `hover:bg-accent/30` has no `focus-visible` equivalent, so keyboard-focused state is invisible.

---

**File:** `src/components/feed/post-editor.tsx` (lines 98–120)
**Issue:** Keyboard — The Write/Preview tab buttons have no `role="tab"`, no `aria-selected`, and no associated `role="tabpanel"`. They look like tabs but have no ARIA tab pattern semantics. Keyboard users using Tab key can reach them, but AT won't understand the tab/panel relationship.
**Impact:** Medium
**Fix:** Add `role="tab"`, `aria-selected={tab === "write"}`, and `tabIndex={tab === "write" ? 0 : -1}` to each button. Wrap in a `role="tablist"`. Add `role="tabpanel"` to the corresponding content area.

---

**File:** `src/routes/_main/profile/$username.tsx` (lines 413–425)
**Issue:** Keyboard — Profile tab buttons (Posts/Media/Comments/Listings) lack `role="tab"`, `aria-selected`, and tab pattern keyboard navigation. Same as PostEditor tabs — no proper tablist pattern.
**Impact:** Medium
**Fix:** Add full ARIA tab pattern: `role="tablist"` on wrapper, `role="tab"` + `aria-selected` on each button, `role="tabpanel"` on content area.

---

**File:** `src/routes/_main/feed/$id.tsx` (lines 456–470)
**Issue:** Keyboard — Comment sort buttons (Best/Top/New/Old) lack semantic grouping. No `role="group"` or `aria-label` on the container. A screen reader user has no context that these are sorting controls.
**Impact:** Low
**Fix:** Add `role="group"` and `aria-label="Sort comments"` to the containing `<div>`.

---

**File:** `src/components/feed/post-editor.tsx` (lines 144–151)
**Issue:** Keyboard — The main writing textarea has `outline-none` but no `focus-visible:ring-*` replacement. While the parent container has `focus-within:ring-1`, the textarea itself has no visible individual focus indicator when other tab stops are inside the editor.
**Impact:** Medium
**Fix:** Replace `outline-none` with `focus-visible:ring-1 focus-visible:ring-primary` on the textarea itself.

---

**File:** `src/components/messages/MessageInput.tsx` (line 51)
**Issue:** Keyboard — The message textarea uses `focus:outline-none focus:ring-1 focus:ring-ring` — this is acceptable since `focus:ring-1` provides a replacement. However using `focus:` instead of `focus-visible:` means the ring appears on mouse click too (minor UX annoyance, not a WCAG failure).
**Impact:** Low
**Fix:** Change `focus:outline-none focus:ring-1` to `focus-visible:outline-none focus-visible:ring-1`.

---

**File:** `src/components/feed/comment-thread.tsx` (lines 244–266)
**Issue:** Keyboard — Inline edit textarea and its Save/Cancel buttons appear/disappear dynamically. When `isEditing` becomes `true`, `autoFocus` is set on the textarea — this is correct. However on closing (`setIsEditing(false)`), focus is not returned to the triggering element (the Edit menu item). Focus is dropped to the document body, forcing keyboard users to re-navigate.
**Impact:** Medium
**Fix:** Store a `ref` to the trigger element and call `.focus()` when `isEditing` transitions from `true` to `false`.

---

**File:** `src/components/shared/image-upload.tsx` (line 209)
**Issue:** Keyboard — The hidden file `<input>` has `aria-hidden="true"`. This is correct. The visible drop zone button properly triggers the hidden input on click. However, if the user presses `Enter` or `Space` on the drop zone button while it's focused with keyboard, the `onClick` handler fires `inputRef.current?.click()` — this should work but browser behavior for programmatic `.click()` on file inputs varies. Needs real-device testing.
**Impact:** Low
**Fix:** Test with keyboard on Chrome and Firefox. If programmatic click doesn't open the file picker via keyboard, use a `<label htmlFor>` pattern instead.

---

## 6. Contrast Issues (WCAG 1.4.3)

Dark mode values from `globals.css`:
- `--background`: `oklch(0.08 0 0)` ≈ `#0a0a0a`
- `--card`: `oklch(0.12 0 0)` ≈ `#141414`
- `--foreground`: `oklch(0.92 0 0)` ≈ `#ebebeb`
- `--muted-foreground`: `oklch(0.62 0 0)` ≈ `#a9a9a9`
- `--primary`: `oklch(0.45 0.27 25)` ≈ `#e90003`

---

**File:** `src/styles/globals.css` (line 192) + all files using `.label-military`
**Issue:** Contrast — `.label-military` applies `text-muted-foreground` (`oklch(0.62)` ≈ `#a9a9a9`) with `text-xs` (12px) + `uppercase` + `tracking-widest`. WCAG 1.4.3 requires 4.5:1 for text under 18px normal or 14px bold. Contrast ratio of `#a9a9a9` on `#0a0a0a` ≈ **5.3:1** — barely passes for normal text. However on `bg-card` (`#141414`) the ratio drops to ≈ **4.4:1** — a marginal WCAG AA fail for small text.
**Impact:** High
**Fix:** Increase `--muted-foreground` in dark mode from `oklch(0.62)` to `oklch(0.65–0.68)` to ensure it clears 4.5:1 on card backgrounds. This also benefits all muted text globally.

---

**File:** Multiple (e.g., `comment-thread.tsx` line 273, `post-card.tsx` line 138, `feed/$id.tsx` line 361)
**Issue:** Contrast — `text-muted-foreground/40` (40% opacity muted foreground) is used for "edited" labels. On dark backgrounds: `#a9a9a9` at 40% opacity blended over `#141414` ≈ `#616161`. Contrast ratio of `#616161` on `#141414` ≈ **2.6:1** — fails WCAG AA (requires 4.5:1).
**Impact:** High
**Fix:** Replace `text-muted-foreground/40` with `text-muted-foreground/60` minimum, or use a fixed color like `text-muted-foreground/50` which gives ≈ `#787878` on `#141414` ≈ **3.6:1** — still a fail. Use the solid `text-muted-foreground` class or at minimum `/70` opacity.

---

**File:** `src/components/feed/poll.tsx` (line 152), `src/routes/_main/marketplace/new.tsx` (line 114), `src/routes/_main/feed/new.tsx` (line 89)
**Issue:** Contrast — `text-muted-foreground/60` is used for secondary info (vote counts, character counters). `#a9a9a9` at 60% on `#141414` ≈ `#717171`. Contrast ratio ≈ **3.2:1** — fails WCAG AA for small text.
**Impact:** High
**Fix:** Use `text-muted-foreground` (solid) for meaningful information, or reserve `/60` opacity only for purely decorative separators.

---

**File:** `src/styles/globals.css` (line 110) + `src/components/marketplace/listing-card.tsx` (line 44)
**Issue:** Contrast — `text-primary` (`#e90003` red) on `bg-card` (`#141414`). Contrast ratio of `#e90003` on `#141414` ≈ **4.2:1** — fails WCAG AA for small text (e.g., the `₱12,000` price text in `ListingCard` uses `text-lg font-black text-primary` — at 18px bold this crosses into "large text" territory and only needs 3:1, which passes). However `label-military text-primary` usage at 12px would fail.
**Impact:** Medium
**Fix:** Audit all instances of small `text-primary` text on card backgrounds. Consider using `oklch(0.50 0.27 25)` for better contrast while keeping the red hue.

---

**File:** `src/routes/_main/feed/new.tsx` (line 89), `src/routes/_main/marketplace/new.tsx` (line 114)
**Issue:** Contrast — Character counters use `text-muted-foreground/40` (e.g., `{title.length}/200`). See the `/40` opacity finding above — these will fail at ≈ **2.6:1**.
**Impact:** Medium
**Fix:** Use `text-muted-foreground/60` as minimum, ideally solid `text-muted-foreground`.

---

**File:** `src/components/feed/comment-thread.tsx` (line 215)
**Issue:** Contrast — Comment timestamps use `text-[11px] text-muted-foreground`. At 11px, WCAG requires 4.5:1. On `bg-card`: `#a9a9a9` on `#141414` ≈ **4.4:1** — marginally fails. 11px text needs higher contrast than 12px text.
**Impact:** Medium
**Fix:** Increase font size to `text-xs` (12px) minimum, or boost `--muted-foreground` as noted above.

---

**File:** `src/components/events/event-card.tsx` (lines 27–36)
**Issue:** Contrast — `GAME_TYPE_COLORS` and `EVENT_STATUS_COLORS` (from `constants.ts`) use colored badges like `text-sky-400 bg-sky-500/10`, `text-emerald-400 bg-emerald-500/10`, etc. `text-sky-400` (`#38bdf8`) on `bg-sky-500/10` over `#141414` (card) ≈ `#38bdf8` on `#14181e` ≈ **8.5:1** — passes. However `text-amber-400` on `#141414` ≈ **7.2:1** — passes. This category likely passes, but needs verification for each badge color.
**Impact:** Low
**Fix:** Run a contrast check on the specific hex values of each badge color variant against `#141414`.

---

## 7. Screen Reader Issues (WCAG 4.1.3, 1.3.1)

---

**File:** `src/components/ui/letter-glitch.tsx` (line 208)
**Issue:** SR — The `<canvas>` element used for the animated background has no `aria-hidden="true"` and no `role="presentation"`. Screen readers on some platforms will attempt to announce it as an empty or interactive canvas element.
**Impact:** High
**Fix:**
```tsx
<canvas ref={canvasRef} style={CANVAS_STYLE} aria-hidden="true" role="presentation" />
```

---

**File:** `src/components/ui/circular-text.tsx` (lines 106–148)
**Issue:** SR — The spinning `CircularText` `motion.div` has `cursor-pointer` applied despite having no `onClick` and no `role`. Screen readers may announce the 40+ individual letter `<span>` elements. This component is used as the hero section decoration.
**Impact:** Medium
**Fix:** Add `aria-hidden="true"` to the outer `motion.div`. The text is also available as the site name in the `<h1>` on the same page.

---

**File:** `src/components/feed/poll.tsx` (lines 86–147)
**Issue:** SR — Poll vote submission and state changes are not announced to screen readers. When a user votes or changes their vote, the results (percentage bars, winner highlight) update dynamically, but there is no `aria-live` region to announce the change.
**Impact:** High
**Fix:** Add a `role="status"` or `aria-live="polite"` wrapper around the poll results section that becomes visible after voting:
```tsx
<div aria-live="polite" aria-atomic="true">
  {showResults && <p className="sr-only">Results updated: {poll.options.map(o => `${o.text} ${pct}%`).join(', ')}</p>}
</div>
```

---

**File:** `src/components/shared/vote-control.tsx` (lines 65–68)
**Issue:** SR — The score count is a bare number (`47`) with no context for screen readers. The `AnimatedCount` renders the number directly inside a `<span>`. Screen readers will announce "47" with no indication it's a vote score.
**Impact:** Medium
**Fix:**
```tsx
<AnimatedCount
  value={score}
  className={`text-xs font-bold min-w-[1.25rem] text-center tabular-nums ${scoreColor}`}
/>
<span className="sr-only"> {score >= 0 ? 'upvotes' : 'downvotes'}</span>
```
Or add `aria-label={`Score: ${score}`}` to the wrapper `<div>`.

---

**File:** `src/components/feed/comment-thread.tsx` (lines 422–433)
**Issue:** SR — The `CommentThread` renders as nested `<div>` elements. Deep nested comments (up to `MAX_DEPTH = 4`) have no ARIA list semantics. Screen readers cannot communicate the tree structure to users.
**Impact:** Medium
**Fix:** Change the outer container to `role="list"` and each `CommentItem` root element to `role="listitem"`. The recursive `CommentThread` divs should be `role="list"` as well, giving a properly structured tree.

---

**File:** `src/routes/_main/feed/$id.tsx` (lines 169–175)
**Issue:** SR — Loading state uses a skeleton (`<SkeletonCard />`). There is no `aria-busy="true"` or `role="status"` announcement. Screen reader users land on the page and receive no feedback that content is loading.
**Impact:** Medium
**Fix:** Wrap skeleton states in `<div role="status" aria-label="Loading..." aria-busy="true">`.

---

**File:** `src/routes/_main/settings.tsx` (lines 62–68)
**Issue:** SR — Same as above: loading skeleton has no `aria-busy` or `role="status"`.
**Impact:** Medium
**Fix:** Same fix as above.

---

**File:** `src/components/shared/search-input.tsx` (no dynamic results region)
**Issue:** SR — The search form (`role="search"` is correctly set) submits and navigates to `/search`. However the `/search` results page (not audited in detail) likely lacks an `aria-live` region for result counts. When results change by tab, there's no announcement.
**Impact:** Low
**Fix:** Add `<p role="status" aria-live="polite" className="sr-only">{results.length} results for "{q}"</p>` on the search results page.

---

**File:** `src/components/layout/navbar.tsx` (lines 86–90, 97–102)
**Issue:** SR — Unread notification/message badges render a bare number inside a `<span>`. The `aria-label` on the parent `<Link>` correctly includes the count (e.g., `"3 unread notifications"`). This is good — the badge span itself can be `aria-hidden`:
```tsx
<span className="absolute ..." aria-hidden="true">{unreadCount}</span>
```
Without `aria-hidden`, screen readers will announce the count twice (from `aria-label` and from the visible badge).
**Impact:** Low
**Fix:** Add `aria-hidden="true"` to both badge `<span>` elements in the navbar (lines 87–90 and 98–103).

---

## 8. Cursor Pointer on Clickable Elements

---

**File:** `src/components/shared/vote-control.tsx` (lines 52, 78)
**Issue:** Cursor — Vote buttons have no `cursor-pointer` class. Browsers default to `cursor: default` on `<button>` elements in some reset stylesheets. Users may not know the buttons are clickable.
**Impact:** Low
**Fix:** Add `cursor-pointer` to both vote button `className` strings.

---

**File:** `src/components/feed/comment-thread.tsx` (line 144)
**Issue:** Cursor — Collapsed comment expand button has no `cursor-pointer`. It's a `<button>` element but could appear non-interactive.
**Impact:** Low
**Fix:** Add `cursor-pointer` to the button className.

---

**File:** `src/components/shared/filter-group.tsx` (line 17)
**Issue:** Cursor — Filter buttons lack `cursor-pointer`. These are the category/condition filter buttons in Marketplace sidebar.
**Impact:** Low
**Fix:** Add `cursor-pointer` to the button className.

---

**File:** `src/routes/_main/feed/$id.tsx` (line 461)
**Issue:** Cursor — Comment sort buttons (Best/Top/New/Old) lack `cursor-pointer`.
**Impact:** Low
**Fix:** Add `cursor-pointer` to the button className.

---

**File:** `src/routes/_main/profile/$username.tsx` (line 417)
**Issue:** Cursor — Profile tab buttons lack `cursor-pointer`.
**Impact:** Low
**Fix:** Add `cursor-pointer` to the button className.

---

**File:** `src/components/feed/poll-builder.tsx` (lines 83, 94, 109)
**Issue:** Cursor — Poll option remove, "Add option", and multi-select toggle buttons lack `cursor-pointer`. Note the toggle button already has `cursor-pointer` via the wrapping `<label>` at line 108, but the `<button>` itself does not.
**Impact:** Low
**Fix:** Add `cursor-pointer` to the button classNames.

---

**File:** `src/components/shared/content-actions-menu.tsx` (line 78)
**Issue:** Cursor — The "More actions" `<button>` trigger lacks `cursor-pointer`.
**Impact:** Low
**Fix:** Add `cursor-pointer`.

---

**File:** `src/routes/_main/profile/$username.tsx` (lines 361, 370)
**Issue:** Cursor — Ban/Lift Ban admin buttons lack `cursor-pointer`.
**Impact:** Low
**Fix:** Add `cursor-pointer`.

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Touch Targets | 1 | 4 | 3 | 0 | 8 |
| Form Labels | 0 | 4 | 4 | 1 | 9 |
| Aria Labels | 0 | 0 | 4 | 1 | 5 |
| Image Alt Text | 0 | 1 | 2 | 2 | 5 |
| Keyboard Navigation | 0 | 0 | 5 | 2 | 7 |
| Contrast | 0 | 3 | 3 | 1 | 7 |
| Screen Reader | 0 | 3 | 5 | 2 | 10 |
| Cursor Pointer | 0 | 0 | 0 | 8 | 8 |
| **Total** | **1** | **15** | **26** | **17** | **59** |

---

### Top 10 Priority Fixes

1. **Vote buttons are too small (Critical touch target)** — `vote-control.tsx:52,78` — Used on every post and comment; rendered size is 18–20px. Add `min-h-11 min-w-11` to both buttons.

2. **Canvas backgrounds not hidden from screen readers** — `letter-glitch.tsx:208` — Add `aria-hidden="true" role="presentation"` to the `<canvas>` element to prevent screen readers from trying to interpret the animated background.

3. **Poll vote results have no live region** — `poll.tsx:85-147` — After voting, percentage updates are invisible to screen readers. Add `aria-live="polite"` to the results region.

4. **PostEditor textarea has no label association** — `post-editor.tsx:144` + `feed/new.tsx:102` — The main content textarea for creating posts is completely unlabeled. Add an `id` prop to `PostEditor` and use `htmlFor` on the label.

5. **`text-muted-foreground/40` and `/60` fail contrast** — Multiple files — Semi-transparent muted text ("edited" labels, character counters, timestamps) fails WCAG AA contrast on dark card backgrounds. Replace with solid `text-muted-foreground` or increase opacity to `/80` minimum.

6. **Comment textarea in post detail has no label** — `feed/$id.tsx:479` — The top-level comment input box has no label. Add `aria-label="Write a comment"`.

7. **CollapseRail is 12px wide — keyboard focus invisible** — `comment-thread.tsx:34` — A `<button>` that is 12px wide has an essentially invisible focus indicator. Add `focus-visible:ring-2 focus-visible:ring-primary` and widen to `min-w-8`.

8. **PollBuilder inputs are not labeled** — `poll-builder.tsx:60,72` — Question and option inputs have `<label>` elements with no `htmlFor`. Add `id` to each input.

9. **CommentThread has no list semantics** — `comment-thread.tsx:422` — Deep comment trees lack ARIA list structure. Add `role="list"` / `role="listitem"` to communicate hierarchy to screen readers.

10. **Loading skeletons have no aria-busy announcement** — `feed/$id.tsx:169`, `settings.tsx:62` — Skeleton loading states give no feedback to screen readers. Wrap in `<div role="status" aria-busy="true">`.
