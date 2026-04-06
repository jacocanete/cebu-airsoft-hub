---
name: review-structural-hygiene
description: Comprehensive code review pass for structural hygiene — file sizes, dead code, misplaced code, client/server boundaries, multi-component files, and missing route files
license: MIT
metadata:
  pass: "1"
  category: code-review
---

## What I Do

Run a comprehensive structural hygiene audit of the Cebu Airsoft Hub codebase. This is Pass 1 of a 6-pass code quality review. I examine every file for structural issues that affect maintainability, readability, and adherence to project conventions.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, directory conventions, naming rules, and patterns. All findings must be grounded in that context.

## When to Use Me

Use this skill when you want a thorough structural review of the codebase. Run this as the first pass before deeper reviews (DRY, React patterns, performance, accessibility, backend).

## Review Procedure

### Step 1: Scan for Oversized Files

Search every `.ts` and `.tsx` file in `src/` and `server/src/`. Count the lines in each file. Flag files exceeding these thresholds:

- **Over 200 lines**: Note as "should review for splitting"
- **Over 500 lines**: Flag as "oversized — likely needs splitting"
- **Over 1,000 lines**: Flag as "critical — must split"

For each flagged file, describe what it contains and suggest how to split it. For example, a large route component might be split into a page file + extracted sub-components moved to `src/components/[feature]/`.

### Step 2: Find Dead Code

Search for:

- Exported functions, components, or types that are never imported anywhere else in the codebase
- Files that are never imported by any other file
- Commented-out code blocks (more than 3 consecutive commented lines)
- Unused imports within files
- `console.log` statements left in production code

For each finding, report the file path, line number, the dead code, and whether it's safe to remove.

### Step 3: Identify Misplaced Code

Check that code is in the correct directory per the project's conventions (see `codebase-reference`):

- Route-level components and page logic belong in `src/routes/`
- Reusable components used across multiple routes belong in `src/components/shared/`
- Feature-specific components belong in `src/components/[feature]/`
- shadcn/ui primitives and custom UI belong in `src/components/ui/`
- Data-fetching hooks belong in `src/hooks/` — never inline in components or route files
- Shared utilities belong in `src/lib/`
- All shared TypeScript types belong in `src/types/index.ts` — never duplicated elsewhere
- Backend route handlers belong in `server/src/routes/`
- Socket.io handlers belong in `server/src/socket/`

Flag any types, utilities, constants, or hook logic defined inline in component or route files that should be in their proper location.

### Step 4: Audit Hook vs Component Boundaries

Data fetching must never leak into components or route files directly. Check:

- **No `useQuery` / `useMutation` calls inside component files** — all React Query hooks must live in `src/hooks/`
- **No `fetch()` or `api.*` calls inside components** — these belong in hook files only
- **No `socket.on()` / `socket.emit()` scattered across components** — Socket.io logic belongs in hooks
- **Route files should be thin** — they call hooks from `src/hooks/` and pass data to components; they do not contain query definitions or data-fetching logic

For each violation, note the file, line number, and which hook file it should be moved to.

### Step 5: Find Multi-Component Files

Search for files that export more than one React component. The project convention is one primary component per file.

Exceptions:
- Small internal helper components (not exported) used only within the same file are fine
- A component paired with a loading/skeleton variant in the same file is acceptable

For each multi-component file, list the exported components and suggest how to split them.

### Step 6: Check TanStack Router Configuration

For every dynamic route (files prefixed with `$`) and every authenticated route, check:

- **Missing `pendingComponent`** — routes that fetch data (use hooks with `useQuery`) should define a `pendingComponent` for the loading state
- **Missing `errorComponent`** — routes with data dependencies should define an `errorComponent` to prevent the entire page from going blank on errors
- **Missing auth guards** — protected routes (anything requiring login to use) should have a `beforeLoad` that redirects to `/login` if the user is not authenticated. Check that this is not handled ad-hoc in component bodies.

```tsx
// Pattern to look for:
export const Route = createFileRoute("/_main/feed/new")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/login" })
  },
  pendingComponent: () => <Skeleton />,
  errorComponent: ({ error }) => <ErrorMessage error={error} />,
  component: NewPostPage,
})
```

### Step 7: Check Naming and Import Consistency

- Are all route files following TanStack Router naming conventions? (`__root.tsx`, `_layout.tsx`, `$param.tsx`)
- Are all components PascalCase?
- Are all utility/lib files camelCase?
- Are all hook files kebab-case prefixed with `use-`?
- Are imports using the `@/` alias consistently — no relative `../../` paths?
- Are there any `<a href>` tags that should use `<Link>` from `@tanstack/react-router`?
- Are there any raw `<img>` tags that are missing `loading="lazy"`, `width`, `height`, or `decoding="async"` attributes?

### Step 8: TanStack Router Param and Search Access

Check every dynamic route file (`$id.tsx`, `$slug.tsx`, `$username.tsx`) and every route with search params:

- Dynamic params must be accessed via `Route.useParams()` or the typed `useParams` hook — not from `window.location` or URL parsing
- Search params must be accessed via `Route.useSearch()` — not `window.location.search`
- Routes reading search params must declare a `validateSearch` function with the expected shape

```tsx
// CORRECT
const { id } = Route.useParams()
const { q } = Route.useSearch()

// WRONG — bypasses the router's type safety
const id = window.location.pathname.split("/").pop()
```

### Step 9: Server-Client Type Sync

Check that the types in `src/types/index.ts` match what the backend actually returns. Mismatches here cause silent runtime failures.

- Compare the shape of Prisma queries in `server/src/routes/` (what fields are selected/included) against the corresponding TypeScript types in `src/types/index.ts`
- Flag any type that has fields the API never returns, or omits fields the API always sends
- Check that optional fields (`?`) in TypeScript types correspond to fields that are actually nullable or optional in the Prisma query

## Output Format

Write the results to `docs/code-review/pass-1-structural-hygiene.md` using this format:

```markdown
# Pass 1 — Structural Hygiene

Code quality review focusing on file sizes, dead code, misplaced code, hook/component boundaries, multi-component files, router configuration, and type sync.

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

## 4. Hook vs Component Boundaries

## 5. Multi-Component Files

## 6. TanStack Router Configuration

## 7. Naming & Import Consistency

## 8. Router Param & Search Access

## 9. Server-Client Type Sync

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
- Do not guess — verify by searching the codebase for actual imports/usage before flagging something as dead code.
- For oversized files, actually count the lines.
- Group related findings together for readability.
- End with a prioritized summary table and top 5–10 fix recommendations.
