---
name: review-accessibility
description: Comprehensive code review pass for accessibility — touch targets, form labels, aria attributes, alt text, keyboard navigation, contrast, and screen reader support
license: MIT
metadata:
  pass: "5"
  category: code-review
---

## What I Do

Run a comprehensive accessibility (a11y) audit of the Cebu Airsoft Hub codebase. This is Pass 5 of a 6-pass code quality review. I check every interactive element, form, image, and dynamic content region for WCAG 2.1 AA compliance.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, component library (`@base-ui/react`), and design conventions. The site is dark-mode first with small text — contrast checking is especially important.

## When to Use Me

Use this skill as Pass 5. This pass covers touch targets, form labels, ARIA attributes, alt text, keyboard navigation, contrast, and screen reader compatibility.

## Review Procedure

### Step 1: Touch Target Issues (WCAG 2.5.5)

All interactive elements (buttons, links, inputs) must be at least 44×44px. In Tailwind, `size-11` = 44px.

Search every component for small interactive elements:

1. **Vote buttons** (`ChevronUp`/`ChevronDown`) in feed posts and comments — calculate actual rendered size: icon size + padding on all four sides
2. **Comment action buttons**: "Reply", "Collapse" buttons in comment thread components — check rendered height
3. **Tag remove buttons** (`<X>`) in post creation forms — small icons with minimal padding
4. **Poll option buttons** — verify the clickable area covers enough surface for touch users
5. **Toolbar buttons** in the post editor — small icons with `p-1.5` padding

For each finding:
- Calculate the actual rendered size (icon size + padding × 2)
- Note if it's on a mobile-heavy interaction (voting, RSVP, poll voting are all touch-heavy)
- Suggest the fix (typically add `min-h-11 min-w-11` or increase padding)

### Step 2: Form Label Associations

Every form input must have a programmatic label via `<label htmlFor>` + `id`, `aria-label`, or `aria-labelledby`.

Search all form files across the codebase — look for any of these patterns:

1. Does every input have an associated `<label htmlFor>` + matching `id`?
2. If no visible label (icon-only search inputs), is there an `aria-label`?
3. Is placeholder text the ONLY label? (Placeholder is not a substitute — fails WCAG 1.3.1)

Check specifically:
- Auth forms (login, register) — email, password, username fields
- Post creation form — title, category, tags, body
- Poll builder — question input, option inputs
- Post editor — the main textarea
- Search inputs across all pages that use them
- Inline comment reply textareas
- Marketplace filter inputs (price range, search)

**Note on `@base-ui/react`**: This project uses `@base-ui/react`, not Radix. Verify that the shadcn form components actually render accessible label associations — inspect the generated HTML, not just the JSX.

### Step 3: Missing `aria-label` on Icon Buttons

Every button or link that contains only an icon (no visible text) needs `aria-label`.

Search for:
1. Vote buttons without `aria-label` — they should have descriptive labels like `"Upvote"` / `"Downvote"`
2. Comment collapse buttons — need `aria-label="Collapse thread"`
3. Navbar hamburger menu button — check if it has `aria-label="Open menu"`
4. Post editor toolbar buttons — each formatting button (Bold, Italic, etc.) needs `aria-label` or at minimum `title`
5. Tag remove `<X>` buttons — need `aria-label={`Remove tag ${tag}`}`
6. Any close/dismiss buttons in sheets, dialogs, or drawers
7. RSVP button — verify it has descriptive text that communicates both the action and current state

### Step 4: Image Alt Text

Check every `<img>` element in the codebase:

1. Does every `<img>` have an `alt` attribute?
2. Is the `alt` text descriptive — not just the filename or generic "image"?
3. Are purely decorative images using `alt=""` to hide them from screen readers?
4. Are there any images in the `public/` directory referenced in JSX without going through a component that adds `alt`?
5. Are avatar images (initial-letter placeholders) correctly marked as decorative (`aria-hidden="true"`) when the username is already visible nearby?
6. When real marketplace listing images or group logos are eventually added, is the surrounding code structured to require an `alt` prop?

### Step 5: Keyboard Navigation

Every interactive element must be keyboard accessible.

Search for:

1. **`<div onClick>` without keyboard support**: Any div with an `onClick` handler that lacks `role="button"`, `tabIndex={0}`, and `onKeyDown` — keyboard users can't activate these
2. **Comment collapse mechanisms**: The collapse trigger — can it be reached and activated with Tab + Enter/Space?
3. **Custom poll options**: The poll option buttons — verify focus styles are visible
4. **Post editor tab switching**: The Write/Preview tab buttons — can they be navigated with keyboard?
5. **Tag input**: The tags pill input — can tags be removed with keyboard (Backspace handled, but can the X button be focused and activated)?
6. **Mobile nav sheet**: When the Sheet opens on mobile, is focus trapped inside? Does Escape close it?
7. **Dropdown menus**: The user menu dropdown — can it be closed with Escape? Does focus return to the trigger after close?
8. **`focus:outline-none` without replacement**: Search for this class — it removes the visible focus indicator without replacement, which fails WCAG 2.4.7. It is only acceptable if paired with a custom `focus:ring-*` or `focus-visible:ring-*` style.

### Step 6: Contrast Issues (WCAG 1.4.3)

This is a dark-mode first site with small uppercase text — contrast is especially critical.

Check:

1. **`label-military` text** (`text-xs uppercase tracking-widest text-muted-foreground`) — `text-muted-foreground` on the dark background. Estimate contrast ratio and verify it meets 4.5:1 for this small text size.
2. **Faded text patterns** (`text-muted-foreground/60`, `/40`, `/30`) — these opacity variants may fail contrast. Any text at 40% or 30% opacity on a dark background will almost certainly fail.
3. **Primary red on card backgrounds**: `text-primary` (red) on `bg-card` — red on near-black can fall below the 4.5:1 requirement, especially for small text.
4. **Badge text**: Category badges use colored text on tinted backgrounds (e.g., `text-sky-400` on `bg-sky-500/10`) — verify contrast of each badge color variant on both `bg-background` and `bg-card`.
5. **Input placeholder text**: `placeholder:text-muted-foreground` — verify contrast of placeholder text meets the 4.5:1 requirement for normal text.

For each, calculate or estimate the contrast ratio and suggest the minimum-contrast alternative.

### Step 7: Screen Reader Issues

Search for:

1. **`aria-hidden="true"` on containers with focusable children**: Decorative icon wrappers that contain focusable elements — `aria-hidden` will hide them from AT but keyboard focus can still land there, creating a ghost focus trap.
2. **Missing `aria-live` regions**: Poll vote state changes, comment thread updates via Socket.io, and search results filtered in real-time are dynamic — they need `aria-live="polite"` or `role="status"` so screen readers announce changes.
3. **Decorative icons without `aria-hidden="true"`**: Lucide icons used purely decoratively (next to a visible label) should have `aria-hidden="true"` to prevent screen readers from announcing them as unlabeled graphics.
4. **`sr-only` context for vote counts**: Vote counts shown as bare numbers (e.g., "47") without context — screen readers need "47 upvotes" not just "47". Wrap the label in `<span className="sr-only"> upvotes</span>`.
5. **CommentThread recursive nesting**: Deep nested comments should have appropriate ARIA list/listitem roles (`role="list"`, `role="listitem"`) or landmark structure to help screen readers understand the hierarchy.
6. **Animated/canvas backgrounds**: Canvas elements used as decorative backgrounds must have `aria-hidden="true"` and `role="presentation"` to prevent screen readers from trying to interpret them.
7. **Loading states**: When `isLoading` is true and a skeleton is shown, is there an `aria-busy="true"` or `role="status"` announcement so screen readers know content is loading?

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
- Prioritize by user impact: a broken focus trap affects every keyboard user; a missing `aria-hidden` on a decorative icon is lower priority.
- Reference WCAG success criteria (e.g., 2.5.5 for touch targets, 1.4.3 for contrast, 4.1.2 for labels).
- The animated backgrounds (canvas components, circular text) are purely decorative — verify they're invisible to assistive technology.
- Do not reference `next/image` — this project uses raw `<img>` tags.
