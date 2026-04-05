# Detachment Reaper

Community platform for the Cebu airsoft scene. Forum, marketplace, and game matchmaking — all in one place.

## Stack

| Layer | Tech |
|---|---|
| Frontend | TanStack Start + TanStack Router, React 19 |
| Styling | Tailwind CSS v4, shadcn/ui via `@base-ui/react` |
| Data fetching | React Query |
| Real-time | Socket.io |
| API | Express 5 |
| Auth | Better Auth (email/password) |
| ORM | Prisma |
| Database | PostgreSQL |

---

## Local Development

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- Node.js 22+

### First-time setup

```bash
# 1. Clone and install frontend dependencies
git clone <repo-url>
cd detachment-reaper
npm install

# 2. Install API dependencies
cd server && npm install && cd ..

# 3. Copy and fill in the one required secret
cp .env.example .env
# Edit .env — generate BETTER_AUTH_SECRET with: openssl rand -base64 32

# 4. Start Postgres
docker compose up -d db

# 5. Run migrations and seed dev data
npm install  # installs prisma at root
npm run db:migrate
npm run db:seed

# 6. Start both servers
```

In two terminals:

```bash
# Terminal 1 — API (port 3001)
cd server && npm run dev

# Terminal 2 — Web (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgresql://reaper:reaper@localhost:5432/detachment_reaper` |
| `BETTER_AUTH_SECRET` | Long random secret for session signing | — must set — |
| `BETTER_AUTH_URL` | Public URL of the API | `http://localhost:3001` |
| `CLIENT_URL` | Public URL of the frontend | `http://localhost:3000` |
| `PORT` | API port | `3001` |
| `VITE_API_URL` | API URL used by the browser | `http://localhost:3001` |

### Project structure

```
detachment-reaper/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Dev seed data
├── server/                 # Express API (port 3001)
│   └── src/
│       ├── index.ts        # Express + Socket.io bootstrap
│       ├── auth.ts         # Better Auth config
│       ├── middleware/     # Session middleware
│       ├── routes/         # REST handlers
│       └── socket/         # Socket.io event handlers
└── src/                    # TanStack Start frontend (port 3000)
    ├── routes/             # File-based routes
    ├── components/         # UI components by feature
    ├── hooks/              # React Query hooks (src/hooks/)
    ├── lib/                # Shared utilities
    └── types/              # Shared TypeScript types
```

### Useful commands

```bash
# Open Prisma Studio (visual DB browser)
npm run db:studio

# Re-run migrations after schema changes
npm run db:migrate

# Type-check frontend
npx tsc --noEmit

# Type-check API
cd server && npx tsc --noEmit
```

---

## Deployment (Coolify)

The app deploys as three separate Coolify resources.

### 1. Database

**New Resource → Database → PostgreSQL**

Create the service and copy the generated `DATABASE_URL`.

---

### 2. API

**New Resource → Application → Docker**

| Setting | Value |
|---|---|
| Build context | `/` (repo root — required for Prisma schema access) |
| Dockerfile | `server/Dockerfile` |
| Port | `3001` |

**Environment variables:**

```
DATABASE_URL=        # from step 1
BETTER_AUTH_SECRET=  # openssl rand -base64 32
BETTER_AUTH_URL=     # https://api.yourdomain.com
CLIENT_URL=          # https://yourdomain.com
PORT=                # 3001
```

The API runs `prisma migrate deploy` automatically on startup.

---

### 3. Web

**New Resource → Application → Docker**

| Setting | Value |
|---|---|
| Dockerfile | `Dockerfile` (repo root) |
| Port | `3000` |

**Build argument** (not an env var — Vite bakes this in at build time):

```
VITE_API_URL=https://api.yourdomain.com
```

Set this in Coolify's **Build Arguments** section, not Environment Variables.
