---
name: codebase-reference
description: "Living reference document for the Detachment Reaper codebase — tech stack, directory structure, conventions, design system, and data fetching patterns. Use this skill whenever you need project context before writing code, reviewing code, or answering questions about the codebase. Trigger when: user says 'codebase reference', 'project overview', 'tech stack', 'what does this project use', 'show me the stack', or when any review skill needs project context. Also use when making architectural decisions, choosing libraries, or understanding conventions."
---

## What This Skill Does

Provides the canonical reference for the Detachment Reaper project. Rather than relying on static content, read the current state of key files to provide accurate, up-to-date information.

## How to Use

When this skill is triggered, read the following key files to build an accurate picture of the current project state:

1. `src/styles/globals.css` or `src/app/globals.css` — Tailwind v4 config, CSS variables, utility classes
2. `src/types/index.ts` — shared TypeScript types
3. `src/lib/constants.ts` — shared constants (category colors, etc.)
4. `src/lib/prose.ts` — shared prose classes
5. `package.json` — dependencies and scripts
6. `tsconfig.json` — TypeScript configuration
7. `PLANNING.md` — feature roadmap and Prisma schema

Then present the reference information organized as below, updating any details that have changed from the baseline.

---

## Project Overview

**Name:** Detachment Reaper
**Purpose:** Community platform for airsoft players in Cebu, Philippines. Three pillars: Discussion (forum), Marketplace (buy/sell gear), and Matchmaking (game events).
**Status:** Frontend-only with mock data. Backend (Prisma + PostgreSQL + NextAuth) planned for a future phase.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components by default |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` in globals.css |
| UI Components | shadcn/ui via `@base-ui/react` | **Not Radix UI** — see critical note below |
| Animations | `motion` (Framer Motion v11+) | `import { motion } from "motion/react"` |
| Markdown | `react-markdown` + `remark-gfm` | Used in forum post body and editor preview |
| WebGL | `ogl` | Used for Radar background component |
| Typography | `@tailwindcss/typography` | Registered via `@plugin "@tailwindcss/typography"` in globals.css |
| Fonts | Geist Sans, Geist Mono, Barlow Condensed (900) | Via `next/font/google` |
| **Auth** | NextAuth v5 (Auth.js) | **Planned** — not yet implemented |
| **Database** | PostgreSQL | **Planned** — self-hosted VPS |
| **ORM** | Prisma | **Planned** — NOT Supabase |
| **Storage** | Cloudflare R2 | **Planned** — for image uploads |
| **Maps** | Google Maps JS API | **Planned** — for event location picker |

### Critical: `@base-ui/react` vs Radix UI

This project uses `@base-ui/react` (the new Base UI library), NOT Radix UI. Key differences:

- **No `asChild` prop** — use `render` prop instead: `<Button render={<Link href="/" />}>`
- **No `asChild` on triggers** — `<SheetTrigger render={<Button />}>`
- Components are more primitive and composable
- When reviewing shadcn component usage, verify patterns against `@base-ui/react` API, not Radix

---

## Directory Structure

```
src/
├── app/                           # or routes/ if using TanStack Router
├── components/
│   ├── ui/                        # shadcn/ui primitives + custom animated components
│   ├── layout/                    # Navbar, Footer, etc.
│   ├── feed/                      # Forum-related components
│   ├── marketplace/               # Marketplace components
│   ├── events/                    # Event components
│   ├── groups/                    # Group components
│   ├── landing/                   # Landing page components
│   └── shared/                    # Cross-feature shared components
├── lib/
│   ├── constants.ts               # Shared constants (colors, categories)
│   ├── prose.ts                   # PROSE_CLASSES for markdown rendering
│   └── mock-data.ts               # Mock data for development
├── styles/
│   └── globals.css                # Tailwind v4 config, CSS variables
└── types/
    └── index.ts                   # Shared TypeScript types
```

---

## Data Fetching Approach

**This project deliberately avoids React Query and Zustand.**

| Pattern | Approach |
|---|---|
| Server-side data fetching | Server Components (`async` functions in page files) |
| Mutations / form submissions | Server Actions |
| Client-side local state | `useState` / `useReducer` only |
| Global client state | None — pass via props or URL params |
| Caching | Framework built-in caching |
| **No React Query** | Do not introduce `useQuery`, `useMutation`, `QueryClient` |
| **No Zustand** | Do not introduce `create()` stores |

---

## Design System

### Brand Colors

| Token | Value | Usage |
|---|---|---|
| Primary | `#e90003` | CTAs, active states, badges, accents |
| Background | `#0a0a0a` | Page background (dark default) |
| Card | `#141414` | Card/panel backgrounds |
| Foreground | `#ebebeb` | Primary text |
| Muted foreground | `#a9a9a9` | Secondary/metadata text |
| Border | `white / 10%` | Subtle dividers and card borders |

Use `bg-primary`, `text-primary`, `border-primary` etc. — never hardcode hex values.

### Key Custom CSS Classes

```css
.label-military { @apply text-xs font-semibold uppercase tracking-widest text-muted-foreground; }
.glow-red { box-shadow: 0 0 20px oklch(0.45 0.27 25 / 30%); }
.border-t-accent { border-top: 2px solid oklch(0.45 0.27 25); }
```

### Design Principles

- **Dark-first** — site defaults to dark mode
- **Sharp corners** — `--radius: 0.375rem`
- **Uppercase headers** — `font-black uppercase tracking-tight`
- **Red left border** — section headers use `border-l-2 border-primary pl-3`
- **Tactical vocabulary** — "Operators" not "Users", "Deploy" not "Publish"
- **No soft shadows** — cards use `border` + `bg-card`, hover uses `bg-accent`

### Category Badge Colors

```tsx
const categoryColors = {
  General:          "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Gear Reviews":   "border border-violet-500/40 bg-violet-500/10 text-violet-400",
  "Tips & Tactics": "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Buy/Sell":       "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  Memes:            "border border-pink-500/40 bg-pink-500/10 text-pink-400",
  News:             "border border-primary/40 bg-primary/10 text-primary",
}
```

### Shared Prose Classes

Import `PROSE_CLASSES` from `src/lib/prose.ts` for any markdown-rendered content. Never duplicate the class string inline.

### Typography

| Font | Variable | Usage |
|---|---|---|
| Geist Sans | `--font-sans` | Body text, UI labels |
| Geist Mono | `--font-geist-mono` | Code blocks, monospace |
| Barlow Condensed 900 | `--font-barlow-condensed` | Circular text component only |

---

## Coding Conventions

- **Pages**: lowercase `page.tsx` (framework convention)
- **Components**: PascalCase (`Navbar.tsx`, `CommentThread.tsx`)
- **Utilities**: camelCase (`prose.ts`)
- **Types**: PascalCase interfaces (`User`, `GameEvent`, `MarketplaceListing`)
- **Client Components**: push `"use client"` as far down the tree as possible
- **File size**: under 200 lines healthy, 200-500 review for splitting, over 500 must split
- **One component per file**: internal helpers OK, multiple exports not OK
- **Mock data**: currently inline in page files, will move to server fetching when backend is built
