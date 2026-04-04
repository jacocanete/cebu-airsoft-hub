# Detachment Reaper — Cebu Airsoft Community Platform

A niche social platform for the Cebu airsoft community. Three core pillars: **Discussion**, **Marketplace**, and **Matchmaking/Events**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | TanStack Start + TanStack Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui via `@base-ui/react` |
| Animations | Framer Motion (`motion/react`) |
| Data fetching | React Query (`@tanstack/react-query`) |
| Real-time | Socket.io |
| API server | Express 5 |
| Auth | Better Auth (email/password) |
| ORM | Prisma |
| Database | PostgreSQL |
| File storage | Cloudflare R2 (S3-compatible) |
| Maps | Google Maps JavaScript API |
| Dev environment | Docker Compose (Postgres + API + Web) |
| Hosting | Self-hosted VPS (PM2 + Nginx + Let's Encrypt) |

---

## Feature List

### 1. User Accounts & Profiles
- Registration / login (email + password)
- Customizable profile: avatar, cover photo, bio, gear list, play style, team affiliation
- Profile badges: team badges, event participation count, marketplace reputation
- Activity history: posts, RSVPs, listings
- Settings page: edit profile, change password, notification preferences

### 2. Groups / Teams
- Groups can register on the site (name, slug, logo, description, banner)
- Group profile page with member list and roster
- Group roles: Owner, Admin, Member
- Group badges that render on member profiles throughout the site
- Group admins can manage members and group info

### 3. Discussion Forum
- Create posts with title, body (Markdown), category, and tags
- Categories: General, Gear Reviews, Tips & Tactics, Buy/Sell, Memes, News
- Upvote / downvote system
- Threaded comments (nested replies, live via Socket.io)
- Sort by: New, Top, Hot
- Filter by category
- Search posts
- Optional poll attached to post

### 4. Marketplace
- Listings with title, description, price, condition, category, images
- Conditions: New, Like New, Used, For Parts
- Categories: Rifles, Pistols, SMGs, Shotguns, Gear & Apparel, Accessories, Parts, Ammo & BBs
- Status: Available, Reserved, Sold
- Browse with filters: category, condition, search
- Seller reviews

### 5. Game Matchmaking / Events
- Create event: title, description, game site, date/time, location (Google Maps), entrance fee, game type, player cap, rules, organizing group
- Game types: MilSim, CQB, Speedsoft, Open Field, Night Game
- Events list: upcoming games, filterable by game type / status
- Single event page: full details, map embed, RSVP button, live participant list
- RSVP count updates in real-time via Socket.io
- Event status: Upcoming, Ongoing, Completed, Cancelled

---

## Phase Plan

### Phase 1 — Frontend UI
- [x] Project scaffold (TanStack Start, Tailwind v4, shadcn/ui)
- [x] Route structure — all pages built with mock data
- [x] Global layout (Navbar, mobile sheet drawer)
- [x] Landing page (hero, features, stats, CTA)
- [x] Auth pages (login, register) — UI only
- [x] Forum: feed, single post, create post, search
- [x] Marketplace: browse, listing card
- [x] Events: list, event detail + RSVP UI
- [x] Groups: list page
- [x] Profile page
- [x] Shared components (PageHeader, BackLink, UserAvatar)

### Phase 2 — Backend Infrastructure
- [x] Docker Compose dev environment (Postgres + API + Web)
- [x] Prisma schema (all models)
- [x] Express API server (`server/`)
- [x] Better Auth (email/password)
- [x] REST routes: posts, comments, events, marketplace, groups, users
- [x] Socket.io: post comment rooms, event RSVP rooms, user notification rooms
- [x] React Query hooks for all entities (`src/hooks/`)
- [x] `QueryClientProvider` in root
- [ ] Install server dependencies (`cd server && npm install`)
- [ ] Run `prisma migrate dev` + seed
- [ ] Wire auth pages (login, register) to Better Auth hooks
- [ ] Update Navbar to use `useCurrentUser()`

### Phase 3 — Wire Routes to Real Data
- [ ] Forum feed → `usePostsList()`
- [ ] Single post → `usePostDetail()` + `useComments()` (live)
- [ ] Create post → `useCreatePost()`
- [ ] Marketplace → `useListings()`
- [ ] Events list → `useEventsList()`
- [ ] Event detail → `useEventDetail()` + `useRsvp()` (live)
- [ ] Groups → `useGroups()`
- [ ] Profile → user API
- [ ] Delete `src/lib/mock-data.ts`

### Phase 4 — Polish & Deploy
- [ ] Image uploads (Cloudflare R2)
- [ ] Google Maps embed on event pages
- [ ] Global search
- [ ] Notifications system
- [ ] Admin/mod tools
- [ ] SEO (metadata, OG images)
- [ ] VPS deploy (Docker + Nginx + Let's Encrypt)

---

## Project Structure

```
detachment-reaper/
├── docker-compose.yml           # Postgres + API + Web
├── prisma/
│   ├── schema.prisma            # Full database schema
│   └── seed.ts                  # Dev seed data
├── server/                      # Express API (port 3001)
│   └── src/
│       ├── index.ts             # Express + Socket.io bootstrap
│       ├── auth.ts              # Better Auth config
│       ├── prisma.ts            # Prisma client singleton
│       ├── middleware/auth.ts   # Session middleware
│       ├── routes/              # REST route handlers
│       └── socket/              # Socket.io event handlers
└── src/                         # TanStack Start frontend (port 3000)
    ├── routes/                  # File-based routes
    │   ├── __root.tsx           # Root layout + QueryClientProvider
    │   ├── _main.tsx            # Main layout (Navbar + Footer)
    │   ├── _auth.tsx            # Auth layout
    │   └── _main/               # All main site pages
    ├── components/              # UI components by feature
    ├── hooks/                   # React Query hooks
    │   ├── use-auth.ts
    │   ├── use-posts.ts
    │   ├── use-comments.ts
    │   ├── use-events.ts
    │   ├── use-marketplace.ts
    │   └── use-groups.ts
    ├── lib/
    │   ├── api.ts               # Fetch wrapper
    │   ├── socket.ts            # Socket.io client
    │   ├── constants.ts         # Shared constants + derived types
    │   └── prose.ts             # Markdown prose classes
    └── types/
        └── index.ts             # Shared TypeScript types
```

---

## URL Structure

```
/                          Landing page
/feed                      Discussion forum feed
/feed/$id                  Single post + comments
/feed/new                  Create post
/feed/search               Search results
/marketplace               Browse listings
/marketplace/$id           Single listing
/marketplace/new           Create listing
/events                    Upcoming games
/events/$id                Single event + RSVP
/events/new                Create event
/profile/$username         User profile
/groups                    Browse groups
/groups/$slug              Group profile
/groups/new                Create group
/settings                  User settings
/login                     Login
/register                  Register
```

---

## Dev Setup

```bash
cp .env.example .env          # fill in secrets
docker compose up -d          # starts Postgres, API, Web
cd server && npm install       # install API dependencies
npx prisma migrate dev         # run migrations
npx prisma db seed             # seed with dev data
```

Frontend: `http://localhost:3000`
API: `http://localhost:3001`
