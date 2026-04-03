---
name: review-performance
description: "Comprehensive code review pass for performance — bundle size, image optimization, unnecessary re-renders, expensive client-side computations, network waterfall patterns, and animation performance. This is Pass 4 of a 5-pass code quality review. Use this skill when: user says 'review performance', 'performance audit', 'pass 4', 'bundle size', 'check images', 'optimize', 'slow page', 'lazy loading', or wants to find performance bottlenecks like heavy imports, missing dynamic imports, unoptimized images, or expensive render-time computations."
---

## What This Skill Does

Run a comprehensive performance audit of the Detachment Reaper codebase. This is **Pass 4** of a 5-pass code quality review. Find bundle size issues, image optimization gaps, expensive client-side computations, and unnecessary network waterfalls.

> **Before starting:** Use the `codebase-reference` skill to understand the tech stack, data fetching approach, and key component files. Pay attention to the dependencies listed in the tech stack.

## When to Use

Run after Pass 3 (React Patterns) to find performance bottlenecks.

## Review Procedure

### Step 1: Bundle Size — Heavy Client Components

Search every `"use client"` component for heavy library imports that should be lazy-loaded:

**Known heavy components to check:**
- Canvas-based animated backgrounds — should use dynamic import with `ssr: false`
- Framer Motion components — check if dynamic import reduces initial bundle
- `react-markdown` + `remark-gfm` — preview tabs shown on demand could be lazy-loaded

**General checks:**
- Any WebGL/canvas library imports
- Full library imports where only a subset is needed (`import * as something`)
- Barrel imports of icon libraries (verify tree-shaking works)

For each finding:
1. Is the component visible on initial page load above the fold?
2. Is there a suitable loading fallback?
3. Would dynamic import with `ssr: false` be appropriate?

### Step 2: Image Optimization

Check every image usage:

- Are `width` and `height` provided (or `fill` mode)?
- Is `priority` set on the hero/above-the-fold images?
- Is `sizes` prop set correctly for responsive images?
- Are there raw `<img>` tags that should use the framework's Image component?
- Check `public/` for images that could be converted to WebP/AVIF

### Step 3: Unnecessary Client-Side Re-renders

Search for patterns causing excessive re-renders:

1. **Recursive components** (like comment threads): Does parent state change cause unnecessary sibling re-renders?
2. **Poll/vote components**: State changes should only re-render the component, not the entire page
3. **Editor components**: Large string state updated on every keystroke — does this re-render the toolbar?
4. **Dynamic list components**: Adding/removing items causing full re-renders?

### Step 4: Client-Side Computation

Search for expensive operations inside **Client Component** render functions:

- Array filtering/sorting without `useMemo` in `"use client"` components
- `.filter()`, `.sort()`, `.map()` on large arrays that could be memoized
- String operations on editor content on every keystroke

**Note:** Module-scope computations in Server Components run once at build time and are NOT a performance concern. Only flag computations inside Client Component render bodies.

### Step 5: Network Waterfall (Future-Proofing)

Flag sequential data dependencies that will cause waterfall problems when the backend is implemented:

- Pages needing user data then user-specific data — suggest `Promise.all()`
- Post pages needing post + comments + poll results as separate queries — suggest parallel fetching
- Event pages needing event + RSVP list + organizer profile — suggest parallel fetching or ORM `include`

Document as "pre-emptive flags for backend implementation" rather than current bugs.

### Step 6: Animation Performance

Check animated components for:

1. **Canvas components**: Is `requestAnimationFrame` properly cancelled on unmount? Resize handling without memory leaks? DPR scaling for retina?
2. **Motion components**: Stale closure issues? Letter positioning math in render function that could be memoized?

### Step 7: Font Loading

Check font setup:

- Are all declared fonts actually used?
- Are font weights correctly subset?
- Are `preload`/`display: swap` set appropriately?
- FOUT (flash of unstyled text) risk?

## Output Format

Write results to `docs/code-review/pass-4-performance.md`:

```markdown
# Pass 4 — Performance

Code quality review focusing on bundle size, image optimization, client-side computation, and network patterns.

---

## 1. Bundle Size

**File:** `path/to/file.tsx` (line N)
**Issue:** [Bundle | Image | Render | Compute | Waterfall | Animation] — Description
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

- Be exhaustive — check every component using canvas, WebGL, or animation.
- Quantify impact where possible (estimated KB saved, renders eliminated).
- Distinguish between current bugs and future-proofing suggestions — label clearly.
- Use `file_path:line_number` references for every finding.
- The project deliberately avoids React Query — do not suggest adding it. Framework built-in caching with Server Components is the correct approach.
- Prioritize issues affecting the landing page (first load experience) most heavily.
