---
name: codebase-reference
description: Living reference document for the Detachment Reaper codebase — tech stack, directory structure, conventions, design system, and data fetching patterns. All review skills refer to this document for project-specific context.
license: MIT
metadata:
  category: reference
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
| UI Components | shadcn/ui via `@base-ui/react` | **Not Radix UI** — see component notes below |
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
├── app/
│   ├── (auth)/                    # Auth pages — no navbar/footer
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                    # Main site — uses Navbar + Footer layout
│   │   ├── layout.tsx             # Navbar + Footer wrapper
│   │   ├── page.tsx               # Landing page (/)
│   │   ├── feed/
│   │   │   ├── page.tsx           # Forum feed
│   │   │   ├── new/page.tsx       # Create post form
│   │   │   ├── search/page.tsx    # Search results
│   │   │   └── [id]/page.tsx      # Single post + comments
│   │   ├── marketplace/
│   │   │   ├── page.tsx           # Browse listings
│   │   │   ├── new/page.tsx       # Create listing (stub)
│   │   │   └── [id]/page.tsx      # Single listing (stub)
│   │   ├── events/
│   │   │   ├── page.tsx           # Events list
│   │   │   ├── new/page.tsx       # Create event (stub)
│   │   │   └── [id]/page.tsx      # Event detail + RSVP
│   │   ├── groups/
│   │   │   ├── page.tsx           # Groups list
│   │   │   ├── new/page.tsx       # Create group (stub)
│   │   │   └── [slug]/page.tsx    # Group profile (stub)
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   └── settings/page.tsx      # User settings (stub)
│   ├── layout.tsx                 # Root layout — sets `class="dark"` on html
│   └── globals.css                # Tailwind v4 imports, CSS variables, utility classes
├── components/
│   ├── ui/                        # shadcn/ui primitives + custom animated components
│   │   ├── circular-text.tsx      # Spinning circular text (hero)
│   │   ├── letter-glitch.tsx      # Glitch background (hero)
│   │   ├── radar.tsx              # Radar WebGL background (available, not in use)
│   │   └── [shadcn components]    # avatar, badge, card, dropdown-menu, etc.
│   ├── layout/
│   │   └── Navbar.tsx             # Sticky navbar with mobile sheet drawer
│   ├── feed/
│   │   ├── comment-thread.tsx     # Recursive nested comment tree
│   │   ├── poll.tsx               # Interactive poll with vote bars
│   │   ├── poll-builder.tsx       # Poll creation form for new post page
│   │   └── post-editor.tsx        # Markdown editor with toolbar + preview tab
│   ├── marketplace/               # (empty — stubs pending)
│   ├── events/                    # (empty — stubs pending)
│   ├── profile/                   # (empty — stubs pending)
│   └── groups/                    # (empty — stubs pending)
├── lib/
│   └── prose.ts                   # PROSE_CLASSES — shared Tailwind typography string
└── types/
    └── index.ts                   # Shared TypeScript types (User, Post, GameEvent, etc.)
```

---

## Route Map

| URL | Page | Status |
|---|---|---|
| `/` | Landing page | Built |
| `/feed` | Forum feed | Built |
| `/feed/[id]` | Single post + comments | Built |
| `/feed/new` | Create post form | Built |
| `/feed/search` | Search results | Built |
| `/marketplace` | Browse listings | Built |
| `/marketplace/[id]` | Single listing | Stub |
| `/marketplace/new` | Create listing | Stub |
| `/events` | Events list | Built |
| `/events/[id]` | Event detail + RSVP | Built |
| `/events/new` | Create event | Stub |
| `/groups` | Groups list | Built |
| `/groups/[slug]` | Group profile | Stub |
| `/groups/new` | Create group | Stub |
| `/profile/[username]` | User profile | Built |
| `/settings` | User settings | Stub |
| `/login` | Login page | Built (UI only) |
| `/register` | Register page | Built (UI only) |

---

## Data Fetching Approach

**This project deliberately avoids React Query and Zustand to keep things simple.**

| Pattern | Our approach |
|---|---|
| Server-side data fetching | Next.js Server Components (`async` functions in page files) |
| Mutations / form submissions | Next.js Server Actions |
| Client-side local state | `useState` / `useReducer` only |
| Global client state | None — pass via props or URL params |
| Caching | Next.js built-in `fetch` cache + `revalidate` |
| No React Query | Do not introduce `useQuery`, `useMutation`, `QueryClient` |
| No Zustand | Do not introduce `create()` stores |

When the backend is built, the pattern will be:
1. Server Component fetches data via Prisma in the page file
2. Passes data as props to Client Components for interactivity
3. Server Actions handle writes (form submissions, RSVP, votes, etc.)

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

In Tailwind: use `bg-primary`, `text-primary`, `border-primary` etc. — never hardcode hex values.

### Key Custom CSS Classes (in `globals.css`)

```css
/* Military-style label: uppercase, tracked, small, semibold */
.label-military {
  @apply text-xs font-semibold uppercase tracking-widest text-muted-foreground;
}

/* Red glow for primary CTA buttons */
.glow-red {
  box-shadow: 0 0 20px oklch(0.45 0.27 25 / 30%);
}

/* Red top border accent for sections */
.border-t-accent {
  border-top: 2px solid oklch(0.45 0.27 25);
}
```

### Design Principles

- **Dark-first** — site defaults to dark mode (`class="dark"` on `<html>`)
- **Sharp corners** — `--radius: 0.375rem` (smaller than default, more mil-spec)
- **Uppercase headers** — page/section titles use `font-black uppercase tracking-tight`
- **Red left border** — page section headers use a `border-l-2 border-primary pl-3` accent
- **Tactical vocabulary** — "Operators" not "Users", "Deploy" not "Publish", "Mission Brief" not "Description"
- **No soft shadows** — cards use `border` + `bg-card`, hover uses `bg-accent`, no `shadow-*`

### Category Badge Colors (dark-optimised)

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

### Condition / Status Badge Colors (marketplace)

```tsx
const conditionColors = {
  "New":       "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Like New":  "border border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Used":      "border border-amber-500/40 bg-amber-500/10 text-amber-400",
  "For Parts": "border border-primary/40 bg-primary/10 text-primary",
}
```

### Shared Prose Classes

Markdown-rendered content (forum post body, editor preview) uses `PROSE_CLASSES` from `src/lib/prose.ts`. Import and apply this constant to any element rendering markdown. Never duplicate the class string inline.

```tsx
import { PROSE_CLASSES } from "@/lib/prose"
<div className={PROSE_CLASSES}><ReactMarkdown>{content}</ReactMarkdown></div>
```

### Typography

| Font | Variable | Usage |
|---|---|---|
| Geist Sans | `--font-sans` | Body text, UI labels, everything |
| Geist Mono | `--font-geist-mono` | Code blocks, monospace |
| Barlow Condensed 900 | `--font-barlow-condensed` | Circular text component only |

---

## Coding Conventions

### Naming
- Pages: lowercase `page.tsx` (Next.js convention)
- Components: PascalCase (`Navbar.tsx`, `CommentThread.tsx`)
- Utilities / lib files: camelCase (`prose.ts`)
- Types: PascalCase interfaces (`User`, `GameEvent`, `MarketplaceListing`)

### Client vs Server Components
- Pages are Server Components by default — only add `"use client"` when the component needs hooks, event handlers, or browser APIs
- Push `"use client"` as far down the tree as possible — interactive islands, not entire pages
- `(auth)` layout has no navbar/footer — it wraps only login and register
- `(main)` layout wraps all main site pages

### Mock Data
All data is currently mocked inline in page files. When the backend is built:
1. Move fetch logic to `async` Server Component functions at the top of the page
2. Pass data down as props to client components
3. Use Server Actions for mutations

### File Size Guidelines
- Under 200 lines: healthy
- 200–500 lines: review for splitting opportunities
- Over 500 lines: should be split

### One Component Per File
Each file should export one primary component. Internal helper components (not exported) are acceptable in the same file.

---

## Planned Backend Schema (Prisma — not yet implemented)

See `PLANNING.md` at the project root for the full Prisma schema covering:
- User, Account, Session (NextAuth)
- Group, GroupMembership
- Post, Comment, Vote
- MarketplaceListing, SellerReview
- GameEvent, RSVP
- Notification

When implementing:
- Use Prisma Client via a singleton in `src/lib/prisma.ts`
- Use Server Actions in `src/lib/actions/` for all mutations
- Validate all inputs with Zod before any Prisma operation
- Never expose raw Prisma errors to the client

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `src/app/globals.css` | Tailwind v4 config, CSS variables, dark/light theme, utility classes |
| `src/app/layout.tsx` | Root layout — fonts, `class="dark"`, metadata |
| `src/app/(main)/layout.tsx` | Main layout — Navbar + Footer |
| `src/components/layout/Navbar.tsx` | Sticky nav, mobile sheet, auth state placeholder |
| `src/lib/prose.ts` | `PROSE_CLASSES` constant for markdown rendering |
| `src/types/index.ts` | Shared TypeScript types for mock data |
| `PLANNING.md` | Full feature list, phase plan, Prisma schema, URL structure |

