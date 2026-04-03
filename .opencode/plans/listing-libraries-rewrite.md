# Plan: Rewrite Listing Libraries Architecture Doc

## Summary

Rewrite `docs/listing-libraries-architecture.md` to reflect the new live-reference model (instead of static copy) and delete `docs/sharing-to-copy-migration.md` (obsolete).

## Key Decisions Made

1. **Keep individual sharing as-is** — live sync, overlays, changelog, the whole system stays untouched
2. **Libraries use live references** — not static copies. Viewers see source data directly with overlay customization
3. **Auto-subscribe model** — joining a library = getting all listings. No per-listing absorb. Viewers can hide what they don't want
4. **Full overlay customization** — description, media, video, slug, visibility (same as individual sharing)
5. **Reuse `listing_shares` table** — add `library_id` column. All existing infra (overlays, unified_listings, share media, changelog, public page resolution) works without changes
6. **Editors add existing listings** — listings are created by editors in their own account, then added to a library by reference
7. **Same listing in multiple libraries** — allowed
8. **Delete sharing-to-copy-migration.md** — the migration to static copy is cancelled

## Changes to Make

### File 1: `docs/listing-libraries-architecture.md` — Full Rewrite

Replace the entire file with the updated architecture. Key section changes:

#### Overview

- "absorb (copy)" → "auto-receive live references with overlay customization"
- Add: individual sharing remains separate and unchanged

#### Library-as-Org Model → Roles table

- Viewer description: "Browse library listings and absorb (copy) them" → "Auto-receives live references to all library listings; can customize and sell"

#### How It Works (updated flow)

1. Business user creates library
2. Invites collaborators by role
3. Editors add their existing listings to the library
4. Viewers **automatically receive** live references — no per-listing action
5. New listings auto-appear, removed listings auto-disappear
6. Viewers customize via overlays and can hide what they don't want

#### The "Absorb" Pattern → renamed to "How Libraries Work"

Complete rewrite:

- Auto-subscribe model explanation (why auto-subscribe fits PH market)
- Live reference comparison table (vs static copy — rejected)
- Overlay customization table (which fields customizable vs. always from source)
- "What happens when..." scenarios:
  - Editor adds listing to library → auto-create listing_shares for all viewers
  - Editor removes listing → auto-delete listing_shares + cleanup overlays
  - Viewer joins library → auto-create listing_shares for all library listings
  - Viewer leaves → auto-delete listing_shares + cleanup
  - Source listing edited → viewers see change immediately (existing changelog + notifications)
  - Source listing deleted → cascades through library_listings → listing_shares cleaned up

#### NEW section: "Relationship to Individual Sharing"

Comparison table showing both features coexist:

- Individual sharing: push, 1-to-1, `listing_shares` with `library_id = NULL`
- Libraries: pull/subscribe, 1-to-many, `listing_shares` with `library_id = <uuid>`
- Both use same infra: overlays, share media, unified_listings, changelog

#### Data Model (updated)

Three new tables (same as before):

- `libraries` — unchanged
- `library_members` — unchanged
- `library_listings` — unchanged

One change to existing table:

- `listing_shares` — add `library_id` column (nullable, FK → libraries)
  - NULL = individual share (existing behavior)
  - Set = library-managed share (auto-created/deleted)

**Remove**: `source_library_id` and `source_listing_id` columns on `listings` table (no longer needed — no copies)

Auto-creation logic documented (server action, not DB triggers for launch)

#### REMOVED sections:

- "Stale Data & Update Awareness" — not relevant with live references
- "Image Ownership" — no copies means no image ownership issues

#### Attribution & Source Tracking (simplified)

- Tracked via library membership + `listing_shares.library_id`
- No listing-level provenance columns needed
- Existing changelog system works for library shares

#### Industry Precedent (updated)

- Keep: role-based workspace examples (Google Drive, Notion, Figma, GitHub)
- Replace: "Fork/Copy-from-Source" → "Live Catalog / Syndication" (MLS, Spotify playlists, Slack channels, Google shared drives)

#### Updated Subscription Plans

- Remove "Absorb Limit" column from plan table (auto-subscribe, not per-listing absorb)
- Keep library join limits per tier
- Individual sharing: stays on all plans
- Libraries: viewers on any plan, creators on Business

#### Launch Scope (updated checklist)

MVP items:

- [ ] `libraries`, `library_members`, `library_listings` tables + RLS
- [ ] Add `library_id` column to `listing_shares`
- [ ] Create/delete library (Business plan)
- [ ] Invite members by email with role
- [ ] Editors add/remove existing listings in library
- [ ] Auto-create `listing_shares` when listing added (for all viewers)
- [ ] Auto-create `listing_shares` when viewer joins (for all listings)
- [ ] Auto-delete `listing_shares` when listing removed or viewer leaves
- [ ] Viewers see library listings via existing `unified_listings` view
- [ ] Overlays work (description, media, video, slug, visibility)
- [ ] Hide listings (`is_visible = false`)
- [ ] Existing changelog + notifications work for library shares
- [ ] Plan-based limits (library count, join count)
- [ ] Library management UI
- [ ] Library browse UI for viewers

Post-launch:

- [ ] Library analytics
- [ ] Library listing search/filter
- [ ] Bulk add listings to library

Remove from launch scope:

- ~~Remove bulk select + share~~ (already done)
- ~~`source_library_id` / `source_listing_id` tracking~~ (not needed)
- ~~Static copy absorb logic~~ (replaced by live reference)

### File 2: `docs/sharing-to-copy-migration.md` — Delete

This doc planned the migration from live sync to static copy for individual sharing. Since we're keeping individual sharing as-is and libraries use live references too, this doc is obsolete.

## Execution Steps

1. Rewrite `docs/listing-libraries-architecture.md` with the full updated content
2. Delete `docs/sharing-to-copy-migration.md`
