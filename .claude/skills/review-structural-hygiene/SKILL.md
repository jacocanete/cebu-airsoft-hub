---
name: review-structural-hygiene
description: "Comprehensive code review pass for structural hygiene — file sizes, dead code, misplaced code, client/server boundaries, multi-component files, and missing route files. This is Pass 1 of a 5-pass code quality review. Use this skill when: user says 'review structure', 'structural review', 'code hygiene', 'pass 1', 'check file sizes', 'find dead code', 'audit boundaries', or wants to run the first pass of the code review pipeline. Also trigger when user asks about file organization, code placement, or client/server component boundaries."
---

## What This Skill Does

Run a comprehensive structural hygiene audit of the Detachment Reaper codebase. This is **Pass 1** of a 5-pass code quality review. It examines every file for structural issues that affect maintainability, readability, and framework best practices.

> **Before starting:** Use the `codebase-reference` skill (or read `PLANNING.md` and key config files) to understand the project's tech stack, directory structure, conventions, and patterns. Ground all findings in that context.

## When to Use

Run this as the first pass before deeper reviews (DRY, React patterns, performance, accessibility).

## Review Procedure

### Step 1: Scan for Oversized Files

Search every `.ts` and `.tsx` file in `src/`. Count lines in each. Flag files exceeding:

- **Over 200 lines**: "should review for splitting"
- **Over 500 lines**: "oversized — likely needs splitting"
- **Over 1,000 lines**: "critical — must split"

For each flagged file, describe what it contains and suggest how to split it.

### Step 2: Find Dead Code

Search for:

- Exported functions/components/types never imported elsewhere
- Files never imported by any other file
- Commented-out code blocks (3+ consecutive commented lines)
- Unused imports within files
- `console.log` statements left in production code

For each finding, report file path, line number, the dead code, and whether it's safe to remove.

### Step 3: Identify Misplaced Code

Check code is in the correct directory per conventions:

- Page-level components in route files
- Reusable UI components in `src/components/[feature]/` or `src/components/ui/`
- Shared utilities in `src/lib/`
- Shared TypeScript types in `src/types/`
- Server Actions in `src/lib/actions/` (when added)
- Validation schemas in `src/lib/validations/` (when added)

Flag types, utilities, or constants defined inline that should be extracted.

### Step 4: Audit Client/Server Boundaries

Check every file in `src/`:

- Files with `"use client"` that don't need it (no hooks, no event handlers, no browser APIs, no state)
- Page components that should be Server Components but have `"use client"` at the top level
- Client Components that are unnecessarily large — could be split so only the interactive part is client
- Server Components importing heavy client libraries unnecessarily

Explain what can be moved to a Server Component and what must stay client-side.

### Step 5: Find Multi-Component Files

Search for files exporting more than one React component. The convention is one primary component per file.

Exceptions:
- Small internal helper components (not exported) used only within the same file
- Component + its loading variant in the same file

### Step 6: Check for Missing Route Files

For every route directory with a `page.tsx`, check if these exist:

- `loading.tsx` — loading UI skeleton
- `error.tsx` — error boundary
- `not-found.tsx` — custom 404 (only needed at root or specific routes)

Flag their absence for tracking (low priority until backend is wired up).

### Step 7: Check Component Naming and Import Consistency

- All components PascalCase?
- All utility/lib files camelCase?
- Imports using path alias consistently (not relative `../../` paths)?
- `next/image` and `next/link` used instead of raw `<img>` and `<a>` tags?

### Step 8: Verify Async Page Props

In newer Next.js versions, `params` and `searchParams` are Promises and must be awaited. Check every dynamic route page:

```tsx
// CORRECT
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// WRONG — id will be undefined at runtime
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}
```

Search for pages with `params`/`searchParams` that are NOT async or not properly typed as Promise.

## Output Format

Write results to `docs/code-review/pass-1-structural-hygiene.md`:

```markdown
# Pass 1 — Structural Hygiene

Code quality review focusing on file sizes, dead code, misplaced code, client/server boundaries, multi-component files, and missing route files.

---

## 1. Oversized Files

**File:** `path/to/file.tsx` (N lines)
**Issue:** [Size] — Description
**Impact:** High | Medium | Low
**Fix:** How to split it

---

## Summary

| Category | High | Medium | Low | Total |
| ... |

### Top Priority Fixes

1. ...
```

## Important Guidelines

- Be exhaustive. Check EVERY file, not just a sample.
- Use `file_path:line_number` references for every finding.
- Do not guess — verify by searching the codebase for actual imports/usage before flagging dead code.
- For oversized files, actually count the lines.
- Group related findings together for readability.
- End with a prioritized summary table and top 5-10 fix recommendations.
- This project is currently frontend-only with mock data. Don't flag missing backend patterns as structural issues.
