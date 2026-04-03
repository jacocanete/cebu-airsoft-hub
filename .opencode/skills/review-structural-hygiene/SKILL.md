---
name: review-structural-hygiene
description: Comprehensive code review pass for structural hygiene — file sizes, dead code, misplaced code, client/server boundaries, multi-component files, and missing route files
license: MIT
metadata:
  pass: "1"
  category: code-review
---

## What I Do

Run a comprehensive structural hygiene audit of the Detachment Reaper codebase. This is Pass 1 of a 5-pass code quality review. I examine every file for structural issues that affect maintainability, readability, and Next.js best practices.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, directory structure, conventions, and patterns. All findings should be grounded in that context.

## When to Use Me

Use this skill when you want a thorough structural review of the codebase. Run this as the first pass before deeper reviews (DRY, React patterns, performance, accessibility).

## Review Procedure

### Step 1: Scan for Oversized Files

Search every `.ts` and `.tsx` file in `src/`. Count the lines in each file. Flag files exceeding these thresholds:

- **Over 200 lines**: Note as "should review for splitting"
- **Over 500 lines**: Flag as "oversized — likely needs splitting"
- **Over 1,000 lines**: Flag as "critical — must split"

For each flagged file, briefly describe what it contains and suggest how to split it. For example, a large page component might be split into a main page + extracted sub-components or moved into `src/components/[feature]/`.

### Step 2: Find Dead Code

Search for:

- Exported functions/components/types that are never imported anywhere else in the codebase
- Files that are never imported by any other file
- Commented-out code blocks (more than 3 consecutive commented lines)
- Unused imports within files
- `console.log` statements left in production code

For each finding, report the file path, line number, the dead code, and whether it's safe to remove.

### Step 3: Identify Misplaced Code

Check that code is in the correct directory per the project's conventions (see `codebase-reference`):

- Page-level components belong in `src/app/`
- Reusable UI components belong in `src/components/[feature]/` or `src/components/ui/`
- Shared utility functions belong in `src/lib/`
- Shared TypeScript types belong in `src/types/`
- When Server Actions are added, they belong in `src/lib/actions/`
- When validation schemas are added, they belong in `src/lib/validations/`

Flag any types, utilities, or constants defined inline in component or page files that should be extracted to their proper location.

### Step 4: Audit Client/Server Boundaries

Check every file in `src/app/` and `src/components/`:

- Files with `"use client"` that don't actually need it (no hooks, no event handlers, no browser APIs, no state)
- Page components that should be Server Components but have `"use client"` at the top level instead of pushing it down to child components
- Client Components that are unnecessarily large — could be split so only the interactive part is a Client Component
- Server Components that import heavy Client Component libraries unnecessarily

For each issue, explain what can be moved to a Server Component and what must stay client-side. The goal is to keep as much as possible server-rendered for performance.

### Step 5: Find Multi-Component Files

Search for files that export more than one React component. The project convention is one primary component per file.

Exceptions:
- Small internal helper components (not exported) used only within the same file are fine
- Component + its loading variant in the same file is acceptable

For each multi-component file, list the components and suggest how to split them.

### Step 6: Check for Missing Route Files

For every directory under `src/app/` that has a `page.tsx`, check if these files exist:

- `loading.tsx` — loading UI skeleton (improves perceived performance)
- `error.tsx` — error boundary (prevents the whole page from crashing on errors)
- `not-found.tsx` — custom 404 (only needed at root level or specific routes)

Note: Currently all pages use mock data, so `loading.tsx` and `error.tsx` are low priority until the backend is wired up. Flag their absence for tracking.

### Step 7: Check Component Naming and Import Consistency

- Are all components PascalCase (`Navbar.tsx`, `CommentThread.tsx`)?
- Are all utility/lib files camelCase (`prose.ts`)?
- Are imports using the `@/` alias consistently (not relative `../../` paths)?
- Are `next/image` and `next/link` used instead of raw `<img>` and `<a>` tags?

## Output Format

Write the results to `docs/code-review/pass-1-structural-hygiene.md` using this format:

```markdown
# Pass 1 — Structural Hygiene

Code quality review focusing on file sizes, dead code, misplaced code, client/server boundaries, multi-component files, and missing route files.

---

## 1. Oversized Files

**File:** `path/to/file.tsx` (N lines)
**Issue:** [Size] — Description of what the file contains
**Impact:** High | Medium | Low
**Fix:** How to split it

---

## 2. Dead Code

(same format per finding)

## 3. Misplaced Code

## 4. Client/Server Boundaries

## 5. Multi-Component Files

## 6. Missing Route Files

## 7. Naming & Import Consistency

---

## Summary

| Category | High | Medium | Low | Total |
| ... |

### Top Priority Fixes

1. ...
```

### Step 8: Verify Async Page Props (Next.js 16)

In Next.js 16, `params` and `searchParams` are Promises and must be awaited. Check every dynamic route page (`[id]`, `[slug]`, `[username]`) and every page that reads `searchParams`:

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

Search for:
1. Pages with `params` or `searchParams` props that are NOT `async` functions
2. Pages with `params` typed as `{ id: string }` instead of `Promise<{ id: string }>`
3. Pages that access `searchParams.q` or similar without `await`ing first

For each finding, show the corrected async version with proper type signatures.

## Important Guidelines

- Be exhaustive. Check EVERY file, not just a sample.
- Use `file_path:line_number` references for every finding.
- Do not guess — verify by searching the codebase for actual imports/usage before flagging something as dead code.
- For oversized files, actually count the lines.
- Group related findings together for readability.
- End with a prioritized summary table and top 5-10 fix recommendations.
- Remember: this project is currently frontend-only with mock data. Don't flag missing backend patterns as structural issues.
