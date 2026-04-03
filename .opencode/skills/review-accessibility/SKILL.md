---
name: review-accessibility
description: Comprehensive code review pass for accessibility — touch targets, form labels, aria attributes, alt text, keyboard navigation, contrast, and screen reader support
license: MIT
metadata:
  pass: "5"
  category: code-review
---

## What I Do

Run a comprehensive accessibility (a11y) audit of the Detachment Reaper codebase. This is Pass 5 of a 5-pass code quality review. I check every interactive element, form, image, and dynamic content region for WCAG 2.1 AA compliance.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, component library (`@base-ui/react`), routes, and design conventions. The site is dark-mode first with small text — contrast checking is especially important.

## When to Use Me

Use this skill as the final pass after Passes 1-4. This pass covers touch targets, form labels, ARIA attributes, alt text, keyboard navigation, contrast, and screen reader compatibility.

## Review Procedure

### Step 1: Touch Target Issues (WCAG 2.5.5)

All interactive elements (buttons, links, inputs) must be at least 44×44px. In Tailwind, `size-11` = 44px.

Search every component for:

1. **Small icon-only buttons**: Vote buttons (`ChevronUp`/`ChevronDown`) in feed posts and comments use `p-0.5` padding with `h-4 w-4` icons — calculate actual rendered size (icon + padding on all sides)
2. **Comment action buttons**: "Reply", "Collapse" buttons in `comment-thread.tsx` — check rendered height
3. **Tag remove buttons** (`<X>`) in the post editor tags input — `h-3 w-3` icons with minimal padding
4. **Poll option buttons** in `poll.tsx` — verify the clickable area is sufficient
5. **Toolbar buttons** in `post-editor.tsx` — `p-1.5` with `h-3.5 w-3.5` icons

For each finding:
- Calculate the actual rendered size (icon size + padding × 2)
- Note if it's on a mobile-heavy interaction (voting, RSVP, poll voting are all touch-heavy)
- Suggest the fix (typically add `min-h-11 min-w-11` or increase padding)

### Step 2: Form Label Associations

Every form input must have a programmatic label via `<label htmlFor>` + `id`, `aria-label`, or `aria-labelledby`.

Check all forms in:
- `src/app/(auth)/login/page.tsx` — email, password fields
- `src/app/(auth)/register/page.tsx` — name, username, email, password fields
- `src/app/(main)/feed/new/page.tsx` — title, category, tags, body
- `src/components/feed/poll-builder.tsx` — question, option inputs
- `src/components/feed/post-editor.tsx` — the textarea
- `src/app/(main)/marketplace/page.tsx` — search input, price range inputs
- `src/app/(main)/feed/page.tsx` — search input
- `src/app/(main)/feed/search/page.tsx` — search input
- Inline comment reply textareas in `comment-thread.tsx`

For each form:
1. Does every input have an associated `<label htmlFor>` + matching `id`?
2. If no visible label (icon-only search inputs), is there an `aria-label`?
3. Is placeholder text the ONLY label? (Placeholder is not a substitute — fails WCAG 1.3.1)

**Note on `@base-ui/react`**: This project uses `@base-ui/react`, not Radix. Verify that the shadcn form components actually render accessible label associations — inspect the generated HTML, not just the JSX.

### Step 3: Missing `aria-label` on Icon Buttons

Every button or link that contains only an icon (no visible text) needs `aria-label`.

Search for:
1. Vote buttons (`ChevronUp`/`ChevronDown`) without `aria-label` — they should have descriptive labels like "Upvote" / "Downvote"
2. Comment collapse rail `<button>` — needs `aria-label="Collapse thread"`
3. Navbar hamburger menu button — check if it has `aria-label="Open menu"`
4. Poll option radio-like buttons — need accessible labels
5. Post editor toolbar buttons — check each formatting button has a `title` attribute at minimum (but `aria-label` is preferred)
6. Tag remove `<X>` buttons — need `aria-label={`Remove tag ${tag}`}`
7. RSVP button — check it has descriptive text

### Step 4: Image Alt Text

Check every `<Image>` in the codebase:

1. **Hero logo** (`public/hero-logo.png`) in `src/app/(main)/page.tsx` — does it have descriptive `alt="Detachment Reaper logo"`?
2. **Any logo images** referenced in the Navbar — the text fallback has no image currently, but when the logo PNG is used, it needs `alt`
3. **Marketplace listing image placeholders** — currently showing "No Photo" text, not an image issue, but when real images are added, ensure `alt` describes the item
4. **Group logos** and **user avatars** — when real images replace the initial-letter placeholders, they need `alt`
5. **Public directory**: Are there any images in `public/` that are used without going through `next/image`?

### Step 5: Keyboard Navigation

Every interactive element must be keyboard accessible.

Search for:

1. **`<div onClick>` without keyboard support**: Any div with an `onClick` handler that lacks `role="button"`, `tabIndex={0}`, and `onKeyDown` — keyboard users can't activate these
2. **Comment collapse rail**: The `<button>` used as the collapse trigger — can it be reached and activated with Tab + Enter/Space?
3. **Custom poll options**: The poll option buttons are `<button>` elements (good), but verify focus styles are visible
4. **PostEditor tab switching**: The Write/Preview tab buttons — can they be navigated with keyboard?
5. **Tag input**: The tags pill input in the create post form — can tags be removed with keyboard (Backspace is handled, but can the X button be focused)?
6. **Mobile nav sheet**: When the Sheet opens on mobile, is focus trapped inside?
7. **Dropdown menus**: The user menu dropdown — can it be closed with Escape?
8. **`focus:outline-none` without replacement**: Search for this class — it removes the visible focus indicator without replacement, which fails WCAG 2.4.7

### Step 6: Contrast Issues (WCAG 1.4.3)

This is a dark-mode first site with small uppercase text — contrast is especially critical.

Check:

1. **`label-military` text** (`text-xs uppercase tracking-widest text-muted-foreground`) — `text-muted-foreground` resolves to `#a9a9a9` on `#0a0a0a` background. Calculate contrast ratio: approximately 7.4:1 — this passes AA. Verify this holds on card backgrounds (`#141414`).
2. **Faded text patterns** (`text-muted-foreground/60`, `text-muted-foreground/40`, `text-muted-foreground/30`) — these opacity variants may fail contrast. Check:
   - `[redacted]` text at `/30` opacity on card background
   - Metadata text at `/60` opacity
3. **Primary red on card backgrounds**: `text-primary` (`#e90003`) on `#141414` — calculate contrast ratio. Red on near-black can be problematic.
4. **Badge text**: Category badges use colored text on tinted backgrounds (e.g., `text-sky-400` on `bg-sky-500/10`) — verify contrast of each badge color variant on both `bg-background` and `bg-card`.
5. **Input placeholder text**: `placeholder:text-muted-foreground` — verify contrast of placeholder text meets the 4.5:1 requirement.

For each, calculate or estimate the contrast ratio and suggest the minimum-contrast alternative.

### Step 7: Screen Reader Issues

Search for:

1. **`aria-hidden="true"` on containers with focusable children**: Check decorative icon wrappers — if they contain focusable elements, `aria-hidden` will hide them from AT but keyboard focus can still land there
2. **Missing `aria-live` regions**: The poll vote state change, comment thread updates, and search results are dynamic — they need `aria-live="polite"` or `role="status"` so screen readers announce changes
3. **Decorative icons without `aria-hidden="true"`**: Lucide icons used purely decoratively (next to labels) should have `aria-hidden="true"` to prevent screen readers from announcing them
4. **`sr-only` context for vote counts**: Vote counts shown as numbers (e.g., "47") without context — screen readers need "47 upvotes" not just "47"
5. **CommentThread recursive nesting**: Deep nested comments should have appropriate ARIA list/listitem roles or a defined landmark to help screen readers understand the structure
6. **Animated backgrounds**: The LetterGlitch canvas element — does it have `aria-hidden="true"` and `role="presentation"` to prevent screen readers from trying to interpret it?

## Output Format

Write the results to `docs/code-review/pass-5-accessibility.md` using this format:

```markdown
# Pass 5 — Accessibility & UX

Code quality review focusing on touch targets, form labels, aria attributes, alt text, keyboard navigation, contrast, and screen reader support.

---

## 1. Touch Target Issues

**File:** `path/to/file.tsx` (line N)
**Issue:** [Touch | Label | Aria | Alt | Keyboard | Contrast | SR] — Description
**Impact:** Critical | High | Medium | Low
**Fix:** How to fix

---

## Summary

| Category | Critical | High | Medium | Low | Total |
| ... |

### Top 10 Priority Fixes

1. ...
```

## Important Guidelines

- Be exhaustive — check EVERY component, EVERY form, EVERY interactive element.
- Use `file_path:line_number` references for every finding.
- Calculate actual rendered sizes for touch targets (icon size + padding on each side).
- For contrast issues, cite the approximate contrast ratio.
- For keyboard issues, explain what a keyboard-only user would experience.
- For screen reader issues, explain what would be announced (or not announced).
- Prioritize by user impact: a broken focus trap affects every keyboard user; a missing `sr-only` label on a decorative icon is lower priority.
- Reference WCAG success criteria (e.g., 2.5.5 for touch targets, 1.4.3 for contrast, 4.1.2 for labels).
- The animated backgrounds (LetterGlitch, CircularText) are purely decorative — verify they're invisible to assistive technology.
