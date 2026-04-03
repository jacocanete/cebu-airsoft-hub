# Listing Libraries — Implementation Plan

## Decisions

| Decision                 | Choice                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Library listing limit    | Combined single limit (library shares count toward main listing limit)   |
| RLS for library shares   | Admin client in server actions (bypass RLS, enforce auth in code)        |
| Duplicate share handling | Allow both rows, unified_listings deduplicates (prefer individual share) |
| Library creation gating  | Business plan only (up to 5 libraries)                                   |
| Invitation method        | User search only (reuse searchAgents)                                    |
| Navigation               | New top-level "Libraries" sidebar entry                                  |

---

## Phase 1: Database Migration

**File:** `supabase/migrations/20260324000000_create_libraries.sql`

### New Tables

**`libraries`:**

- id (uuid PK), owner_id (FK auth.users CASCADE), name (text NOT NULL), description (text), created_at, updated_at
- Index on owner_id
- updated_at trigger
- RLS: owner ALL, members SELECT (via library_members subquery)

**`library_members`:**

- id (uuid PK), library_id (FK libraries CASCADE), user_id (FK auth.users CASCADE), role (CHECK: owner/editor/viewer), invited_by (FK auth.users CASCADE), joined_at
- UNIQUE(library_id, user_id)
- Indexes on library_id, user_id
- RLS: owner ALL (via libraries.owner_id subquery), members SELECT (via self-join on library_id)

**`library_listings`:**

- id (uuid PK), library_id (FK libraries CASCADE), listing_id (FK listings CASCADE), added_by (FK auth.users CASCADE), added_at
- UNIQUE(library_id, listing_id)
- Indexes on library_id, listing_id
- RLS: owner+editors ALL (via library_members role check), members SELECT

### Alter listing_shares

1. Add `library_id UUID REFERENCES libraries(id) ON DELETE CASCADE`
2. Index on library_id WHERE NOT NULL
3. Drop `listing_shares_unique` constraint
4. Add partial unique indexes:
   - `listing_shares_individual_unique ON (listing_id, shared_with_user_id) WHERE library_id IS NULL`
   - `listing_shares_library_unique ON (listing_id, shared_with_user_id, library_id) WHERE library_id IS NOT NULL`

### Recreate Views

**unified_listings:** Add `library_id` column. Shared half uses `DISTINCT ON (listing_id, shared_with_user_id) ORDER BY library_id NULLS FIRST` to deduplicate (individual share wins over library share).

**public_portfolio_listings:** Same dedup pattern in shared half.

---

## Phase 2: Types

**New file:** `lib/types/library.ts`

```typescript
// Row types (snake_case)
LibraryRow { id, owner_id, name, description, created_at, updated_at }
LibraryMemberRow { id, library_id, user_id, role, invited_by, joined_at }
LibraryListingRow { id, library_id, listing_id, added_by, added_at }

// Client types (camelCase)
Library { id, ownerId, name, description, createdAt, updatedAt }
LibraryMember { id, libraryId, userId, role, invitedBy, joinedAt }
LibraryListing { id, libraryId, listingId, addedBy, addedAt }

// Extended types
LibraryRole = "owner" | "editor" | "viewer"
LibraryMemberWithDetails extends LibraryMember { name, email, avatarUrl, agentSlug }
LibraryWithCounts extends Library { memberCount, listingCount, myRole }
LibraryDetail extends Library { members: LibraryMemberWithDetails[], listingCount, myRole }

// Transforms
transformLibrary(), transformLibraryMember(), transformLibraryListing()
```

**Modify:** `lib/types/sharing.ts` — add `library_id`/`libraryId` to row/client types
**Modify:** `lib/types/listing.ts` — add `library_id`/`libraryId` to unified types

---

## Phase 3: Validations

**New file:** `lib/validations/libraries.ts`

- `libraryRoleSchema` — z.enum(["owner", "editor", "viewer"])
- `createLibrarySchema` — name (1-100), description (optional, max 500)
- `updateLibrarySchema` — partial of create + libraryId
- `deleteLibrarySchema` — libraryId
- `inviteMemberSchema` — libraryId, userId, role (editor/viewer only)
- `removeMemberSchema` — libraryId, userId
- `updateMemberRoleSchema` — libraryId, userId, role
- `addListingToLibrarySchema` — libraryId, listingId
- `removeListingFromLibrarySchema` — libraryId, listingId

---

## Phase 4: Subscription Guard

**Modify:** `lib/subscriptions/guards.ts`

Add `canCreateLibrary()`:

- requireAuth
- requireTier("business")
- Count existing libraries owned by user (admin client)
- Allow if count < 5

---

## Phase 5: Server Actions

**New file:** `lib/actions/libraries.ts`

### CRUD

- `createLibrary(input)` — canCreateLibrary guard, insert library, insert owner as library_member
- `updateLibrary(id, input)` — owner only
- `deleteLibrary(id)` — owner only (CASCADE handles cleanup)
- `getLibraries()` — all libraries user is a member of, with counts
- `getLibrary(id)` — detail with members (joined with agents for names/avatars)
- `getLibraryListings(id, page, limit)` — paginated listings in library

### Member Management

- `inviteMember(input)` — owner only, insert library_member, if viewer: batch-create listing_shares
- `removeMember(input)` — owner only, delete member, if viewer: delete listing_shares WHERE library_id
- `updateMemberRole(input)` — owner only, update role; if changed to viewer: create shares; if changed from viewer: delete library shares

### Listing Management

- `addListingToLibrary(input)` — owner/editor, must own listing, insert library_listing, batch-create listing_shares for all viewers
- `removeListingFromLibrary(input)` — owner/editor, delete library_listing, delete listing_shares WHERE library_id AND listing_id

### Batch Slug Generation

Pre-fetch all existing slugs for the recipient in one query, generate unique slugs in memory (no per-slug DB roundtrip). Pattern:

```typescript
const slugSet = new Set([...existingSlugs, ...ownedSlugs])
for (const listing of listings) {
	let slug = generateBaseSlug(listing)
	let suffix = 1
	while (slugSet.has(slug)) {
		suffix++
		slug = `${base}-${suffix}`
	}
	slugSet.add(slug)
}
```

### Listing Limit Handling

Before batch-creating shares for a viewer, check checkListingLimit(viewerId). If at limit, skip that viewer (don't block the operation). Return a warning in the response.

---

## Phase 6: Modify Existing Share Infrastructure

**Modify:** `lib/actions/sharing.ts`

- `removeListingShare` — if library_id IS NOT NULL and user is the recipient, reject with "Library shares cannot be removed. Use visibility toggle or leave the library."

**Modify:** `lib/types/sharing.ts`

- Add library_id/libraryId to ListingShareRow/ListingShare

**Modify:** `lib/types/listing.ts`

- Add library_id/libraryId to UnifiedListingRow/UnifiedListing + transform

**Modify:** `lib/validations/index.ts`

- Export new library validations

---

## Phase 7: Hooks

**New file:** `lib/hooks/use-libraries.ts`

Query keys: `["libraries"]`, `["library", id]`, `["library", id, "listings"]`

- `useLibraries()` — list with filters (my/joined)
- `useLibrary(id)` — single library detail
- `useLibraryListings(id)` — paginated
- `useLibraryMutations()` — create, update, delete, invite, remove member, add/remove listing

---

## Phase 8: UI Components

**New directory:** `components/libraries/`

Following collections pattern:

- `index.ts` — barrel
- `libraries-filters.tsx` — search + tabs (My Libraries / Joined)
- `libraries-table.tsx` — desktop: Name, Role, Members, Listings, Created, Actions
- `libraries-card.tsx` — mobile cards
- `libraries-skeleton.tsx`
- `libraries-empty.tsx`
- `library-members-list.tsx` — member rows with role badges, remove action
- `invite-member-modal.tsx` — Dialog with agent search (pattern from share-modal)
- `add-listing-modal.tsx` — Dialog to select from user's owned listings
- `library-listing-card.tsx` — listing card in library context

---

## Phase 9: Pages

- `app/admin/libraries/page.tsx` — list page (Suspense + content component)
- `app/admin/libraries/[id]/page.tsx` — detail page (members + listings, mobile/desktop layouts)

---

## Phase 10: Sidebar Navigation

**Modify:** `components/ui/bottom-nav.tsx`

- Add `{ icon: Library, label: "Libraries", href: "/admin/libraries" }` to sidebarNavItems after Collections
- Consider adding to mobileNavItems (currently 5 items — evaluate if 6 fits)

---

## Implementation Order

| #   | Task                                        | Est. Complexity |
| --- | ------------------------------------------- | --------------- |
| 1   | Database migration                          | Medium          |
| 2   | Types (lib/types/library.ts)                | Low             |
| 3   | Validations (lib/validations/libraries.ts)  | Low             |
| 4   | Subscription guard (canCreateLibrary)       | Low             |
| 5   | Server actions (lib/actions/libraries.ts)   | High            |
| 6   | Modify listing_shares types + share actions | Low             |
| 7   | Hooks (lib/hooks/use-libraries.ts)          | Medium          |
| 8   | UI components (components/libraries/)       | Medium          |
| 9   | Pages (app/admin/libraries/)                | Medium          |
| 10  | Sidebar navigation update                   | Low             |
| 11  | Integration testing                         | Medium          |
