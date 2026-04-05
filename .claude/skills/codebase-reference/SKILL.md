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
**Status:** Backend fully implemented (Express + Prisma + Better Auth). Frontend wired to real API via React Query. Some routes still transitioning from mock data to live data.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | TanStack Start + Vite 7 | SSR-capable, but project runs as a client-rendered SPA |
| Router | TanStack Router (file-based) | Routes in `src/routes/`, auto-generated route tree |
| Language | TypeScript | Strict mode |
| Data Fetching | React Query (`@tanstack/react-query`) | All server data goes through hooks in `src/hooks/` |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` in globals.css |
| UI Components | shadcn/ui via `@base-ui/react` | **Not Radix UI** — see component notes below |
| Animations | `motion` (Framer Motion v12+) | `import { motion } from "motion/react"` |
| Markdown | `react-markdown` + `remark-gfm` | Forum post body and editor preview |
| Typography | `@tailwindcss/typography` | Registered via `@plugin "@tailwindcss/typography"` in globals.css |
| Fonts | Geist Sans, Geist Mono, Barlow Condensed (900) | Via `@fontsource-variable/geist` and `@fontsource/*` packages |
| Real-time | Socket.io client (`socket.io-client`) | For live comments and RSVP updates only |
| HTTP Client | Custom `api` wrapper (`src/lib/api.ts`) | Wraps `fetch` with `credentials: "include"`, base URL from `VITE_API_URL` |
| Backend | Express 5 + Socket.io | Separate package in `server/` |
| Auth | Better Auth | Email/password + username field. Handles sessions via cookies. |
| ORM | Prisma 6 | Schema in `prisma/schema.prisma` |
| Database | PostgreSQL 16 | Docker in dev (port 5432) |
| Dev Environment | Docker Compose | `docker compose up -d` starts Postgres (5432), API (3001), Web (3000) |

### Critical: `@base-ui/react` vs Radix UI

This project uses `@base-ui/react` (Base UI), NOT Radix UI. Key differences:

- **No `asChild` prop** — use `render` prop instead: `<Button render={<Link to="/" />}>`
- **No `asChild` on triggers** — `<SheetTrigger render={<Button />}>`
- When reviewing shadcn component usage, verify patterns against `@base-ui/react` API, not Radix

---

## Code Organization Conventions

### Where Things Go

| What | Where | Notes |
|---|---|---|
| Route files | `src/routes/` | One file per route, file-based routing |
| Data-fetching hooks | `src/hooks/` | Every `useQuery`/`useMutation` lives here, never inline in components |
| Shared reusable components | `src/components/shared/` | Components used across multiple routes |
| Feature-specific components | `src/components/[feature]/` | Components scoped to a single feature (feed, events, etc.) |
| shadcn/ui primitives + custom UI | `src/components/ui/` | Do not add business logic here |
| Shared utilities | `src/lib/` | `api.ts`, `socket.ts`, `constants.ts`, `utils.ts`, `prose.ts` |
| Shared TypeScript types | `src/types/index.ts` | All shared types live here. Never duplicate across files. |
| Backend route handlers | `server/src/routes/` | One file per resource (posts, events, etc.) |
| Auth middleware | `server/src/middleware/auth.ts` | `requireAuth` and `optionalAuth` |
| Socket.io event handlers | `server/src/socket/` | One file per event domain |

### Naming Conventions

| Pattern | Convention | Examples |
|---|---|---|
| Route files | Lowercase with TanStack Router conventions | `__root.tsx`, `_main.tsx`, `$id.tsx`, `$slug.tsx` |
| Dynamic route segments | Prefixed with `$` | `$id.tsx`, `$slug.tsx`, `$username.tsx` |
| Pathless layout groups | Prefixed with `_` | `_main.tsx`, `_auth.tsx` |
| Root layout | Double underscore | `__root.tsx` |
| Components | PascalCase | `PostCard.tsx`, `CommentThread.tsx` |
| Utility / lib files | camelCase | `prose.ts`, `api.ts`, `constants.ts` |
| Hook files | kebab-case prefixed with `use-` | `use-posts.ts`, `use-auth.ts` |
| Hook functions | camelCase prefixed with `use` | `usePostsList()`, `usePostDetail()`, `useCreatePost()` |
| Types | PascalCase | `Post`, `GameEvent`, `MarketplaceListing` |
| Imports | Always use `@/` alias | `import { Post } from "@/types"`, never `../../types` |

### File Size Guidelines

- Under 200 lines: healthy
- 200–500 lines: review for splitting opportunities
- Over 500 lines: should be split
- Over 1,000 lines: must split

### One Component Per File

Each file exports one primary component. Internal helper components (unexported, used only within the same file) are acceptable.

---

## Data Fetching Patterns

### The Rule

**All server data goes through React Query hooks in `src/hooks/`.** Never fetch in `useEffect`. Never fetch directly in components.

| What | Pattern |
|---|---|
| Read data | `useQuery` hook in `src/hooks/` |
| Write / mutate data | `useMutation` hook in `src/hooks/` |
| Invalidate after mutation | `queryClient.invalidateQueries()` in `onSuccess` |
| Real-time updates | Socket.io event → `queryClient.setQueryData()` in a `useEffect` within the hook |
| No global state | No Zustand, no Redux, no Context for server data |

### Hook File Pattern

```ts
// src/hooks/use-[resource].ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Resource } from "@/types"

export function useResourceList(filters?: Filters) {
  return useQuery<Resource[]>({
    queryKey: ["resources", filters],
    queryFn: () => api.get("/api/resources"),
  })
}

export function useCreateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInput) => api.post("/api/resources", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources"] }),
  })
}
```

### Socket.io Real-time Pattern

Socket.io is for real-time invalidation and live updates only — it is NOT the primary data source. The pattern is:

```ts
// Inside a hook file (e.g., use-comments.ts)
export function useComments(postId: string) {
  const qc = useQueryClient()

  // useEffect for Socket.io room join/leave is LEGITIMATE here — it's side-effect setup
  useEffect(() => {
    socket.connect()
    socket.emit("post:join", postId)

    socket.on("comment:new", (comment) => {
      qc.setQueryData(["comments", postId], (prev: Comment[]) => [...prev, comment])
    })

    return () => {
      socket.emit("post:leave", postId)
      socket.off("comment:new")
    }
  }, [postId, qc])

  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => api.get(`/api/posts/${postId}/comments`),
  })
}
```

Socket.io rooms used in this project:
- `post:{postId}` — live comment updates
- `event:{eventId}` — live RSVP count updates
- `user:{userId}` — notifications (auto-joined on auth)

### `api.ts` Wrapper

```ts
// Usage
import { api, ApiError } from "@/lib/api"

const posts = await api.get<Post[]>("/api/posts")
const post = await api.post<Post>("/api/posts", body)
const updated = await api.patch<Post>("/api/posts/123/status", { status: "SOLD" })
await api.delete("/api/posts/123")
```

- Base URL from `import.meta.env.VITE_API_URL`
- Always sends `credentials: "include"` (cookie-based auth)
- Throws `ApiError` (extends Error) with `status: number` on non-2xx responses

---

## Route File Pattern

```tsx
// src/routes/_main/feed/index.tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/feed/")({
  head: () => ({ meta: [{ title: "Feed — Detachment Reaper" }] }),
  component: FeedPage,
})

function FeedPage() {
  const { data: posts } = usePostsList()
  // ...
}
```

For routes with search params:
```tsx
export const Route = createFileRoute("/_main/feed/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
}
```

For dynamic param routes, use `Route.useParams()` or the typed `useParams` hook:
```tsx
// src/routes/_main/feed/$id.tsx
export const Route = createFileRoute("/_main/feed/$id")({
  component: PostPage,
})

function PostPage() {
  const { id } = Route.useParams()
}
```

---

## Backend Patterns

### Server Route Structure

Every Express route handler follows this order:
1. Input validation via Zod `safeParse()`
2. Auth check via `requireAuth` or `optionalAuth` middleware
3. Prisma query
4. Response

```ts
// server/src/routes/posts.ts
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const result = CreatePostSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }
  const post = await prisma.post.create({ data: { ...result.data, authorId: req.user!.id } })
  res.status(201).json(post)
})
```

### Auth Middleware

```ts
// requireAuth — use on all mutation routes (POST, PATCH, DELETE)
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  req.user  // { id, email, name, username } — guaranteed present
  req.session  // { id } — guaranteed present
})

// optionalAuth — use on reads that need user context (e.g., to show vote state)
router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  req.user  // may be undefined
})
```

### API Endpoint Conventions

- `GET /api/[resource]` — list (optionalAuth, supports query filters)
- `POST /api/[resource]` — create (requireAuth, Zod validation)
- `GET /api/[resource]/:id` — detail (optionalAuth)
- `POST /api/[resource]/:id/[action]` — nested action (requireAuth)
- `PATCH /api/[resource]/:id/[field]` — partial update (requireAuth, owner check)

### Error Response Shapes

```ts
// Validation error
{ error: { fieldErrors: { title: ["Required"] }, formErrors: [] } }

// Auth error
{ error: "Unauthorized" }

// Not found
{ error: "Not found" }

// Unique constraint violation (Prisma P2002 -> 409)
{ error: "Already exists" }

// Generic server error
{ error: "Internal server error" }
```

---

## TypeScript Conventions

Sourced from `AGENTS.md` and `CLAUDE.md`:

- All shared types in `src/types/index.ts`, imported as `import type { X } from "@/types"`
- Constant-derived types (e.g., `ForumCategory` from `FORUM_CATEGORIES`) are re-exported from `@/types` via `src/lib/constants.ts`
- Component props interfaces stay local to their file — do not export them to `src/types/`
- Never duplicate type shapes across files
- Never use `any` — use `unknown` and narrow, or define the actual type
- Avoid unsafe type assertions (`as SomeType`) unless unavoidable — add a comment explaining why

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

### Badge Color Maps (in `src/lib/constants.ts`)

All badge color maps are centralized in `src/lib/constants.ts`. Never define color maps inline in components — always import from `@/lib/constants`.

```ts
CATEGORY_COLORS     // Forum post categories
CONDITION_COLORS    // Marketplace item conditions
LISTING_STATUS_COLORS
GAME_TYPE_COLORS
EVENT_STATUS_COLORS
POLL_STATUS_COLORS
FALLBACK_BADGE      // Fallback when no match found
```

Pattern for usage:
```tsx
import { CATEGORY_COLORS, FALLBACK_BADGE } from "@/lib/constants"
const colorClass = CATEGORY_COLORS[category] ?? FALLBACK_BADGE
<Badge className={colorClass}>{category}</Badge>
```

### Shared Prose Classes

Markdown-rendered content uses `PROSE_CLASSES` from `src/lib/prose.ts`. Import and apply this constant to any element rendering markdown. Never duplicate the class string inline.

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

## Code Comment Policy

From `CLAUDE.md`:

- Never write obvious comments that describe what easily readable code does
- Only add comments when they provide additional context not apparent from the code
- Comments explain *why*, not *what*, when the *what* is self-evident
- No decorative separator comments (e.g., `// ===== HANDLERS =====`)
