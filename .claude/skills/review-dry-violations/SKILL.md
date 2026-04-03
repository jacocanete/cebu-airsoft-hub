---
name: review-dry-violations
description: "Comprehensive code review pass for DRY violations — duplicated logic, patterns, types, constants, and validation across the entire codebase. This is Pass 2 of a 5-pass code quality review. Use this skill when: user says 'review dry', 'find duplicates', 'DRY review', 'pass 2', 'duplicated code', 'code duplication', or wants to find repeated patterns that should be extracted into shared utilities, hooks, components, or modules."
---

## What This Skill Does

Run a comprehensive DRY (Don't Repeat Yourself) audit of the Detachment Reaper codebase. This is **Pass 2** of a 5-pass code quality review. Find every instance of duplicated logic, repeated patterns, redundant types, scattered constants, and duplicated validation that should be consolidated.

> **Before starting:** Use the `codebase-reference` skill to understand the project's tech stack, directory structure, conventions, and patterns. Ground all findings in that context.

## When to Use

Run this after Pass 1 (Structural Hygiene) to find duplicated code that should be consolidated.

## Review Procedure

### Step 1: Duplicated Category / Badge Color Maps

The project defines category color maps inline in multiple files. Search for:

- `categoryColors` objects defined in more than one file
- `conditionColors` / `statusColors` objects defined in more than one file
- `gameTypeColors` objects defined in more than one file

These should be extracted to a shared constants file (e.g., `src/lib/constants.ts`).

### Step 2: Duplicated Mock Data Patterns

Search for:

- The same mock user objects duplicated across multiple page files
- The same mock post, event, or listing data repeated across pages
- Mock data that should be in `src/lib/mock-data.ts`

### Step 3: Duplicated UI Patterns

Search for repeated UI patterns that should be extracted:

- **Category badge rendering**: Same `className` logic for category-to-color mapping repeated across pages
- **Empty state patterns**: "No results" states with icon + message — are they consistent?
- **Page header pattern**: `border-l-2 border-primary pl-3` + `label-military` eyebrow + heading — candidate for a `<PageHeader>` component
- **Stat/count display patterns**: Numbers with labels repeated across places
- **Avatar/user chip pattern**: Avatar initials + username link pattern repeated in comments, events, etc.

### Step 4: Duplicated Type Definitions

Search for:

- Types defined inline that duplicate types in `src/types/index.ts`
- Similar but slightly different types that could be unified
- Inline interface definitions that should be imported from `src/types/`

### Step 5: Duplicated Prose / Markdown Classes

Verify `PROSE_CLASSES` from `src/lib/prose.ts` is used consistently everywhere markdown is rendered. Search for:

- Any inline `prose prose-sm prose-invert` class strings not using the shared constant
- Any component rendering markdown without `PROSE_CLASSES`

### Step 6: Duplicated Tailwind Utility Strings

Search for repeated long Tailwind class strings appearing in 3+ places:

- Button/link styles
- Ghost button styles
- Input styles
- Label styles

Candidates for shared component extraction or utility classes in `globals.css`.

### Step 7: Duplicated Constants

Search for:

- Magic numbers or strings repeated across files
- Category arrays defined in multiple files
- Status arrays/objects repeated across files
- Error messages appearing in multiple places

### Step 8: Duplicated Validation Logic

Search for:

- Tag input logic (Enter/comma to add, Backspace to remove) in more than one form — extract to `useTagInput` hook
- Form submission guards with same conditions repeated
- Character count / max length checks applied inconsistently

### Step 9: Future Auth Boilerplate (Flag for Later)

When auth is implemented, watch for session-checking being duplicated across Server Components. Flag as a reminder to create a `requireAuth()` helper immediately.

## Output Format

Write results to `docs/code-review/pass-2-dry-violations.md`:

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
