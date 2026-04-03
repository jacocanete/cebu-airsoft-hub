---
name: review-react-patterns
description: Comprehensive code review pass for React anti-patterns — re-renders, useEffect misuse, component boundaries, index keys, missing memoization, derived state, and component design
license: MIT
metadata:
  pass: "3"
  category: code-review
---

## What I Do

Run a comprehensive React patterns audit of the Detachment Reaper codebase. This is Pass 3 of a 5-pass code quality review. I find anti-patterns that cause unnecessary re-renders, incorrect state management, component boundary problems, and violations of canonical React best practices.

> **Before starting:** Load the `codebase-reference` skill to understand the project's component structure and which files are Client Components (`"use client"`). Only Client Components are in scope for this review — Server Components have no React lifecycle.

## When to Use Me

Use this skill after Pass 2 (DRY Violations) to find React-specific anti-patterns. Focus exclusively on `"use client"` files.

## Review Procedure

### Step 1: Illegal `useEffect` Data Fetching

`useEffect` should never be used to fetch data. It runs after paint, causes loading flickers, has no built-in cancellation, and creates race conditions. Data belongs in Server Components or triggered by user events via Server Actions.

Search every `"use client"` component for `useEffect` calls that fetch data:

```tsx
// ANTI-PATTERN
useEffect(() => {
  fetch("/api/posts").then(setData)
}, [])

useEffect(() => {
  const load = async () => { const data = await getData(); setData(data) }
  load()
}, [dep])
```

For each finding, the fix is:
1. Move the fetch to the Server Component parent and pass data as props, OR
2. If triggered by a user action, use a Server Action instead

**Legitimate `useEffect` uses** — do NOT flag these:
- Event listener setup/teardown (`addEventListener` / `removeEventListener`)
- Timer setup/teardown (`setInterval` / `clearInterval`)
- Canvas/WebGL initialization (see `letter-glitch.tsx`, `circular-text.tsx`)
- DOM measurement (`getBoundingClientRect`, `ResizeObserver`)
- Third-party library initialization

### Step 2: Index Keys in Dynamic Lists

Using array index as `key` in dynamic lists causes React to produce incorrect diffs — components get wrong props, state gets mismatched to the wrong item, and animations break.

Search for `.map()` rendering JSX with index as key:

```tsx
items.map((item, index) => <Component key={index} />)   // wrong
items.map((item, i) => <Component key={i} />)            // wrong
items.map((_, idx) => <Component key={idx} />)           // wrong
```

For each finding, determine:
- **Static list** (order never changes, items never added/removed): index key is acceptable
- **Dynamic list** (filtered, sorted, reordered, or items added/removed): must use a stable unique ID

Flag only genuinely dynamic cases. Most lists in this codebase are rendered from stable mock arrays — assess each one.

### Step 3: Inline Object and Array Literals in Props

Passing object or array literals inline in JSX creates a new reference on every render, breaking `React.memo` and causing unnecessary child re-renders:

```tsx
<Component style={{ color: "red" }} />      // new object every render
<Component options={["a", "b"]} />           // new array every render
<Component config={{ key: "value" }} />      // new object every render
```

Acceptable exclusions:
- `className` strings — primitives, fine
- Inline event handlers on leaf elements — usually acceptable
- Values that come from props/state (already referentially stable or will change anyway)

Fix: extract to a module-level constant (preferred for static values) or `useMemo` (for derived values).

### Step 4: Missing `useMemo` for Expensive Computations

Computations inside a Client Component's render body run on every render. Expensive derivations should be memoized:

```tsx
// Runs on every render — should be memoized if expensive
const filtered = largeArray.filter(complexPredicate)
const sorted = [...items].sort(comparator)
const grouped = items.reduce(groupingFn, {})
```

Assess each case by:
1. How large is the input array?
2. How expensive is the operation?
3. Does the parent re-render frequently?

Don't flag trivial operations on small arrays — premature memoization adds complexity with no benefit. Focus on operations on lists that will grow with real data.

### Step 5: Missing `useCallback` for Callbacks Passed to Children

Functions defined inside a component body are recreated on every render. When passed as props to memoized children or used in `useEffect` dependency arrays, this causes unnecessary re-renders or infinite loops:

```tsx
// Recreated on every parent render
const handleVote = () => doSomething(id)
return <VoteButtons onVote={handleVote} />
```

Flag cases where:
- The callback is passed to a child wrapped in `React.memo`
- The callback is passed to a child rendered in a `.map()` (especially `CommentThread`)
- The callback is used in a `useEffect` dependency array

Don't flag every inline function — only those that demonstrably cause child re-renders or dependency issues.

### Step 6: State That Should Be Derived

Storing derived values in state creates two sources of truth that can fall out of sync:

```tsx
// ANTI-PATTERN — isValid can desync from title
const [title, setTitle] = useState("")
const [isValid, setIsValid] = useState(false)

// CORRECT — derive it
const [title, setTitle] = useState("")
const isValid = title.trim().length > 0
```

Search for `useState` where the value is:
- A boolean flag derived from another state value (`isValid`, `hasItems`, `isEmpty`)
- A filtered/sorted version of another state array
- A string derived from combining other state values

For each, show how to remove the redundant state and compute it inline or with `useMemo`.

### Step 7: Stale Closures in `useEffect` and Event Handlers

A stale closure captures an old value of a state or prop, leading to bugs where callbacks operate on outdated data:

```tsx
// ANTI-PATTERN — handleClick captures the initial value of count
useEffect(() => {
  const handler = () => console.log(count) // always logs 0
  window.addEventListener("click", handler)
  return () => window.removeEventListener("click", handler)
}, []) // missing count in deps
```

Search for:
1. `useEffect` with empty `[]` dependency array that accesses state or props inside
2. Event handlers set up in `useEffect` that reference state not in the deps array
3. `setInterval` / `setTimeout` callbacks referencing state that won't update

Fix: add the missing dependency, use `useRef` to hold the latest value, or use the functional updater form `setState(prev => ...)`.

### Step 8: `useEffect` Cleanup Omissions

Every `useEffect` that sets up a subscription, listener, timer, or async operation must return a cleanup function:

```tsx
// MISSING CLEANUP — memory leak
useEffect(() => {
  const id = setInterval(tick, 1000)
  // forgot: return () => clearInterval(id)
}, [])
```

Check specifically:
- `letter-glitch.tsx` — `requestAnimationFrame` loop and resize listener
- `circular-text.tsx` — Framer Motion animation controls
- Any component that adds `window` event listeners
- Any `useEffect` wrapping async operations (needs cancellation flag)

### Step 9: Component Responsibility and Size

A React component should do one thing. Flag components in `src/components/` that:

- Manage more than 3-4 independent pieces of `useState`
- Mix UI rendering with complex business logic in the same function
- Are over 150 lines
- Could be cleanly split into a logic layer + render layer

Specific components to assess:
- `comment-thread.tsx` — `CommentItem` manages `collapsed`, `replyOpen`, and `vote` state
- `poll.tsx` — manages `voted` and `selected` state
- `post-editor.tsx` — manages `tab`, textarea ref, and markdown insertion logic
- `poll-builder.tsx` — manages dynamic option list mutations

For each, judge whether the combined responsibilities are cohesive (all serve one clear purpose) or should be extracted.

### Step 10: Prop Drilling

Props passed through 3+ levels of components without being used at intermediate levels signal a design problem:

```
Page → Section → List → Item  (passing onVote through Section and List, neither use it)
```

Search for prop names that appear in 3+ component signatures in a chain where intermediates don't consume them.

For each finding, suggest:
- **React Context** — when many components at different depths need the same value
- **Composition** — when the intermediate layer can be restructured to eliminate the pass-through

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
