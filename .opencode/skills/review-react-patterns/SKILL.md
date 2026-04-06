---
name: review-react-patterns
description: Comprehensive code review pass for React anti-patterns — re-renders, useEffect misuse, component boundaries, index keys, missing memoization, derived state, and component design
license: MIT
metadata:
  pass: "3"
  category: code-review
---

## What I Do

Run a comprehensive React patterns audit of the Cebu Airsoft Hub codebase. This is Pass 3 of a 6-pass code quality review. I find anti-patterns that cause unnecessary re-renders, incorrect state management, component boundary problems, and violations of canonical React best practices.

> **Before starting:** Load the `codebase-reference` skill to understand the project's component structure, data fetching patterns, and TanStack Router conventions. This project uses TanStack Router and React Query — there are no Server Components, no `"use client"` directives, and no Next.js patterns. All components are client-rendered.

## When to Use Me

Use this skill after Pass 2 (DRY Violations) to find React-specific anti-patterns.

## Review Procedure

### Step 1: Illegal `useEffect` Data Fetching

`useEffect` must never be used to fetch data. It runs after paint, causes loading flickers, has no built-in cancellation, and creates race conditions. All data fetching belongs in React Query hooks in `src/hooks/`.

Search every component for `useEffect` calls that fetch data:

```tsx
// ANTI-PATTERN
useEffect(() => {
  fetch("/api/posts").then(setData)
}, [])

useEffect(() => {
  const load = async () => { const data = await api.get("/api/posts"); setData(data) }
  load()
}, [dep])
```

For each finding, the fix is: move the fetch to a hook in `src/hooks/` using `useQuery`, then call that hook in the component.

**Legitimate `useEffect` uses** — do NOT flag these:

- Socket.io room join/leave with `socket.emit("post:join", id)` — this is side-effect setup, not data fetching. The real-time hook pattern in `use-comments.ts` and `use-events.ts` is correct and intentional.
- Event listener setup/teardown (`addEventListener` / `removeEventListener`)
- Timer setup/teardown (`setInterval` / `clearInterval`)
- Canvas/WebGL initialization (e.g., `letter-glitch.tsx`, `circular-text.tsx`)
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
- **Dynamic list** (filtered, sorted, reordered, or items added/removed): must use a stable unique ID (e.g., `item.id`)

Flag only genuinely dynamic cases. Many lists in this codebase are rendered from API data — assess each one.

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

Computations inside a component's render body run on every render. Expensive derivations should be memoized:

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

Don't flag trivial operations on small arrays — premature memoization adds complexity with no benefit. Focus on operations on lists that will grow with real data (posts, comments, listings).

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
1. `useEffect` with empty `[]` dependency array that accesses state or props inside the callback
2. Event handlers set up in `useEffect` that reference state not in the deps array
3. `setInterval` / `setTimeout` callbacks referencing state that won't update

Fix: add the missing dependency, use `useRef` to hold the latest value, or use the functional updater form `setState(prev => ...)`.

### Step 8: `useEffect` Cleanup Omissions

Every `useEffect` that sets up a subscription, listener, timer, or Socket.io connection must return a cleanup function:

```tsx
// MISSING CLEANUP — memory leak / duplicate listeners
useEffect(() => {
  socket.on("comment:new", handler)
  // forgot: return () => socket.off("comment:new", handler)
}, [])
```

Check specifically:
- Canvas animation components — `requestAnimationFrame` loop and resize listener must be cancelled on unmount
- Any component that adds `window` or `document` event listeners
- Socket.io hooks — `socket.off()` and `socket.emit("room:leave")` must be in the cleanup
- Any `useEffect` wrapping async operations (needs an `isMounted` or `AbortController` cancellation flag)

### Step 9: Component Responsibility and Size

A React component should do one thing. Flag components that:

- Manage more than 3–4 independent pieces of `useState`
- Mix UI rendering with complex business logic in the same function
- Are over 150 lines
- Could be cleanly split into a container (logic) + presentational (render) pattern

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

### Step 11: React Query Anti-Patterns

Search for misuse of React Query across components and hook files:

- **Manual `refetch()` in `useEffect`**: Calling `query.refetch()` inside a `useEffect` to keep data fresh defeats React Query's caching — use `staleTime` and `refetchInterval` instead
- **Missing `enabled` flag**: A hook that accepts an optional param (e.g., `usePostDetail(id?)`) and does not set `enabled: !!id` will fire a query with `undefined` as the ID, causing a 404
- **Fetching inside components**: Any `api.get()` or `fetch()` call directly in a component body — must be moved to a hook
- **Inconsistent `queryKey` structures**: Mix of flat keys (`["posts"]`) and nested keys (`["posts", "list"]`) for the same resource breaks `invalidateQueries` targeting
- **Overly broad invalidation**: `invalidateQueries({ queryKey: [] })` invalidates everything — this is almost always wrong

### Step 12: TanStack Router Anti-Patterns

Search for patterns that bypass or misuse TanStack Router:

- **Raw `<a href>` tags for internal navigation**: All internal links must use `<Link>` from `@tanstack/react-router` to enable client-side navigation and preloading
- **`window.location` for programmatic navigation**: Should use `useNavigate()` from `@tanstack/react-router`
- **Untyped param access**: `useParams()` called without the route's type context — use `Route.useParams()` for full type safety
- **URL state in `useState`**: Filter state, search queries, or pagination stored in `useState` that should be in URL search params (via `Route.useSearch()`) to support shareable URLs and back-button behavior

## Output Format

Write results to `docs/code-review/pass-3-react-patterns.md`:

```markdown
# Pass 3 — React Patterns

Code quality review focusing on canonical React best practices, re-render correctness, state management, React Query usage, and TanStack Router patterns.

---

## 1. [Category]

**File:** `path/to/file.tsx` (line N)
**Issue:** [React | Query | Router] — Description
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

- Be exhaustive across all component files
- Distinguish genuine anti-patterns from acceptable pragmatic choices
- For re-render issues, explain concrete impact — don't flag theoretical issues on rarely-rendered components
- Use `file_path:line_number` references for every finding
- Prioritize by user-visible impact: stale closures producing wrong data > missing `useCallback` on a leaf component
- Do NOT flag Socket.io `useEffect` patterns in hook files as data fetching violations — they are legitimate side-effect management
