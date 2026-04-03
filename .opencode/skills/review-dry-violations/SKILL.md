---
name: review-dry-violations
description: Comprehensive code review pass for DRY violations — duplicated logic, patterns, types, constants, and validation across the entire codebase
license: MIT
metadata:
  pass: "2"
  category: code-review
---

## What I Do

Run a comprehensive DRY (Don't Repeat Yourself) audit of the Detachment Reaper codebase. This is Pass 2 of a 5-pass code quality review. I find every instance of duplicated logic, repeated patterns, redundant types, scattered constants, and duplicated validation that should be extracted into shared utilities, hooks, components, or modules.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, directory structure, conventions, and patterns. All findings should be grounded in that context.

## When to Use Me

Use this skill after Pass 1 (Structural Hygiene) to find duplicated code that should be consolidated.

## Review Procedure

### Step 1: Duplicated Category / Badge Color Maps

The project defines category color maps (forum categories, marketplace conditions, event game types) inline in multiple page files. Search for:

- `categoryColors` objects defined in more than one file
- `conditionColors` / `statusColors` objects defined in more than one file
- `gameTypeColors` objects defined in more than one file

These should be extracted to a shared constants file (e.g., `src/lib/constants.ts`). Check `codebase-reference` for the canonical versions.

### Step 2: Duplicated Mock Data Patterns

Currently all data is mocked inline in page files. Search for:

- The same mock user objects (e.g., `ghost_reaper`, `tac_pablo`) duplicated across multiple page files
- The same mock post, event, or listing data repeated across pages
- Mock data that should be in a shared `src/lib/mock-data.ts` or `src/lib/fixtures.ts` file

### Step 3: Duplicated UI Patterns

Search for repeated UI patterns that should be extracted into shared components:

- **Category badge rendering**: The same `className` logic for category → color mapping repeated across feed, search, and post pages
- **Empty state patterns**: "No results" states with icon + message — are these consistent or each page has its own?
- **Page header pattern**: `border-l-2 border-primary pl-3` + `label-military` eyebrow + `font-black uppercase` heading — repeated on every page, candidate for a `<PageHeader>` component
- **Stat/count display patterns**: Numbers with labels (upvotes, views, member counts) rendered similarly across multiple places
- **Avatar/user chip pattern**: Avatar initials box + username link pattern repeated in comments, event roster, organizer card

### Step 4: Duplicated Type Definitions

Search for:

- Types defined inline in component or page files that duplicate types in `src/types/index.ts`
- Similar but slightly different types that could be unified
- Inline interface definitions that should be imported from `src/types/`
- The `Comment` type — it's defined in `src/components/feed/comment-thread.tsx` AND referenced in `src/app/(main)/feed/[id]/page.tsx`. Check if this should be in `src/types/`

### Step 5: Duplicated Prose / Markdown Classes

Verify that `PROSE_CLASSES` from `src/lib/prose.ts` is used consistently everywhere markdown is rendered. Search for:

- Any inline `prose prose-sm prose-invert` class strings not using the shared constant
- Any component rendering markdown without `PROSE_CLASSES`

This was the original reason `src/lib/prose.ts` was created — make sure it's being used everywhere.

### Step 6: Duplicated Tailwind Utility Strings

Search for repeated long Tailwind class strings that appear in 3+ places:

- Button/link styles: `rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground`
- Ghost button styles: `rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest`
- Input styles: `h-9 rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1`
- Label styles: `label-military text-foreground`

These are candidates for either shared component extraction or additional utility classes in `globals.css`.

### Step 7: Duplicated Constants

Search for:

- Magic numbers or strings repeated across files (e.g., player cap values, max tag counts, image size limits)
- Category arrays defined in multiple files (`CATEGORIES`, `GAME_TYPES`, `CONDITIONS`, etc.)
- Status arrays/objects (listing status, event status, RSVP status) repeated across files
- Error messages that appear in multiple places

### Step 8: Duplicated Validation Logic (Client-Side)

Currently the project has minimal validation — mostly in form components. Search for:

- Tag input logic (Enter/comma to add, Backspace to remove, max count) — if this appears in more than one form, extract to a `useTagInput` hook
- Form submission guards (`disabled={!canSubmit}`) with the same conditions repeated
- Character count / max length checks applied inconsistently

### Step 9: Future Auth Boilerplate (flag for later)

When auth is implemented with NextAuth, watch for the session-checking pattern being duplicated across Server Components:

```typescript
// This pattern will appear everywhere — plan to extract a helper
const session = await getServerSession(authOptions)
if (!session?.user) redirect("/login")
```

Flag this section as a reminder: when auth is added, create a `requireAuth()` Server Component helper immediately to prevent this from being copied everywhere.

## Output Format

Write the results to `docs/code-review/pass-2-dry-violations.md` using this format:

```markdown
# Pass 2 — DRY Violations

Code quality review focusing on duplicated logic, patterns, types, constants, and validation.

---

## 1. Badge Color Map Duplication

**Files:** List all files with the pattern
**Count:** N occurrences across M files
**Issue:** [DRY] — Description
**Impact:** High | Medium | Low
**Fix:** Proposed shared constant/utility with code example

---

(same format for all findings)

## Summary

| Category | Occurrences | Files Affected | Impact |
| ... |

### Top Priority Extractions

1. ...
```

## Important Guidelines

- Be exhaustive. Search the ENTIRE codebase, not just obvious locations.
- Show actual code snippets from multiple files to demonstrate the duplication.
- For each finding, provide a concrete code example of the extracted utility/hook/component.
- Quantify the duplication: how many files, how many lines would be saved.
- Prioritize by impact: a pattern repeated many times is more urgent than one repeated twice.
- Don't flag intentional repetition (similar but meaningfully different logic).
- Check if shared utilities already exist but are being ignored — this is worse than not having them.
- Use `file_path:line_number` references for every finding.
