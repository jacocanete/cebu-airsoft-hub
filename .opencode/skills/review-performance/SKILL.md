---
name: review-performance
description: Comprehensive code review pass for performance — bundle size, image optimization, unnecessary re-renders, expensive client-side computations, and network waterfall patterns
license: MIT
metadata:
  pass: "4"
  category: code-review
---

## What I Do

Run a comprehensive performance audit of the Detachment Reaper codebase. This is Pass 4 of a 6-pass code quality review. I find bundle size issues, image optimization gaps, expensive client-side computations, and unnecessary network waterfalls.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, data fetching approach, and key component patterns. This project uses Vite, React Query, and TanStack Router — there is no Next.js, no `next/dynamic`, no `next/image`, and no Server Components.

## When to Use Me

Use this skill after Pass 3 (React Patterns) to find performance bottlenecks.

## Review Procedure

### Step 1: Bundle Size — Heavy Lazy-Loading Candidates

Search all component files for heavy library imports that should be code-split with `React.lazy()` + `Suspense` or Vite dynamic imports (`import()`):

**Known heavy components in this project:**
- Canvas/animation components (e.g., `letter-glitch.tsx`) — uses browser canvas APIs and runs a `requestAnimationFrame` loop. Only used in the landing page hero. Should be lazy-loaded with a fallback.
- Animated text components (e.g., `circular-text.tsx`) — uses `motion` (Framer Motion). Check if it contributes meaningfully to initial bundle.
- `react-markdown` + `remark-gfm` — imported in the post editor. The preview tab is only shown on demand — consider lazy-loading the `ReactMarkdown` render or the entire preview panel.

**General heavy library checks:**
- Any `import * as something` barrel imports that prevent tree-shaking
- Icon imports — lucide-react is tree-shakeable by default; verify no barrel imports like `import * as Icons from "lucide-react"`
- Any library imported but only used in a single rarely-visited route

For each finding:
1. Is the component visible on initial page load above the fold?
2. Is there a suitable loading fallback (skeleton, placeholder)?
3. Would `React.lazy(() => import("./component"))` wrapped in `<Suspense>` be appropriate?

```tsx
// Pattern to suggest
const LetterGlitch = React.lazy(() => import("@/components/ui/letter-glitch"))

<Suspense fallback={<div className="h-full bg-background" />}>
  <LetterGlitch />
</Suspense>
```

### Step 2: Image Optimization

This project uses raw `<img>` tags, not `next/image`. Check every `<img>` element in the codebase:

- Is `loading="lazy"` set on below-the-fold images?
- Is `loading="eager"` (or no `loading` attribute) set only on above-the-fold hero images?
- Are `width` and `height` attributes present to prevent layout shifts (CLS)?
- Is `decoding="async"` set for non-critical images?
- Are there any images in the `public/` directory that could be converted to WebP or AVIF for smaller file sizes?

```html
<!-- Pattern for below-the-fold images -->
<img
  src="/path/to/image.jpg"
  alt="Description"
  width="400"
  height="300"
  loading="lazy"
  decoding="async"
/>

<!-- Pattern for hero/above-the-fold images -->
<img
  src="/path/to/hero.png"
  alt="Detachment Reaper"
  width="800"
  height="600"
  loading="eager"
/>
```

### Step 3: Unnecessary Client-Side Re-renders

Search for patterns that cause excessive re-renders in the interactive components:

1. **CommentThread**: This is a recursive component. Each `CommentItem` has its own local state for collapse and reply state. Check if parent state changes cause unnecessary re-renders of sibling comments. Suggest `React.memo` on `CommentItem` if the re-render cost is significant.

2. **Poll component**: State changes on vote should only re-render the poll, not the entire post page. Verify the component boundary is correct — the poll should be isolated so its state changes don't bubble up.

3. **PostEditor**: The `value` state is a large string updated on every keystroke. Check if this causes the toolbar or tab switcher to re-render unnecessarily on each keypress.

4. **PollBuilder**: Dynamic option list updates. Check if adding/removing options causes full re-renders of all existing option inputs.

### Step 4: Client-Side Computation

Search for expensive operations inside component render functions (not in hooks):

- Array filtering/sorting without `useMemo` inside components — especially in marketplace and events pages where lists may be large
- Any `.filter()`, `.sort()`, `.map()` on lists received from React Query that could be memoized with `useMemo`
- String operations on markdown editor content on every keystroke
- Derived values computed inline on every render that depend only on props (stable between renders)

### Step 5: Network Waterfall and React Query Optimization

Sequential data dependencies cause waterfall problems — the second request can't start until the first completes. Search for:

- **Sequential hook calls where data could be parallel**: Route components that call multiple `useQuery` hooks where the second doesn't depend on the first's result — these are already parallel in React Query (good), but verify no artificial sequencing via `enabled` flags
- **Missing `useQueries` for genuinely parallel fetches**: If a component needs N items by ID, looping over IDs and calling a hook N times is less efficient than `useQueries()`
- **Missing route-level prefetching**: TanStack Router supports `loader` and `beforeLoad` to prefetch data before the component renders. Routes with predictable data needs (e.g., post detail) could prefetch via `loader` to eliminate the loading state
- **`defaultPreload: "intent"` is configured in `src/router.tsx`**: Verify that `<Link>` components to data-heavy pages are in place to benefit from this — prefetching only works when using `<Link>` from TanStack Router, not raw `<a>` tags

### Step 6: Animation Performance

Check the animated components for performance issues:

1. **Canvas animation components** (`letter-glitch.tsx` or similar):
   - Uses `requestAnimationFrame` — is it properly cancelled on unmount?
   - Does it resize correctly without memory leaks?
   - Is canvas DPR scaling handled correctly for retina displays?
   - Is the canvas `aria-hidden="true"` to prevent unnecessary AT processing?

2. **Circular text or spin animation components**:
   - Uses Framer Motion — verify no stale closure issues in animation callbacks
   - Are letter positioning computations memoized or computed once, not on every render?

3. **General `motion` usage**:
   - Are `motion` variants defined at module level (stable reference) or inline in JSX (new object every render)?
   - Are `transition` objects inline (new object every render) or extracted?

### Step 7: Font Loading

This project uses `@fontsource-variable` and `@fontsource/*` packages, NOT `next/font`. Check the font setup in `src/styles/globals.css`:

- Are all fonts actually imported that are referenced in CSS variables (`--font-sans`, `--font-geist-mono`, `--font-barlow-condensed`)?
- Is `font-display: swap` set to prevent invisible text during load (FOIT)?
- Is Barlow Condensed loaded with only the weight (900) that's actually used, or is the full weight range loaded?
- Are font files being served from the local bundle (good — `@fontsource` packages) or fetched from an external CDN (bad — network dependency)?

### Step 8: Socket.io Connection Lifecycle

Socket.io connections are persistent and carry overhead. Check:

- **Unnecessary connections**: Is `socket.connect()` called in hooks that are used on pages that don't need real-time updates? Only `use-comments.ts` and `use-events.ts` need Socket.io — other hooks should not connect.
- **Connection not closed**: Every `socket.connect()` in a hook must have a corresponding `socket.disconnect()` in the `useEffect` cleanup — or at minimum `socket.off()` for all registered listeners to prevent duplicate handlers on remount
- **Reconnection on every render**: If `socket.connect()` is called outside a `useEffect` (i.e., at hook call time), it will attempt to reconnect on every render
- **Event listener accumulation**: If `socket.on("comment:new", handler)` is called without a cleanup that calls `socket.off("comment:new", handler)`, listeners accumulate on each re-render, causing handlers to fire multiple times for a single event

### Step 9: React Query Cache Configuration

Cache settings affect how often the network is hit. Check:

- **`staleTime` too low**: A `staleTime` of 0 (default) means every component mount triggers a refetch. For data that doesn't change frequently (groups list, user profiles), a higher `staleTime` (30s–5min) reduces unnecessary requests.
- **`staleTime` too high**: Data like comments or RSVP counts that change in real-time via Socket.io should have a low `staleTime` (or even 0) since Socket.io keeps them fresh — but other data should not be over-cached.
- **`gcTime` not set for large data**: Query results are held in memory until `gcTime` expires. Large lists (all events, all marketplace listings) that are only needed on specific routes should have a reasonable `gcTime` to allow garbage collection.
- **Global QueryClient config**: Check `src/routes/__root.tsx` where the `QueryClient` is created — are the default `staleTime` and `retry` settings appropriate as a baseline? Hooks that need different behavior should override locally.

## Output Format

Write the results to `docs/code-review/pass-4-performance.md` using this format:

```markdown
# Pass 4 — Performance

Code quality review focusing on bundle size, image optimization, client-side computation, network patterns, Socket.io lifecycle, and React Query cache tuning.

---

## 1. Bundle Size

**File:** `path/to/file.tsx` (line N)
**Issue:** [Bundle | Image | Render | Compute | Waterfall | Animation | Socket | Cache] — Description
**Impact:** High | Medium | Low
**Fix:** How to fix

---

## Summary

| Category | High | Medium | Low | Total |
| ... |

### Top Priority Fixes

1. ...
```

## Important Guidelines

- Be exhaustive — check every component that uses canvas, WebGL, animation, or Socket.io.
- Quantify impact where possible (estimated KB saved, renders eliminated, requests reduced).
- Distinguish between current bugs and future-proofing suggestions — label them clearly.
- Use `file_path:line_number` references for every finding.
- Prioritize issues that affect the landing page (first load experience) and the most-used routes (feed, post detail).
- Do NOT suggest `next/dynamic`, `next/image`, or any Next.js-specific optimization — this project uses Vite and TanStack.
