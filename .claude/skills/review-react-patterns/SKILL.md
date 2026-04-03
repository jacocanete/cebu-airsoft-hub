---
name: review-react-patterns
description: "Comprehensive code review pass for React anti-patterns — re-renders, useEffect misuse, component boundaries, index keys, missing memoization, derived state, and component design. This is Pass 3 of a 5-pass code quality review. Use this skill when: user says 'review react', 'react patterns', 'pass 3', 'check re-renders', 'useEffect audit', 'react anti-patterns', 'component review', or wants to find React-specific issues like stale closures, unnecessary state, prop drilling, or missing cleanup."
---

## What This Skill Does

Run a comprehensive React patterns audit of the Detachment Reaper codebase. This is **Pass 3** of a 5-pass code quality review. Find anti-patterns that cause unnecessary re-renders, incorrect state management, component boundary problems, and violations of canonical React best practices.

> **Before starting:** Use the `codebase-reference` skill to understand the component structure and which files are Client Components (`"use client"`). Only Client Components are in scope — Server Components have no React lifecycle.

## When to Use

Run after Pass 2 (DRY Violations). Focus exclusively on `"use client"` files.

## Review Procedure

### Step 1: Illegal `useEffect` Data Fetching

`useEffect` should never fetch data — it runs after paint, causes loading flickers, has no built-in cancellation, and creates race conditions. Data belongs in Server Components or triggered by user events via Server Actions.

Search every `"use client"` component for `useEffect` calls that fetch data.

**Legitimate `useEffect` uses** — do NOT flag:
- Event listener setup/teardown
- Timer setup/teardown
- Canvas/WebGL initialization
- DOM measurement (`getBoundingClientRect`, `ResizeObserver`)
- Third-party library initialization

### Step 2: Index Keys in Dynamic Lists

Using array index as `key` in dynamic lists causes incorrect diffs. Search for `.map()` with index as key.

For each finding, determine:
- **Static list** (order never changes): index key is acceptable
- **Dynamic list** (filtered, sorted, reordered): must use a stable unique ID

Flag only genuinely dynamic cases.

### Step 3: Inline Object and Array Literals in Props

Passing object/array literals inline creates new references every render, breaking `React.memo`.

Acceptable exclusions:
- `className` strings (primitives)
- Inline event handlers on leaf elements
- Values from props/state (already referentially stable)

Fix: extract to module-level constant or `useMemo`.

### Step 4: Missing `useMemo` for Expensive Computations

Computations inside a Client Component's render body run every render. Assess each case by:
1. How large is the input array?
2. How expensive is the operation?
3. Does the parent re-render frequently?

Don't flag trivial operations on small arrays. Focus on operations on lists that will grow with real data.

### Step 5: Missing `useCallback` for Callbacks Passed to Children

Flag cases where:
- The callback is passed to a child wrapped in `React.memo`
- The callback is passed to a child rendered in a `.map()` (especially recursive components)
- The callback is used in a `useEffect` dependency array

Don't flag every inline function — only those that demonstrably cause re-renders or dependency issues.

### Step 6: State That Should Be Derived

Storing derived values in state creates two sources of truth that can desync.

Search for `useState` where the value is:
- A boolean flag derived from another state value
- A filtered/sorted version of another state array
- A string derived from combining other state values

Show how to remove the redundant state and compute inline or with `useMemo`.

### Step 7: Stale Closures in `useEffect` and Event Handlers

Search for:
1. `useEffect` with empty `[]` deps that accesses state or props inside
2. Event handlers in `useEffect` referencing state not in deps
3. `setInterval`/`setTimeout` callbacks referencing state that won't update

Fix: add missing dependency, use `useRef` for latest value, or use functional updater `setState(prev => ...)`.

### Step 8: `useEffect` Cleanup Omissions

Every `useEffect` that sets up subscriptions, listeners, timers, or async operations must return a cleanup function. Check specifically:
- Canvas/animation components with `requestAnimationFrame` loops
- Components with `window` event listeners
- Any `useEffect` wrapping async operations (needs cancellation flag)

### Step 9: Component Responsibility and Size

Flag components that:
- Manage more than 3-4 independent pieces of `useState`
- Mix UI rendering with complex business logic
- Are over 150 lines
- Could be cleanly split into logic + render layers

### Step 10: Prop Drilling

Props passed through 3+ levels without being used at intermediate levels. Suggest:
- **React Context** — when many components at different depths need the same value
- **Composition** — when the intermediate layer can be restructured

## Output Format

Write results to `docs/code-review/pass-3-react-patterns.md`:

```markdown
# Pass 3 — React Patterns

Code quality review focusing on canonical React best practices, re-render correctness, state management, and component design.

---

## 1. [Category]

**File:** `path/to/file.tsx` (line N)
**Issue:** [React] — Description
**Impact:** High | Medium | Low
**Fix:** How to refactor

---

## Summary

| Category | Issues | Impact |
| ... |

### Top Priority Fixes

1. ...
```

## Important Guidelines

- Only review `"use client"` files — Server Components are out of scope
- Be exhaustive within Client Components
- Distinguish genuine anti-patterns from acceptable pragmatic choices
- For re-render issues, explain concrete impact — don't flag theoretical issues on rarely-rendered components
- Use `file_path:line_number` references for every finding
- Prioritize by user-visible impact: stale closures producing wrong data > missing `useCallback` on a leaf component
