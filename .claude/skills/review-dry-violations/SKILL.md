---
name: review-dry-violations
description: Comprehensive code review pass for DRY violations — duplicated logic, patterns, types, constants, and validation across the entire codebase
license: MIT
metadata:
  pass: "2"
  category: code-review
---

## What I Do

Run a comprehensive DRY (Don't Repeat Yourself) audit of the Detachment Reaper codebase. This is Pass 2 of a 6-pass code quality review. I find every instance of duplicated logic, repeated patterns, redundant types, scattered constants, and duplicated validation that should be extracted into shared utilities, hooks, components, or modules.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, directory conventions, and patterns. All findings should be grounded in that context.

## When to Use Me

Use this skill after Pass 1 (Structural Hygiene) to find duplicated code that should be consolidated.

## Review Procedure

### Step 1: Duplicated Category / Badge Color Maps

All badge color maps are centralized in `src/lib/constants.ts`. Search for any color map objects defined outside of that file:

- `categoryColors` / `CATEGORY_COLORS` objects defined in component or route files
- `conditionColors` / `CONDITION_COLORS` objects defined outside `constants.ts`
- `gameTypeColors`, `eventStatusColors`, `listingStatusColors` defined anywhere except `constants.ts`

Any inline color map is a DRY violation — it should import from `@/lib/constants` instead. Check that `FALLBACK_BADGE` is also used consistently rather than each file defining its own fallback.

### Step 2: Mock Data Migration Progress

`src/lib/mock-data.ts` contains mock data that should be replaced by real React Query hooks as the project migrates to live API data. Search for:

- Imports of `MOCK_*` constants from `src/lib/mock-data.ts` in route files or components
- Route files that still use mock data instead of calling hooks from `src/hooks/`
- Any mock data defined inline in component or route files (not in `mock-data.ts`) — these should either be migrated to the API or moved to `mock-data.ts` centrally

Report which routes still use mock data vs. which are fully wired to real hooks. This provides a migration progress tracker.

### Step 3: Duplicated UI Patterns

Search for repeated UI patterns that should be extracted into shared components in `src/components/shared/`:

- **Page header pattern**: `border-l-2 border-primary pl-3` + `label-military` eyebrow + `font-black uppercase` heading — if this appears in more than one route file, it should use the `<PageHeader>` shared component
- **Empty state patterns**: "No results" UI (icon + message) rendered differently per route — should be a single shared `<EmptyState>` component
- **Back link pattern**: `< Back to X` navigation links — should use the `<BackLink>` shared component
- **User avatar pattern**: Initial-letter avatar box + username rendered across comments, event roster, organizer cards — should use the `<UserAvatar>` shared component
- **Loading skeleton pattern**: Skeleton card grids — should use the `<SkeletonList>` / `<SkeletonCard>` shared components

For each, check if the shared component already exists in `src/components/shared/` but is being ignored. Using an existing shared component incorrectly (or not at all) is worse than not having one.

### Step 4: Duplicated Type Definitions

Search for:

- Types defined inline in component or route files that duplicate types already in `src/types/index.ts`
- Similar but slightly different types that could be unified (e.g., separate `PostListItem` vs `PostDetail` types that share most fields)
- Inline interface definitions for API response shapes that should be in `src/types/`
- Props interfaces exported from component files — these should stay local, not be in `src/types/`
- The same type shape defined more than once across the codebase

### Step 5: Duplicated Prose / Markdown Classes

Verify that `PROSE_CLASSES` from `src/lib/prose.ts` is used consistently everywhere markdown is rendered. Search for:

- Any inline `prose prose-sm prose-invert` class strings not using the shared constant
- Any component rendering `<ReactMarkdown>` without applying `PROSE_CLASSES`

This was the original reason `src/lib/prose.ts` was created — make sure it's being used everywhere.

### Step 6: Duplicated Tailwind Utility Strings

Search for repeated long Tailwind class strings that appear in 3+ places:

- Button/link styles with repeated padding, font, and tracking combinations
- Ghost button styles
- Input styles
- Label styles using `label-military`
- Card container styles using `bg-card border border-border`

These are candidates for either shared component extraction or additional utility classes in `globals.css`. Show actual code snippets from multiple files to prove the duplication exists.

### Step 7: Duplicated Constants and Config Values

Search for:

- Magic numbers or strings repeated across files (e.g., player cap defaults, max tag counts)
- Category arrays defined in multiple files — these should come from `src/lib/constants.ts` (`FORUM_CATEGORIES`, `MARKETPLACE_CATEGORIES`, `CONDITIONS`, `GAME_TYPES`)
- Status arrays repeated across files
- `staleTime`, `retry`, or `gcTime` values hardcoded in multiple hook files instead of a shared React Query config

### Step 8: Duplicated Client-Side Validation Logic

Search for:

- Tag input logic (Enter/comma to add, Backspace to remove, max count) appearing in more than one form — candidate for a `useTagInput` hook
- Form submission guards (`disabled={!canSubmit}`) with the same conditions repeated across forms
- Character count / max length checks applied inconsistently across text inputs
- The same Zod schema defined on both the client (form validation) and server (API validation) with no shared source

### Step 9: Duplicated Auth and Session Patterns

Better Auth is fully implemented. Check for duplicated auth patterns across the codebase:

- **On the server**: The `requireAuth` / `optionalAuth` middleware pattern is centralized in `server/src/middleware/auth.ts`. Check that no route file re-implements session checking manually instead of using these middleware functions.
- **Type assertion duplication**: The pattern `(req.user as { username?: string }).username` or similar unsafe assertions — if this appears in multiple route files, the `AuthRequest` type in the middleware should be updated to include the field properly instead.
- **On the client**: Check that auth state reads come only from the `useCurrentUser()` hook — not from `localStorage`, manual session checks, or repeated `api.get("/api/auth/get-session")` calls outside of the hook.

### Step 10: React Query Hook Pattern Consistency

The 7 hook files in `src/hooks/` should follow a consistent structure. Search for:

- **Inconsistent `queryKey` formats**: Keys should follow a consistent nesting pattern (e.g., `["posts"]`, `["posts", id]`, `["posts", "list", filters]`) — mixing flat and nested keys breaks cache invalidation
- **Hardcoded `staleTime`**: If `staleTime` is configured differently per hook without clear reason, document the discrepancy
- **Missing `enabled` flags**: Hooks that accept optional parameters (e.g., `usePostDetail(id)` where `id` may be undefined) must use `enabled: !!id` to prevent queries from firing with invalid params
- **`onSuccess` callback inconsistency**: Some mutations use `onSuccess` for cache invalidation while others don't invalidate at all — check that every mutation that modifies data properly invalidates the related queries
- **Duplicated invalidation logic**: If multiple mutation hooks invalidate the same query keys, consider whether the invalidation pattern is consistent

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
