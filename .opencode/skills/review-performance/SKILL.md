---
name: review-performance
description: Comprehensive code review pass for performance — bundle size, image optimization, unnecessary re-renders, expensive client-side computations, and network waterfall patterns
license: MIT
metadata:
  pass: "4"
  category: code-review
---

## What I Do

Run a comprehensive performance audit of the Detachment Reaper codebase. This is Pass 4 of a 5-pass code quality review. I find bundle size issues, image optimization gaps, expensive client-side computations, and unnecessary network waterfalls.

> **Before starting:** Load the `codebase-reference` skill to understand the project's tech stack, data fetching approach, and key component files. Pay particular attention to the dependencies listed in the tech stack table.

## When to Use Me

Use this skill after Pass 3 (React/Next.js Patterns) to find performance bottlenecks.

## Review Procedure

### Step 1: Bundle Size — Heavy Client Components

Search every `"use client"` component for heavy library imports that should be lazy-loaded with `next/dynamic`:

**Known heavy components in this project:**
- `src/components/ui/letter-glitch.tsx` — canvas-based animated background used in the landing page hero. Uses browser canvas APIs — should be `next/dynamic({ ssr: false })`.
- `src/components/ui/circular-text.tsx` — uses `motion` (Framer Motion). Client-only, check if `next/dynamic` would reduce the initial bundle.
- `react-markdown` + `remark-gfm` — imported in `post-editor.tsx`. The preview tab is only shown on demand — consider lazy-loading the ReactMarkdown render.

**General heavy library checks:**
- Any import of `three` or WebGL libraries outside of the already-identified components
- Full library imports where only a subset is needed (e.g., `import * as something`)
- Icon imports — lucide-react is tree-shakeable by default, verify no barrel imports

For each finding:
1. Is the component visible on initial page load above the fold?
2. Is there a suitable loading fallback (skeleton, placeholder)?
3. Would `next/dynamic({ ssr: false })` be appropriate?

### Step 2: Image Optimization

Check every use of `<Image>` from `next/image`:

- Are `width` and `height` provided (or `fill` mode used)?
- Is `priority` set on the hero logo image (`public/hero-logo.png` in the landing page)? This is the largest above-the-fold image.
- Is `sizes` prop set correctly for responsive images?
- Are there any raw `<img>` tags that should be `<Image>`?
- The hero logo is a PNG with a white background — verify the `drop-shadow` filter is rendering correctly and not causing layout shifts

Check the `public/` directory for any images that could be converted to WebP/AVIF for smaller file sizes.

### Step 3: Unnecessary Client-Side Re-renders

Search for patterns that cause excessive re-renders in the interactive components:

1. **CommentThread** (`src/components/feed/comment-thread.tsx`): This is a recursive component. Each `CommentItem` has its own `useState` for `collapsed`, `replyOpen`, and `vote`. Check if parent state changes cause unnecessary re-renders of sibling comments.

2. **Poll** (`src/components/feed/poll.tsx`): State changes on vote should only re-render the poll, not the entire post page. Verify the component boundary is correct.

3. **PostEditor** (`src/components/feed/post-editor.tsx`): The `value` state is a large string updated on every keystroke. Check if this causes the toolbar to re-render unnecessarily on each keypress.

4. **PollBuilder** (`src/components/feed/poll-builder.tsx`): Dynamic option list updates. Check if adding/removing options causes full re-renders.

### Step 4: Client-Side Computation

Search for expensive operations inside **Client Component** render functions:

- Array filtering/sorting without `useMemo` inside `"use client"` components — especially in the marketplace and events pages where lists may be filtered
- Any `.filter()`, `.sort()`, `.map()` on large arrays that could be memoized, inside Client Components
- String operations on the markdown editor content on every keystroke

**Note:** Module-scope computations in Server Components (like `pinnedPosts`/`regularPosts` derived arrays at the top of `feed/page.tsx`) run once at build time for static pages and are **not** a performance concern. Only flag computations inside Client Component render bodies or `"use client"` files.

### Step 5: Network Waterfall (Future-Proofing)

Although the project currently uses mock data, flag sequential data dependencies that will cause waterfall problems when the backend is implemented:

- Pages that will need to fetch user data, then fetch user-specific data based on the result — suggest `Promise.all()` patterns
- The post page will need: post data + comments + poll results potentially as separate queries — suggest fetching in parallel
- The event detail page will need: event data + RSVP list + organizer profile — suggest parallel fetching or Prisma `include`

Document these as "pre-emptive flags for backend implementation" rather than current bugs.

### Step 6: Animation Performance

Check the animated components for performance issues:

1. **LetterGlitch** (`src/components/ui/letter-glitch.tsx`):
   - Uses `requestAnimationFrame` — is it properly cancelled on unmount?
   - Does it resize correctly without memory leaks?
   - Is the canvas DPR scaling handled correctly for retina displays?

2. **CircularText** (`src/components/ui/circular-text.tsx`):
   - Uses Framer Motion's `useAnimation` and `useMotionValue` — verify no stale closure issues
   - The letter positioning math runs in the render function — could the letter positions be memoized?

### Step 7: Font Loading

Check the font setup in `src/app/layout.tsx`:

- Are all three fonts (`Geist`, `Geist_Mono`, `Barlow_Condensed`) actually used? `Barlow_Condensed` is only used in `circular-text.tsx` — is the font weight (900) correctly subset?
- Are `preload: true` or `display: swap` set appropriately?
- Is there a flash of unstyled text (FOUT) risk?

## Output Format

Write the results to `docs/code-review/pass-4-performance.md` using this format:

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

- Be exhaustive — check every component that uses canvas, WebGL, or animation.
- Quantify impact where possible (estimated KB saved, renders eliminated).
- Distinguish between current bugs and future-proofing suggestions — label them clearly.
- Use `file_path:line_number` references for every finding.
- The project deliberately avoids React Query — do not suggest adding it for performance. Next.js built-in caching with Server Components is the correct approach.
- Prioritize issues that affect the landing page (first load experience) most heavily.
