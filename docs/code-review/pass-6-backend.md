# Pass 6 — Backend

Code quality review focusing on route handler structure, Prisma query quality, input validation, auth/security, Socket.io correctness, and error handling.

Reviewed files:
- `server/src/index.ts`
- `server/src/auth.ts`
- `server/src/middleware/auth.ts`
- `server/src/routes/posts.ts`, `comments.ts`, `events.ts`, `marketplace.ts`, `users.ts`, `groups.ts`, `polls.ts`, `reports.ts`, `notifications.ts`, `messages.ts`, `blocks.ts`, `audit.ts`, `auth.ts`
- `server/src/socket/index.ts`, `comments.ts`, `events.ts`, `notifications.ts`, `chat.ts`
- `server/src/lib/notify.ts`, `audit.ts`, `embed.ts`, `constants.ts`

---

## 1. Route Handler Structure

---

**File:** `server/src/routes/posts.ts` (line 349)
**Issue:** Structure — Validation runs after DB fetch in `PATCH /:id` (edit post)
**Impact:** Low
**Fix:** The handler fetches the post from DB and checks ownership (lines 353–372) before calling `updatePostSchema.safeParse(req.body)` at line 374. A request with an invalid body still hits the database. Move `safeParse` to the top of the handler, before any DB query.

```ts
// Current order (lines 349–394):
// 1. findUnique (DB)
// 2. ownership check
// 3. safeParse (validation)  ← too late

// Correct order:
// 1. safeParse (validation)
// 2. findUnique (DB)
// 3. ownership check
// 4. update (DB)
```

---

**File:** `server/src/routes/comments.ts` (line 126)
**Issue:** Structure — Validation runs after DB fetch in `POST /` (create comment)
**Impact:** Low
**Fix:** The post existence/lock checks (lines 128–146) happen before `createCommentSchema.safeParse(req.body)` at line 148. A request with a missing or oversized `content` field still executes two DB queries. Move `safeParse` first.

---

**File:** `server/src/routes/comments.ts` (line 220)
**Issue:** Structure — Validation runs after DB fetch in `PATCH /:commentId` (edit comment)
**Impact:** Low
**Fix:** Same pattern: comment fetched and ownership checked (lines 224–243) before `updateCommentSchema.safeParse(req.body)` at line 245. Move `safeParse` first.

---

**File:** `server/src/routes/events.ts` (line 94)
**Issue:** Structure — Missing existence check before RSVP upsert
**Impact:** Medium
**Fix:** `POST /:id/rsvp` calls `prisma.rSVP.upsert()` at line 105 without first verifying the event exists. If a client submits an RSVP for a nonexistent event ID, Prisma will throw a foreign-key constraint error (`P2003`) that falls through to the generic 500 handler instead of returning a clean 404.

```ts
// Add before the upsert:
const event = await prisma.gameEvent.findUnique({
  where: { id: eventId },
  select: { id: true },
});
if (!event) {
  res.status(404).json({ error: "Event not found" });
  return;
}
```

---

## 2. Prisma Query Quality

---

**File:** `server/src/routes/messages.ts` (line 84)
**Issue:** Prisma — N+1 query: one `message.count()` per conversation in the list endpoint
**Impact:** High
**Fix:** `GET /api/conversations` fires one `prisma.message.count()` for every conversation returned (up to 50), totalling up to 50 DB round-trips per page load.

Replace with a single aggregated query using `groupBy`:

```ts
// Current (N+1):
const unreadCounts = await Promise.all(
  conversations.map((conv) =>
    prisma.message.count({
      where: { conversationId: conv.id, senderId: { not: userId }, readAt: null, deletedAt: null },
    }),
  ),
);

// Fix — single query:
const unreadAgg = await prisma.message.groupBy({
  by: ["conversationId"],
  where: {
    conversationId: { in: conversations.map((c) => c.id) },
    senderId: { not: userId },
    readAt: null,
    deletedAt: null,
  },
  _count: true,
});
const unreadMap = new Map(unreadAgg.map((r) => [r.conversationId, r._count]));
// Then: unreadCount: unreadMap.get(conv.id) ?? 0
```

---

**File:** `server/src/routes/marketplace.ts` (line 11)
**Issue:** Prisma — Unbounded `findMany` on `marketplaceListing`
**Impact:** High
**Fix:** `GET /api/listings` has no `take` limit. As the listings table grows, this query returns all rows. Add pagination:

```ts
// Add to the findMany call:
take: 50,
orderBy: { createdAt: "desc" },
// and accept cursor/limit query params like the posts endpoint
```

---

**File:** `server/src/routes/events.ts` (line 11)
**Issue:** Prisma — Unbounded `findMany` on `gameEvent`
**Impact:** Medium
**Fix:** `GET /api/events` fetches all events with no `take` limit. Add a `take` cap (e.g., 100) or full pagination. Events are time-ordered so cursor pagination on `date` is natural.

---

**File:** `server/src/routes/groups.ts` (line 11)
**Issue:** Prisma — Unbounded `findMany` on `group`
**Impact:** Medium
**Fix:** `GET /api/groups` fetches all groups with no `take` limit. Add `take: 50` and cursor pagination.

---

**File:** `server/src/routes/marketplace.ts` (line 226)
**Issue:** Prisma — Non-atomic ownership check in `PATCH /:id/status`
**Impact:** Medium
**Fix:** The handler fetches the listing at line 226, checks ownership at line 228, then updates at line 233 as two separate operations. A race condition (though unlikely at this scale) or a subtle refactor could drop the ownership check.

Use the atomic pattern instead:

```ts
// Current (two steps):
const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
if (!listing || listing.sellerId !== req.user!.id) {
  res.status(403).json({ error: "Forbidden" });
  return;
}
const updated = await prisma.marketplaceListing.update({ where: { id }, data: { status } });

// Atomic (one step):
const updated = await prisma.marketplaceListing.updateMany({
  where: { id, sellerId: req.user!.id },
  data: { status: parsed.data.status },
});
if (updated.count === 0) {
  res.status(404).json({ error: "Listing not found or forbidden" });
  return;
}
```

---

**File:** `server/src/routes/posts.ts` (line 627)
**Issue:** Prisma — Two separate COUNT queries after vote upsert
**Impact:** Low
**Fix:** `POST /:id/vote` fires `prisma.vote.count({ where: { postId, value: 1 } })` and `prisma.vote.count({ where: { postId, value: -1 } })` as two queries (lines 627–628). Combine into one `groupBy` or use `_count` in a single select:

```ts
const counts = await prisma.vote.groupBy({
  by: ["value"],
  where: { postId },
  _count: true,
});
const upvotes = counts.find((c) => c.value === 1)?._count ?? 0;
const downvotes = counts.find((c) => c.value === -1)?._count ?? 0;
```

The same pattern appears in `comments.ts` lines 426–427 for comment votes.

---

**File:** `server/src/routes/notifications.ts` (line 28)
**Issue:** Prisma — Separate COUNT query after list query
**Impact:** Low
**Fix:** `GET /api/notifications` fetches the notification list AND fires a separate `prisma.notification.count()` for `unreadCount` (lines 28–30). These can be combined into a `$transaction` or the count can be derived from the result if `take` is small enough, reducing one round-trip per notifications page load.

---

## 3. Input Validation Completeness

---

**File:** `server/src/routes/events.ts` (line 62)
**Issue:** Validation — `date` field accepts any string; invalid dates are stored silently
**Impact:** High
**Fix:** `date: z.string()` passes any string to `new Date(parsed.data.date)` at line 83. `new Date("not-a-date")` produces `Invalid Date`, which Prisma stores as an invalid timestamp. Use `z.string().datetime()` or `z.coerce.date()` with a refinement:

```ts
date: z.string().refine((s) => !isNaN(new Date(s).getTime()), {
  message: "Invalid date format",
}),
```

Or simply:
```ts
date: z.coerce.date(),
// then remove the `new Date(parsed.data.date)` cast in the handler
```

---

**File:** `server/src/routes/events.ts` (line 63)
**Issue:** Validation — `gameType` accepts any non-empty string instead of an enum
**Impact:** Medium
**Fix:** `gameType: z.string().min(1)` allows arbitrary strings. This field maps to a Prisma field that the client uses for filtering and display. Define a `GAME_TYPES` constant (matching the frontend `GAME_TYPE_COLORS` map in `src/lib/constants.ts`) and use `z.enum(GAME_TYPES)`.

---

**File:** `server/src/routes/marketplace.ts` (line 190)
**Issue:** Validation — `category` in `createListingSchema` accepts any non-empty string
**Impact:** Medium
**Fix:** `category: z.string().min(1)` allows arbitrary category strings. The marketplace listing endpoint at `GET /api/listings` uses `category` as a filter. Define and export a `LISTING_CATEGORIES` constant and use `z.enum(LISTING_CATEGORIES)`.

---

**File:** `server/src/routes/marketplace.ts` (line 187)
**Issue:** Validation — `description` in `createListingSchema` has no max length
**Impact:** Medium
**Fix:** `description: z.string().min(1)` has no upper bound. A user can submit megabytes of text. Add `.max(10_000)` or a reasonable limit.

---

**File:** `server/src/routes/audit.ts` (line 35)
**Issue:** Validation — Query params `action` and `targetType` are unsanitized enum casts
**Impact:** Medium
**Fix:** Both the public (`GET /api/audit`, line 35) and mod (`GET /api/audit/mod`, line 65) endpoints cast query params directly:

```ts
action: action as AuditAction
targetType: targetType as ModerationTarget
```

An invalid value (e.g., `?action=DROP+TABLE`) is passed directly to Prisma's `where` clause. Prisma will safely reject unknown enum values at runtime, but the pattern is fragile. Validate with Zod:

```ts
import { AuditAction, ModerationTarget } from "@prisma/client";
const action = z.nativeEnum(AuditAction).optional().parse(req.query.action);
```

The same pattern appears in `reports.ts` lines 110–112 for `status`, `targetType`, and `category`.

---

**File:** `server/src/routes/events.ts` (line 59)
**Issue:** Validation — `description`, `rules` fields in `createEventSchema` have no max length
**Impact:** Low
**Fix:** `description: z.string().optional()` and `rules: z.string().optional()` have no upper bounds. Add `.max(10_000)` or similar.

---

**File:** `server/src/routes/groups.ts` (line 57)
**Issue:** Validation — `description` in `createGroupSchema` has no max length
**Impact:** Low
**Fix:** `description: z.string().optional()` — add `.max(2000)`.

---

**File:** `server/src/lib/constants.ts` (line 1)
**Issue:** Validation — Server `FORUM_CATEGORIES` is manually duplicated from the frontend
**Impact:** Low
**Fix:** The comment on line 1 says "Keep in sync manually — both lists must match." This is a DRY violation waiting to cause a divergence bug. The server constants should be the single source of truth, shared via a workspace package or symlinked import. At minimum, add a CI test that asserts both lists are identical.

---

## 4. Auth and Security

---

**File:** `server/src/auth.ts` (line 8)
**Issue:** Auth — Hardcoded fallback secret in production-shipped code
**Impact:** Critical
**Fix:** `secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production"` ships a known, public fallback secret. If deployed without `BETTER_AUTH_SECRET` set, sessions can be forged by anyone who knows the fallback value (it's visible in this source file). The server should refuse to start if this variable is unset:

```ts
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  console.error("FATAL: BETTER_AUTH_SECRET environment variable is not set");
  process.exit(1);
}

export const auth = betterAuth({
  // ...
  secret,
});
```

---

**File:** `server/src/middleware/auth.ts` (line 24)
**Issue:** Auth — `auth.api.getSession()` not wrapped in try/catch
**Impact:** High
**Fix:** In both `requireAuth` (line 24) and `optionalAuth` (line 82), `auth.api.getSession()` is called without a try/catch. If Better Auth throws (database connection failure, malformed cookie, library bug), the error propagates as an unhandled rejection. In Express 5, async errors are forwarded to the error middleware — but this will send a 500 "Internal server error" to the client without any context. Wrap in try/catch:

```ts
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let session;
  try {
    session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  } catch {
    res.status(500).json({ error: "Authentication service unavailable" });
    return;
  }
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // ...
}
```

---

**File:** `server/src/index.ts` (line 30) / `server/src/auth.ts` (line 7)
**Issue:** Auth — No enforcement that `CLIENT_URL` / `BETTER_AUTH_URL` are set in production
**Impact:** High
**Fix:** Both fall back to `localhost` URLs. If deployed without these env vars, the CORS origin and Better Auth base URL will point to localhost, either rejecting all browser requests or behaving unexpectedly. Add startup assertions for required env vars in production (check `NODE_ENV === "production"`).

---

**File:** All routes — no rate limiting
**Issue:** Auth — No rate limiting on auth or mutation endpoints
**Impact:** High
**Fix:** There is no rate limiting anywhere in the Express app — not on `/api/auth/sign-in`, `/api/auth/sign-up`, or any mutation endpoint. This enables:
- Brute-force attacks against passwords on the sign-in endpoint
- Spam creation of posts, comments, listings, and reports
- Account enumeration via the user search endpoint

Add `express-rate-limit` at minimum for auth endpoints:

```ts
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests, please try again later" },
});

app.use("/api/auth/sign-in", authLimiter);
app.use("/api/auth/sign-up", authLimiter);
```

---

**File:** `server/src/routes/marketplace.ts` (line 11)
**Issue:** Auth — `GET /api/listings` has no auth but passes unsanitized enum values to Prisma
**Impact:** Medium
**Fix:** The `status`, `condition`, and `category` query params are cast directly into the Prisma `where` clause (lines 16–18) without validation:

```ts
status: status as "AVAILABLE" | "RESERVED" | "SOLD"
condition: condition as "NEW" | "LIKE_NEW" | "USED" | "FOR_PARTS"
```

While Prisma's generated types will reject truly invalid values at runtime with a known error, the explicit type assertion `as "AVAILABLE" | ...` suppresses TypeScript's type checking. Replace with Zod validation:

```ts
const statusSchema = z.enum(["AVAILABLE", "RESERVED", "SOLD"]).optional();
const conditionSchema = z.enum(["NEW", "LIKE_NEW", "USED", "FOR_PARTS"]).optional();
const validatedStatus = statusSchema.safeParse(req.query.status);
const validatedCondition = conditionSchema.safeParse(req.query.condition);
```

---

**File:** `server/src/routes/users.ts` (line 54)
**Issue:** Auth — Public profile exposes ban history with `reason` field
**Impact:** Low
**Fix:** The public profile endpoint (`GET /api/users/:username`) includes the active ban's `reason` text in the response (line 82). Ban reasons may contain sensitive or embarrassing details entered by moderators (e.g., "banned for sharing personal information about user X"). Consider omitting `reason` from the public profile and only exposing it on the mod-only admin panel endpoints. Or at minimum, document this as intentional.

---

## 5. Socket.io Event Handler Correctness

---

**File:** `server/src/socket/comments.ts` (line 8)
**Issue:** Socket — No input validation on `post:join` / `post:leave` events
**Impact:** Medium
**Fix:** `socket.on("post:join", (postId: string) => { socket.join(`post:${postId}`) })` uses the raw client-supplied value with no validation. A malicious client can emit `post:join` with an empty string (joining room `post:`), a very long string, or a string with special characters that could pollute the room namespace.

```ts
socket.on("post:join", (postId: unknown) => {
  if (typeof postId !== "string" || postId.length === 0 || postId.length > 30) return;
  socket.join(`post:${postId}`);
});

socket.on("post:leave", (postId: unknown) => {
  if (typeof postId !== "string" || postId.length === 0 || postId.length > 30) return;
  socket.leave(`post:${postId}`);
});
```

---

**File:** `server/src/socket/events.ts` (line 7)
**Issue:** Socket — No input validation on `event:join` / `event:leave` events
**Impact:** Medium
**Fix:** Same issue as `post:join`. The `eventId` is used directly with no type or length check:

```ts
socket.on("event:join", (eventId: unknown) => {
  if (typeof eventId !== "string" || eventId.length === 0 || eventId.length > 30) return;
  socket.join(`event:${eventId}`);
});
```

---

**File:** `server/src/socket/index.ts` (line 26)
**Issue:** Socket — Auth middleware always calls `next()` regardless of session validity
**Impact:** Low
**Fix:** The Socket.io auth middleware sets `socket.data.user` only when a valid session exists, but always calls `next()` (line 28), allowing unauthenticated sockets to connect. This is intentional for public room subscriptions (`post:*`, `event:*`), but the comment should make this explicit, and any future handler that gates on auth should check `socket.data.user` before proceeding. The current design is sound given the explicit `if (socket.data.user)` guard in `notifications.ts`.

---

## 6. Error Handling

---

**File:** `server/src/index.ts` (line 71)
**Issue:** Error — Global error handler does not catch `P2025` (record not found on update/delete)
**Impact:** High
**Fix:** The global error handler (lines 71–78) catches `P2002` (unique constraint) but not `P2025` (record not found on update/delete). If any `prisma.X.update()` or `prisma.X.delete()` is called on a record that was concurrently deleted, Prisma throws `PrismaClientKnownRequestError` with code `P2025`. This currently produces a 500 "Internal server error" response instead of a meaningful 404.

```ts
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Already exists" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({ error: "Referenced record not found" });
      return;
    }
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

---

**File:** `server/src/routes/comments.ts` (line 171)
**Issue:** Error — Notification logic runs after response is sent; errors are silently swallowed
**Impact:** Medium
**Fix:** In `POST /` (create comment), `res.status(201).json(comment)` is sent at line 171, then the handler continues with `notify()` calls (lines 180–209). Any error thrown by `notify()` or the subsequent `prisma.comment.findUnique()` / `prisma.post.findUnique()` calls **after** the response is already sent will be silently unhandled — Express cannot catch errors thrown after `res.json()`.

The intent is fire-and-forget, but the implementation awaits the notification calls synchronously. Wrap the post-response work in a detached promise with explicit error logging:

```ts
res.status(201).json(comment);

// Fire-and-forget: detach from request lifecycle
void (async () => {
  try {
    if (parsed.data.parentCommentId) {
      // ... notify reply author
    } else {
      // ... notify post author
    }
  } catch (err) {
    console.error("Notification error after comment create:", err);
  }
})();
```

---

**File:** `server/src/routes/events.ts` (line 94)
**Issue:** Error — Missing P2003 (foreign key) error handling on RSVP upsert
**Impact:** Medium
**Fix:** As noted in the Structure section, `POST /:id/rsvp` calls `prisma.rSVP.upsert()` without checking that the event exists. A nonexistent `eventId` will cause Prisma to throw `P2003` (foreign key constraint violation), which the global handler doesn't catch specifically and returns a 500. Add an existence check (see finding in section 1) or add `P2003` handling to the global error handler.

---

**File:** `server/src/routes/posts.ts` (line 397)
**Issue:** Error — Socket.io broadcast after `res.json()` is unguarded
**Impact:** Low
**Fix:** Multiple handlers emit to Socket.io rooms after `res.json()` has been called (e.g., `posts.ts:397`, `posts.ts:472`, `posts.ts:521`, `comments.ts:431`). If `req.app.get("io")` throws or the emit call itself throws (e.g., malformed payload), the error occurs after the response is sent and Express cannot catch it, causing an unhandled rejection. These are low-risk in practice since `app.get("io")` is set at startup, but wrapping the emit in a try/catch is defensive:

```ts
try {
  req.app.get("io").to(`post:${postId}`).emit("post:updated", updatedPost);
} catch (err) {
  console.error("Socket emit error:", err);
}
```

---

**File:** `server/src/middleware/auth.ts` (line 44)
**Issue:** Error — Ban check in `requireAuth` has no error handling
**Impact:** Medium
**Fix:** The `prisma.ban.findFirst()` call at line 44 (inside `requireAuth`) has no try/catch. If the Prisma ban query fails (connection issue, schema mismatch), the error propagates to Express 5's async error handler and returns a 500. This means a database hiccup blocks ALL authenticated requests. Consider wrapping it or at minimum logging the failure context separately from a generic auth failure.

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Route Handler Structure | 0 | 0 | 1 | 3 | 4 |
| Prisma Query Quality | 0 | 1 | 3 | 3 | 7 |
| Input Validation | 0 | 1 | 3 | 3 | 7 |
| Auth and Security | 1 | 3 | 1 | 1 | 6 |
| Socket.io | 0 | 0 | 2 | 1 | 3 |
| Error Handling | 0 | 1 | 3 | 2 | 6 |
| **Total** | **1** | **6** | **13** | **13** | **33** |

---

### Top Priority Fixes

1. **[Critical — Auth]** `server/src/auth.ts:8` — Remove the hardcoded `BETTER_AUTH_SECRET` fallback. Add a startup guard that calls `process.exit(1)` if the env var is unset. A known public fallback secret allows session forgery.

2. **[High — Auth]** Add `express-rate-limit` to all auth endpoints (`/api/auth/sign-in`, `/api/auth/sign-up`). Brute-force protection is table-stakes for any web application with user accounts.

3. **[High — Auth]** `server/src/middleware/auth.ts:24,82` — Wrap `auth.api.getSession()` in try/catch in both `requireAuth` and `optionalAuth`. An uncaught Better Auth exception currently blocks all authenticated routes with a generic 500.

4. **[High — Error]** `server/src/index.ts:71` — Add `P2025` (record not found) and `P2003` (foreign key violation) handling to the global Prisma error handler. These currently produce misleading 500 errors.

5. **[High — Prisma]** `server/src/routes/messages.ts:84` — Replace the N+1 `Promise.all(conversations.map(count))` pattern with a single `groupBy` query. This is the most impactful performance fix — it reduces up to 50 DB queries to 1 on every conversations list load.

6. **[High — Prisma]** `server/src/routes/marketplace.ts:11` / `events.ts:11` / `groups.ts:11` — Add `take` limits to unbounded `findMany` queries. These three endpoints return all rows and will degrade as data grows.

7. **[High — Validation]** `server/src/routes/events.ts:62` — Replace `date: z.string()` with `z.coerce.date()` or add a `.refine()` to reject invalid dates. `new Date("garbage")` produces `Invalid Date` which gets stored.

8. **[Medium — Error]** `server/src/routes/comments.ts:171` — Detach post-response notification logic into a `void (async () => { ... })()` with explicit error logging. Currently, errors after `res.json()` are silently swallowed.
