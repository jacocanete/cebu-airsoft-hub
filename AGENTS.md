# Stack

This project uses **TanStack Router** (not Next.js). Do not apply Next.js-specific patterns.

## Frontend

- Framework: TanStack React Start + Vite
- Router: TanStack Router (file-based, routes in `src/routes/`)
- Data fetching: **React Query** (`@tanstack/react-query`) — hooks live in `src/hooks/`
- Real-time: Socket.io client (`src/lib/socket.ts`)
- UI: shadcn/ui via `@base-ui/react` — use `render` prop instead of `asChild`
- Styling: Tailwind CSS v4

## Backend

- Server: Express + Socket.io in `server/`
- ORM: Prisma — schema in `prisma/schema.prisma`
- Auth: Better Auth — config in `server/src/auth.ts`
- Database: PostgreSQL (Docker in dev)

## Dev environment

`docker compose up -d` starts everything: Postgres (5432), API (3001), Web (3000).

## Data fetching rules

- All server data goes through React Query hooks in `src/hooks/`
- Never fetch in `useEffect` — use hooks only
- Socket.io is for real-time invalidation only, not primary data fetching
- Do not introduce Zustand or other global state stores
