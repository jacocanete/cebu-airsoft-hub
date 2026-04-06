---
name: review-backend
description: Comprehensive code review pass for the Express backend — route handler structure, Prisma query quality, input validation, auth and security, Socket.io correctness, and error handling
license: MIT
metadata:
  pass: "6"
  category: code-review
---

## What I Do

Run a comprehensive backend audit of the Cebu Airsoft Hub server code. This is Pass 6 of a 6-pass code quality review. I review all Express route handlers, Prisma queries, Zod validation, auth/security patterns, Socket.io event handlers, and error handling in `server/src/`.

> **Before starting:** Load the `codebase-reference` skill to understand the backend's architecture, the Express route structure pattern, the auth middleware, Prisma models, and Socket.io room conventions. All findings must be grounded in that context.

## When to Use Me

Use this skill to review all server-side code in `server/src/`. Run it alongside or after the frontend passes when changes touch both layers, or run it standalone when only backend code has changed.

## Review Procedure

### Step 1: Route Handler Structure Consistency

Every route handler in `server/src/routes/` should follow this order:

1. **Input validation** via Zod `safeParse()` (before anything else)
2. **Auth check** via `requireAuth` or `optionalAuth` middleware (or inline for nested authorization)
3. **Prisma query**
4. **Response**

Check every POST, PATCH, and DELETE handler for:

- **Missing validation**: Any mutation that reads from `req.body` without calling `safeParse()` first — this means unvalidated user input reaches Prisma
- **Validation after auth**: Validation that runs after the auth check — wasted work if validation fails; move validation first
- **Inconsistent error response shapes**: Check that all error responses follow the same shape `{ error: "message" }` or `{ error: validationErrorObject }`. Mixed shapes (sometimes `{ message: "..." }`, sometimes `{ error: "..." }`) create inconsistency for the client.
- **Missing `return` on early exits**: A `res.status(400).json(...)` without a `return` will attempt to send a second response after the function continues, causing "Cannot set headers after they are sent" errors

```ts
// CORRECT
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const result = Schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }
  const record = await prisma.resource.create({ ... })
  res.status(201).json(record)
})

// WRONG — missing return on validation failure
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const result = Schema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() }) // no return!
  }
  // execution continues here even if validation failed
  const record = await prisma.resource.create({ ... })
})
```

### Step 2: Prisma Query Quality

Check every Prisma query in `server/src/routes/` and `server/src/socket/`:

- **N+1 queries**: A query inside a loop or `.map()` — each iteration fires a separate DB roundtrip. Fix with a single query using `where: { id: { in: ids } }` or by moving the query out of the loop.
- **Missing `select` or over-fetching**: Queries that use `findMany` or `findUnique` without a `select` clause return all fields including sensitive ones (passwords via the Account model, email addresses). Use `select` to return only what the response needs.
- **Authorization not enforced at query level**: A route that requires ownership (e.g., only the listing seller can update status) must include the ownership check in the Prisma `where` clause — not just in a separate `if` statement that could be accidentally removed:

```ts
// CORRECT — atomic: if the record doesn't exist OR isn't owned by user, it returns null
const listing = await prisma.marketplaceListing.update({
  where: { id, sellerId: req.user!.id },
  data: { status },
})
if (!listing) return res.status(404).json({ error: "Not found" })

// RISKY — two separate steps; if the ownership check is removed, anyone can update
const listing = await prisma.marketplaceListing.findUnique({ where: { id } })
if (listing?.sellerId !== req.user!.id) return res.status(403).json(...)
await prisma.marketplaceListing.update({ where: { id }, data: { status } })
```

- **Missing pagination**: `findMany` on unbounded tables (posts, comments, listings, events) without `take`/`skip` or cursor pagination will return all rows as the database grows. Flag any `findMany` with no `take` limit.
- **Prisma errors not caught**: Queries that may throw `PrismaClientKnownRequestError` (e.g., unique constraint violations P2002, record not found P2025) without specific handling — these will fall through to the generic 500 handler.

### Step 3: Input Validation Completeness

Check every route for validation gaps:

- **POST/PATCH body validation**: Every mutation must validate its body with a Zod schema. A handler that reads `req.body.title` without going through `safeParse()` first is a gap.
- **Query parameter validation**: GET routes that read `req.query.category`, `req.query.sort`, `req.query.q`, etc. should validate and sanitize these values. Passing unsanitized query params directly into Prisma `where` clauses is dangerous.
- **URL param validation**: `req.params.id` is always a string. Handlers that use it as a Prisma `id` (which is a cuid/string — fine) or cast it to a number must validate it's the expected format.
- **Zod schema strictness**: Check that Zod schemas use `.trim()` on string fields, enforce `min`/`max` lengths where appropriate, and use `.enum()` for fields with a fixed set of values. Schemas that allow empty strings or overly long inputs are incomplete.
- **Missing enum validation**: Fields like `category`, `condition`, `gameType`, `status` should be validated with `z.enum([...])` against the same values used in Prisma's enums — not just `z.string()`.

### Step 4: Auth and Security

Check every route for auth and security issues:

- **Missing `requireAuth` on mutation routes**: Every POST, PATCH, and DELETE route that modifies data must use `requireAuth`. Check for routes that create, update, or delete records without auth middleware.
- **Authorization vs Authentication**: `requireAuth` only confirms the user is logged in — it does not confirm they have the right to access the specific record. Check that ownership/permission checks follow every auth check on sensitive operations (deleting a post, updating a listing status, editing a profile).
- **Sensitive data exposure**: Check `select` clauses on user-related queries. Never include `password`, raw session tokens, or email addresses in responses unless the endpoint is specifically for the authenticated user's own data.
- **Type assertion safety**: The pattern `(req.user as { username?: string }).username` indicates the `AuthRequest` type is incomplete. Check how many routes use unsafe `as` type assertions to access user fields that should be properly typed on `AuthRequest`.
- **CORS configuration**: The CORS config in `server/src/index.ts` should restrict `origin` to `CLIENT_URL` only — not a wildcard `*` — since this API uses cookie-based auth (cookies are not sent with wildcard CORS).
- **Rate limiting**: Check whether any rate limiting is applied to auth endpoints (`/api/auth/sign-in`, `/api/auth/sign-up`) and sensitive mutation endpoints. No rate limiting on auth endpoints enables brute-force attacks.

### Step 5: Socket.io Event Handler Correctness

Check `server/src/socket/`:

- **Input validation on socket events**: Client-emitted events (e.g., `post:join`, `post:leave`) that take data from the client should validate that data before using it. A malicious client could emit `post:join` with a crafted `postId` to join any room.
- **Auth on socket connection**: Verify that `server/src/socket/index.ts` validates the session on connection. Unauthenticated sockets should not be able to join user-specific rooms (`user:{userId}`).
- **Room join/leave balance**: For every `socket.join(room)` triggered by a client event, there must be a corresponding cleanup on `socket.disconnect` or explicit `socket.leave(room)` event. Rooms that are only joined but never left accumulate stale members.
- **Broadcast scope**: Check that `socket.to(room).emit(...)` broadcasts only to the correct room. A `socket.emit(...)` (no room) sends only to the sender, and `io.emit(...)` (no room) sends to ALL connected clients — verify the intended scope for each broadcast.
- **Race conditions on join/broadcast**: If a client joins a room and immediately triggers an action, there's a window where the join hasn't completed before the broadcast fires. Check for any patterns where a join event and a data-fetching event are sent simultaneously.

### Step 6: Error Handling

Check the error handling chain across all route files and `server/src/index.ts`:

- **Unhandled async errors**: In Express 5, async errors thrown in route handlers are automatically forwarded to the error middleware — but verify this is actually happening and that every async handler is in a `try/catch` or relies on Express 5's async propagation. Any unhandled rejection crashes the process.
- **Prisma-specific error handling**: The global error handler should catch `PrismaClientKnownRequestError` for at minimum:
  - `P2002` (unique constraint violation) → 409 Conflict
  - `P2025` (record not found on update/delete) → 404 Not Found
  Check that these are handled and that the error message doesn't leak internal Prisma error details to the client.
- **Generic error message leakage**: The catch-all 500 handler must not send `error.message` or stack traces to the client in production. It should return a generic `{ error: "Internal server error" }`.
- **Inconsistent 404 handling**: Some routes may return `null` from Prisma and respond with 200 (with a null body) instead of 404. Check that every `findUnique` / `findFirst` result is checked for null before responding.
- **Missing error boundary for third-party calls**: Any calls to external services (e.g., auth session validation via Better Auth) should be wrapped in try/catch — if the auth service throws, it should return 500 or 401, not crash the handler.

## Output Format

Write the results to `docs/code-review/pass-6-backend.md` using this format:

```markdown
# Pass 6 — Backend

Code quality review focusing on route handler structure, Prisma query quality, input validation, auth/security, Socket.io correctness, and error handling.

---

## 1. Route Handler Structure

**File:** `server/src/routes/path.ts` (line N)
**Issue:** [Structure | Prisma | Validation | Auth | Socket | Error] — Description
**Impact:** Critical | High | Medium | Low
**Fix:** How to fix

---

(same format for all findings)

## Summary

| Category | Critical | High | Medium | Low | Total |
| ... |

### Top Priority Fixes

1. ...
```

## Important Guidelines

- Be exhaustive — check EVERY route handler in `server/src/routes/` and EVERY socket handler in `server/src/socket/`.
- Security issues (missing auth, data exposure, unvalidated input reaching Prisma) are Critical regardless of current traffic levels.
- Use `file_path:line_number` references for every finding.
- For Prisma issues, show the actual query and the corrected version.
- For auth issues, explain the specific attack or misuse scenario that the gap enables.
- Do not flag Express 5 async error propagation as an issue if the handlers are already relying on it correctly — only flag if async errors are being silently swallowed.
- Distinguish between theoretical issues and realistic exploits given the current user base and deployment context.
