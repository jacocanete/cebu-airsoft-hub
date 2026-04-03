---
name: review-accessibility
description: "Comprehensive code review pass for accessibility — touch targets, form labels, ARIA attributes, alt text, keyboard navigation, contrast, and screen reader support. This is Pass 5 of a 5-pass code quality review. Use this skill when: user says 'review accessibility', 'a11y audit', 'pass 5', 'WCAG check', 'keyboard navigation', 'screen reader', 'contrast check', 'touch targets', or wants to audit the codebase for WCAG 2.1 AA compliance, missing ARIA labels, or assistive technology support."
---

## What This Skill Does

Run a comprehensive accessibility (a11y) audit of the Detachment Reaper codebase. This is **Pass 5** of a 5-pass code quality review. Check every interactive element, form, image, and dynamic content region for WCAG 2.1 AA compliance.

> **Before starting:** Use the `codebase-reference` skill to understand the project's tech stack, component library (`@base-ui/react`), routes, and design conventions. The site is dark-mode first with small text — contrast checking is especially important.

## When to Use

Run as the final pass after Passes 1-4. Covers touch targets, form labels, ARIA attributes, alt text, keyboard navigation, contrast, and screen reader compatibility.

## Review Procedure

### Step 1: Touch Target Issues (WCAG 2.5.5)

All interactive elements (buttons, links, inputs) must be at least 44x44px. In Tailwind, `size-11` = 44px.

Search every component for:

1. **Small icon-only buttons**: Vote buttons, action buttons with minimal padding — calculate actual rendered size (icon + padding on all sides)
2. **Comment action buttons**: "Reply", "Collapse" — check rendered height
3. **Tag remove buttons** (`<X>`) with small icons and minimal padding
4. **Poll option buttons** — verify clickable area is sufficient
5. **Toolbar buttons** — small padding with small icons

For each: calculate actual rendered size, note if it's a mobile-heavy interaction, suggest the fix (typically `min-h-11 min-w-11` or increased padding).

### Step 2: Form Label Associations

Every form input must have a programmatic label via `<label htmlFor>` + `id`, `aria-label`, or `aria-labelledby`.

Check all forms across the app:
1. Does every input have an associated `<label htmlFor>` + matching `id`?
2. If no visible label (icon-only search inputs), is there an `aria-label`?
3. Is placeholder text the ONLY label? (Placeholder is not a substitute — fails WCAG 1.3.1)

**Note on `@base-ui/react`**: Verify that the shadcn form components actually render accessible label associations — inspect the generated HTML patterns, not just the JSX.

### Step 3: Missing `aria-label` on Icon Buttons

Every button or link containing only an icon (no visible text) needs `aria-label`.

Search for:
1. Vote buttons without `aria-label`
2. Collapse/expand buttons without descriptive labels
3. Navbar hamburger menu — needs `aria-label="Open menu"`
4. Editor toolbar buttons — each needs `aria-label` or `title`
5. Tag remove buttons — need `aria-label={`Remove tag ${tag}`}`

### Step 4: Image Alt Text

Check every `<Image>` / `<img>` in the codebase:

1. Hero/logo images — descriptive `alt` text?
2. Avatar/profile images — meaningful `alt`?
3. Decorative images — `alt=""` (empty, not missing)?
4. Public directory images used without framework Image component?

### Step 5: Keyboard Navigation

Every interactive element must be keyboard accessible.

Search for:
1. **`<div onClick>` without keyboard support**: Needs `role="button"`, `tabIndex={0}`, and `onKeyDown`
2. **Custom interactive elements**: Can they be reached with Tab + activated with Enter/Space?
3. **Focus styles visible**: Search for `focus:outline-none` without replacement — fails WCAG 2.4.7
4. **Focus trapping**: When modals/sheets open, is focus trapped inside?
5. **Escape to close**: Can dropdowns/modals be closed with Escape?
6. **Tag inputs**: Can tags be removed with keyboard?

### Step 6: Contrast Issues (WCAG 1.4.3)

Dark-mode first site with small uppercase text — contrast is critical.

Check:
1. **Muted text on dark backgrounds** — calculate contrast ratio, verify it holds on card backgrounds too
2. **Faded text patterns** (opacity variants like `/60`, `/40`, `/30`) — these may fail contrast
3. **Primary red on card backgrounds** — red on near-black can be problematic
4. **Badge text** — colored text on tinted backgrounds for each badge variant
5. **Input placeholder text** — verify contrast meets 4.5:1 requirement

For each, calculate or estimate the contrast ratio and suggest minimum-contrast alternatives.

### Step 7: Screen Reader Issues

Search for:
1. **`aria-hidden="true"` on containers with focusable children** — keyboard focus can still land there
2. **Missing `aria-live` regions** — dynamic content (poll votes, search results, comment updates) needs `aria-live="polite"` or `role="status"`
3. **Decorative icons without `aria-hidden="true"`** — Lucide icons used decoratively should be hidden from AT
4. **Missing `sr-only` context** — numbers without context (e.g., "47" should be "47 upvotes")
5. **Deep nested structures** — recursive comments should have ARIA list/listitem roles
6. **Animated backgrounds** — canvas/WebGL elements need `aria-hidden="true"` and `role="presentation"`

## Output Format

Write results to `docs/code-review/pass-5-accessibility.md`:

```markdown
# Pass 5 — Accessibility & UX

Code quality review focusing on touch targets, form labels, ARIA attributes, alt text, keyboard navigation, contrast, and screen reader support.

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
- Animated backgrounds are purely decorative — verify they're invisible to assistive technology.
