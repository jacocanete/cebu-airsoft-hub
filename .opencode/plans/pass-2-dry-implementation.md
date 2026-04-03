# Pass 2 — DRY Violations Implementation Plan

Comprehensive implementation plan for resolving all DRY violations identified in the code review audit.

## Execution Order

Tasks are organized into 10 batches. Each batch is independent of subsequent batches but may depend on earlier ones. Execute sequentially. Run `npm run lint:fix && npm run format` after each batch. Run `npm run test:run` after batches that touch shared utilities.

---

## Batch 1: Extract `validateInput` helper (37 occurrences, 14 files)

**Why first:** Highest occurrence count (37), purely mechanical, zero behavioral change. Establishes the pattern for subsequent batches.

### 1a. Add `validateInput` to `lib/actions/auth-helpers.ts`

Add this function below the existing `requireAgent()`:

```typescript
import { z } from "zod"

export function validateInput<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; error: string } {
	const result = schema.safeParse(data)
	if (!result.success) {
		return {
			success: false,
			error: result.error.issues[0]?.message || "Invalid input",
		}
	}
	return { success: true, data: result.data }
}
```

This standardizes on Variation A2 (optional chaining + fallback) which is the safest pattern.

### 1b. Replace all 37 occurrences

For each file, replace the 2–4 line `safeParse` + error extraction block with a single `validateInput` call. The pattern:

**Before (Variation A — 28 occurrences):**

```typescript
const parsed = someSchema.safeParse(data)
if (!parsed.success) {
	return { success: false, error: parsed.error.issues[0]?.message }
}
// use parsed.data
```

**Before (Variation B — 9 occurrences):**

```typescript
const parsed = someSchema.safeParse(data)
if (!parsed.success) {
	const firstError = parsed.error.issues[0]?.message || "Invalid input data"
	return { success: false, error: firstError }
}
// use parsed.data
```

**After (both):**

```typescript
const parsed = validateInput(someSchema, data)
if (!parsed.success) return parsed
// use parsed.data
```

**Files to modify (37 sites):**

| File                              | Lines                                                                                                   | Count |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- |
| `lib/actions/sharing.ts`          | 197, 835, 933, 1019, 1063, 1125, 1205, 1292, 1333, 1364, 1438, 1565, 1838, 1876, 1913, 1947, 2010, 2056 | 18    |
| `lib/actions/admin.ts`            | 155, 248, 287                                                                                           | 3     |
| `lib/actions/upgrade-requests.ts` | 105, 266, 311                                                                                           | 3     |
| `lib/actions/agent.ts`            | 965, 1014                                                                                               | 2     |
| `lib/actions/listings.ts`         | 818, 911                                                                                                | 2     |
| `lib/actions/leads.ts`            | 346, 404                                                                                                | 2     |
| `lib/actions/collections.ts`      | 194, 268                                                                                                | 2     |
| `lib/actions/reviews.ts`          | 186                                                                                                     | 1     |
| `lib/actions/payment-settings.ts` | 97                                                                                                      | 1     |
| `lib/actions/media.ts`            | 215                                                                                                     | 1     |
| `lib/actions/analytics.ts`        | 575                                                                                                     | 1     |
| `lib/actions/auth.ts`             | 25                                                                                                      | 1     |
| `lib/actions/pending-reviews.ts`  | 29                                                                                                      | 1     |
| `app/api/watermark/route.ts`      | 92                                                                                                      | 1     |

**Special cases:**

- `sharing.ts:1947` — returns `{ success: false, assigned: 0, error }`. After `validateInput`, do: `if (!parsed.success) return { success: false, assigned: 0, error: parsed.error }`
- `sharing.ts:2056` — returns `{ success: false, created: 0, errors: [...] }`. After `validateInput`, do: `if (!parsed.success) return { success: false, created: 0, errors: [parsed.error] }`

**Estimated savings:** ~70 lines removed. Standardizes error extraction.

**Verify:** `npm run test:run` (validation tests), `npm run lint:fix && npm run format`

---

## Batch 2: Migrate 5 inline clipboard sites to `useCopyToClipboard` hook

### 2a. `components/ui/contact-info-row.tsx`

This is a shared component — fixing it fixes all its consumers.

- Import `useCopyToClipboard` from `@/lib/hooks/use-copy-to-clipboard`
- Add `"use client"` directive if not already present
- Replace the manual `handleCopy`:

  ```typescript
  // Before
  const handleCopy = () => {
  	navigator.clipboard.writeText(value)
  	onCopy?.()
  }

  // After
  const { copied, copy } = useCopyToClipboard()
  const handleCopy = () => {
  	copy(value)
  	onCopy?.()
  }
  ```

- Update button text: `{copied ? "Copied!" : "Copy"}`

### 2b. `components/leads/ui/contact-details-card.tsx`

This file has 6 copy buttons for 3 fields (phone, email, facebook — each rendered twice for different viewports).

- Import `useCopyToClipboard`
- Replace the manual `handleCopy` function
- Since 3 different values are copied, track which field:

  ```typescript
  const { copy } = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(
  	() => () => {
  		if (timeoutRef.current) clearTimeout(timeoutRef.current)
  	},
  	[]
  )

  const handleCopy = (text: string, field: string) => {
  	copy(text)
  	setCopiedField(field)
  	if (timeoutRef.current) clearTimeout(timeoutRef.current)
  	timeoutRef.current = setTimeout(() => setCopiedField(null), 2000)
  }
  ```

- Update all 6 buttons: `{copiedField === "phone" ? "Copied!" : "Copy"}` etc.

### 2c. `components/leads/ui/lead-detail-mobile-modal.tsx`

- Import `useCopyToClipboard`
- Replace the 2 inline `navigator.clipboard.writeText()` calls
- Add `copied` feedback to both buttons
- Same multi-field pattern as 2b if phone and email copy are in the same component scope

### 2d. `components/leads/ui/quick-responses-card.tsx`

- Import `useCopyToClipboard`
- Replace manual clipboard code and remove the leaking `setTimeout`:

  ```typescript
  // Before
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)
  const copyTemplate = (template) => {
  	navigator.clipboard.writeText(message)
  	setCopiedTemplate(template.id)
  	setTimeout(() => setCopiedTemplate(null), 2000) // LEAK
  }

  // After
  const { copy } = useCopyToClipboard()
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(
  	() => () => {
  		if (timeoutRef.current) clearTimeout(timeoutRef.current)
  	},
  	[]
  )

  const copyTemplate = (template) => {
  	const message = template.message
  		.replace("{name}", leadName.split(" ")[0])
  		.replace("{listing}", listingTitle || "the property")
  	copy(message)
  	setCopiedTemplateId(template.id)
  	if (timeoutRef.current) clearTimeout(timeoutRef.current)
  	timeoutRef.current = setTimeout(() => setCopiedTemplateId(null), 2000)
  }
  ```

### 2e. `app/admin/settings/plan/upgrade-modal.tsx`

Best refactor: move `useCopyToClipboard` into the `CopyableField` sub-component itself, eliminating 3 levels of prop drilling.

- In `CopyableField`: add `const { copied, copy } = useCopyToClipboard()`
- Remove `copiedField` and `onCopy` props from `CopyableField`, `PaymentDetails`, and `StepSendPayment`
- Remove `copiedField` state and `handleCopy` from the parent `UpgradeModal`
- Each `CopyableField` now independently manages its own copy state

**Estimated savings:** ~50 lines. Eliminates 2 timer leaks, 3 zero-feedback instances, 5 missing fallbacks.

**Verify:** Manual testing of copy functionality in leads, media, and upgrade pages.

---

## Batch 3: Replace 5 native `confirm()` with `<ConfirmDialog>`

Each replacement follows the same pattern: add a state variable, render `<ConfirmDialog>`, move post-confirmation logic into `onConfirm`.

### 3a. `app/admin/listings/(list)/page.tsx` — 2 replacements

**Bulk delete (line 412):**

- Add: `const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)`
- Replace `if (!confirm(...)) return` with `setBulkDeleteOpen(true); return` (early return out of the handler)
- Add separate `handleBulkDeleteConfirm` async function with the post-confirm logic
- Render `<ConfirmDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen} title="Delete listings?" description={...} destructive onConfirm={handleBulkDeleteConfirm} />`

**Remove shared listing (line 502):**

- Add: `const [removeShareId, setRemoveShareId] = useState<string | null>(null)`
- Replace `if (confirm(...))` with `setRemoveShareId(shareId)`
- Add separate confirm handler
- Render `<ConfirmDialog open={!!removeShareId} onOpenChange={(o) => !o && setRemoveShareId(null)} title="Remove shared listing?" description="Remove this listing from your portfolio?" destructive confirmLabel="Remove" onConfirm={...} />`

### 3b. `app/admin/media/media-content.tsx` — line 140

- Add: `const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)`
- Replace `if (!confirm(...)) return` with dialog open
- Render `<ConfirmDialog open={bulkDeleteOpen} ... destructive loading={isDeleting} loadingLabel="Deleting..." />`

### 3c. `app/admin/collections/page.tsx` — line 99

- Add: `const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)`
- Replace `if (!confirm(...)) return` with `setDeleteTarget({ id, name })`
- Render `<ConfirmDialog open={!!deleteTarget} ... title="Delete collection?" description={...} destructive />`

### 3d. `components/media/media-detail-panel.tsx` — line 133

- Add: `const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)`
- Replace `if (!confirm(...)) return` with dialog open
- Render `<ConfirmDialog open={deleteConfirmOpen} ... destructive loading={isDeleting} />`

**Import `ConfirmDialog` from `@/components/ui/confirm-dialog` in all 4 files.**

**Estimated savings:** ~10 lines net (adds dialog JSX but removes inconsistent native dialogs). The real win is UX consistency and accessibility.

**Verify:** Manual testing of delete flows in listings, media, collections.

---

## Batch 4: Add `variant` prop to `<EmptyState>` + migrate 8 inline instances

### 4a. Update `components/ui/empty-state.tsx`

Add a `variant` prop for admin vs public page styling:

```typescript
interface EmptyStateProps {
	icon: LucideIcon
	title: string
	description?: string // Make optional (users-content conditionally shows it)
	action?: {
		label: string
		href?: string
		onClick?: () => void
		icon?: LucideIcon
	}
	variant?: "admin" | "public" // NEW: defaults to "admin"
	compact?: boolean // NEW: no card wrapper (for use inside existing cards/panels)
	className?: string
}
```

**Admin variant (default):** Current styling — `bg-white rounded-2xl border border-gray-100 p-12 shadow-sm`, `size-20 bg-gray-100 rounded-2xl` icon container, `text-gray-900` / `text-gray-500`.

**Public variant:** `bg-transparent p-0` (no card), `size-12 rounded-full bg-muted` icon container with `size-5` icon, `text-text-primary` / `text-text-muted`.

**Compact variant:** Strips the outer card wrapper (`bg-transparent border-0 shadow-none p-0`), keeps icon + text.

### 4b. Migrate admin-page inline empty states (3 files)

**`app/admin/media/media-content.tsx` (lines 324-332):**

```tsx
<EmptyState
	icon={ImageIcon}
	title="No media found"
	description="Upload some files to get started"
	action={{
		label: "Upload Files",
		onClick: () => fileInputRef.current?.click(),
		icon: Upload,
	}}
	compact
/>
```

**`app/admin/users/users-content.tsx` (lines 542-550):**

```tsx
<EmptyState
	icon={Users}
	title="No users found"
	description={hasActiveFilters ? "Try adjusting your filters" : undefined}
	className="flex-1"
/>
```

**`app/admin/shared/shared-listings-content.tsx` (lines 147-171 — two instances):**

```tsx
{
	/* First: no shared listings */
}
;<EmptyState
	icon={Users}
	title="No shared listings yet"
	description="When other agents share listings with you, they'll appear here. You can customize them with your own photos and description."
/>

{
	/* Second: no filter matches */
}
;<EmptyState
	icon={Search}
	title="No matches found"
	description="Try adjusting your search or filter to find what you're looking for."
/>
```

### 4c. Migrate public-page inline empty states (5 instances across 3 files)

**`app/agent/[slug]/agent-listings.tsx` (lines 558-572, 654-667):**

```tsx
{
	/* Mobile */
}
;<EmptyState
	icon={Building2}
	title="No listings found"
	description="Try adjusting your filters"
	action={
		hasActiveFilters
			? { label: "Clear filters", onClick: clearAllFilters }
			: undefined
	}
	variant="public"
	compact
	className="py-12"
/>

{
	/* Desktop */
}
;<EmptyState
	icon={Building2}
	title="No listings found"
	description="Try adjusting your filters"
	action={
		hasActiveFilters
			? { label: "Clear all filters", onClick: clearAllFilters, icon: X }
			: undefined
	}
	variant="public"
	className="py-16"
/>
```

**`app/agent/[slug]/collection-detail-panel.tsx` (lines 153-161):**

```tsx
<EmptyState
	icon={Search}
	title="No units found"
	description="This development has no available listings."
	variant="public"
	compact
/>
```

**`app/agent/[slug]/listings-panel.tsx` (lines 109-125):**

```tsx
<EmptyState
	icon={Search}
	title="No properties found"
	description="Try adjusting your filters"
	action={
		isFiltered ? { label: "Clear filters", onClick: onClearFilters } : undefined
	}
	variant="public"
	compact
/>
```

**Estimated savings:** ~100 lines of duplicated JSX. Consistent empty states across the app.

**Verify:** Visual check of all empty states in admin + agent pages. Run `npm run lint:fix && npm run format`.

---

## Batch 5: Extract `formatChangelogDate` + consolidate date utilities

### 5a. Add `formatChangelogDate` to `lib/utils/format.ts`

```typescript
export function formatChangelogDate(dateString: string): string {
	const days = daysAgo(dateString)
	if (days === 0) return "Today"
	if (days === 1) return "Yesterday"
	if (days < 7) return `${days} days ago`
	const year = new Date(dateString).getFullYear() !== new Date().getFullYear()
	return formatDate(dateString, "en-US", {
		month: "short",
		day: "numeric",
		...(year ? { year: "numeric" } : {}),
	})
}
```

### 5b. Replace the copy-pasted implementations

- `app/admin/listings/[id]/edit/edit-listing-client.tsx:723-734` — delete local function, import from `@/lib/utils/format`
- `app/admin/shared/[id]/shared-detail-content.tsx:93-104` — delete local function, import from `@/lib/utils/format`

### 5c. Replace inline `daysAgo` reimplementations

- `components/listing/listing-detail-content.tsx:189-192` — import `daysAgo` from `@/lib/utils/format`, replace `Math.floor((Date.now() - new Date(listing.publishedAt).getTime()) / 86_400_000)` with `daysAgo(listing.publishedAt)`
- `components/leads/ui/lead-row.tsx:26-28` — already imports `formatTimeAgo`, add `daysAgo` to the import; replace inline arithmetic with `daysAgo(lead.lastContacted) >= 7`
- `lib/utils/lead-utils.ts:23` — import `daysAgo` from `./format` (same directory), replace inline arithmetic. Note: `daysAgo` accepts `string`, but `lead-utils.ts` operates on a `Date` object. Either convert: `daysAgo(date.toISOString())` or update `daysAgo` signature to accept `string | Date`.

### 5d. Replace `getFurnishingLabel` duplicate

- `app/admin/shared/[id]/shared-detail-content.tsx:106-119` — delete local function, import `getFurnishingLabel` from `@/components/listings/constants`

### 5e. Create `lib/constants/time.ts` and move `MS_PER_DAY`

```typescript
// lib/constants/time.ts
export const MS_PER_HOUR = 3_600_000
export const MS_PER_DAY = 86_400_000
```

- Update `components/analytics/constants.ts` to import from `@/lib/constants/time` and re-export (or remove local definitions)
- Replace inline `86_400_000` / `86400000` in: `lib/utils/format.ts:97,137`, `lib/actions/listings.ts:1630`, `lib/actions/agent.ts:924` (`1000 * 60 * 60 * 24`)

**Estimated savings:** ~40 lines. Eliminates all date utility duplication.

**Verify:** `npm run test:run`, `npm run lint:fix && npm run format`

---

## Batch 6: Consolidate constants — staleTime, pageSize, brand colors

### 6a. Import `staleTime` from `query-config.ts` in non-hook files (12 sites)

Replace hardcoded `30 * 1000` / `30_000` with `STALE_TIME_DEFAULT` from `@/lib/query-config`:

| File                                                    | Lines    |
| ------------------------------------------------------- | -------- |
| `app/agent/[slug]/agent-listings.tsx`                   | 314      |
| `app/agent/[slug]/listings-map-view.tsx`                | 269      |
| `app/admin/listings/new/new-listing-content.tsx`        | 124      |
| `app/admin/shared/[id]/shared-detail-content.tsx`       | 137      |
| `app/admin/listings/(list)/page.tsx`                    | 118      |
| `app/admin/leads/leads-content.tsx`                     | 44       |
| `components/ui/bottom-nav.tsx`                          | 361, 366 |
| `components/settings/notification-preferences-form.tsx` | 75       |
| `components/settings/contacts-management.tsx`           | 119, 126 |
| `app/admin/settings/payment/payment-settings-form.tsx`  | 96       |

### 6b. Replace local constants in 2 hook files

- `lib/hooks/use-analytics.ts:13-14` — replace `ANALYTICS_STALE_TIME = 60 * 1000` with import of `STALE_TIME_MEDIUM` and `ANALYTICS_GC_TIME = 5 * 60 * 1000` with import of `GC_TIME_DEFAULT`
- `lib/hooks/use-notification-preferences.ts:37` — replace `5 * 60 * 1000` with import of `STALE_TIME_LONG`; add `GC_TIME_PREFERENCES = 10 * 60 * 1000` to `query-config.ts` (unique value, no existing constant)

### 6c. Extract `DEFAULT_PAGE_SIZE` to `lib/constants/pagination.ts`

```typescript
// lib/constants/pagination.ts
export const DEFAULT_PAGE_SIZE = 20
```

Replace in 7 files: `use-reviews-store.ts:61`, `use-notifications.ts:48`, `use-leads-store.ts:63`, `sharing.ts:2218`, `reviews.ts:23`, `notifications.ts:24`, `leads.ts:128`

### 6d. Rename `COLORS` in `components/analytics/constants.ts`

Rename `COLORS` to `CHART_COLORS` to avoid name collision with `lib/constants/colors.ts`:

```typescript
// Before
export const COLORS = { estateNavy: "#1e3a5f", ... }

// After
import { COLORS } from "@/lib/constants/colors"
export const CHART_COLORS = {
  estateNavy: COLORS.primary,
  emerald: "#10b981",
  amber: "#f59e0b",
  warmGold: COLORS.secondary,
} as const
```

Update all consumers of `COLORS` from this file to use `CHART_COLORS`.

### 6e. Import `COLORS.primary` / `COLORS.secondary` in JS/TS files

Replace raw `"#1e3a5f"` and `"#c9a962"` hex strings with imports from `lib/constants/colors.ts` where possible:

- `components/ui/logo.tsx:26,32,37` — import `COLORS`, use `COLORS.primary` and `COLORS.secondary`
- `lib/og/shared.ts:12-13` — replace local `NAVY`/`GOLD` with imports from `COLORS`
- `instrumentation-client.ts:30` — import `COLORS.primary`

Note: HTML email templates (`lib/email/templates/`, `supabase/templates/`, `supabase/functions/_shared/`) cannot import JS constants. Leave raw hex values there.

**Estimated savings:** ~30 lines + eliminates ~15 magic numbers. Primary win is preventing desync.

**Verify:** `npm run lint:fix && npm run format`

---

## Batch 7: Fix type definition duplication (T2, T3, T5, T7-T11)

### 7a. Replace inline `Furnishing` unions (5 locations)

Import `Furnishing` from `@/lib/validations/listings` and replace inline `"unfurnished" | "semi" | "fully"` unions:

- `app/admin/listings/new/new-listing-content.tsx:94`
- `lib/actions/sharing.ts:408, 567`
- `app/admin/shared/[id]/shared-detail-content.tsx:107` (already fixed in 5d via getFurnishingLabel import)
- `components/listing/listing-property-facts.tsx:8`

### 7b. Replace inline `PropertyType` unions (3 locations)

Import `PropertyType` from `@/lib/validations/listings`:

- `lib/actions/sharing.ts:392, 551, 1520` — replace `"Condo" | "House and Lot" | "Lot Only" | null` with `PropertyType | null`

### 7c. Replace inline `ListingSource` unions (3 locations)

Import `ListingSource` from `@/lib/validations/listings`:

- `app/admin/listings/new/new-listing-content.tsx:81`
- `lib/actions/sharing.ts:410, 569`

### 7d. Fix `CollectionFormData` overlap (T5)

In `app/admin/collections/collection-form-sections.tsx:13-25`:

```typescript
// Before: manually redeclared 11 fields
interface CollectionFormData { name: string; slug: string; ... }

// After: derive from the Zod-inferred type
import type { CollectionFormInput } from "@/lib/validations/collections"
type CollectionFormData = Omit<CollectionFormInput, "status" | "displayOrder">
```

### 7e. Remove redundant `LeadStatus` re-export (T7)

In `components/leads/types.ts:66`:

```typescript
// Before: derived type
export type LeadStatus = Lead["status"]

// After: re-export from canonical source
export type { LeadStatus } from "@/lib/validations/leads"
```

### 7f. Create `UpgradeRequestStatus` type (T10)

In `lib/validations/upgrade-requests.ts` (new file or add to existing):

```typescript
export const upgradeRequestStatusSchema = z.enum([
	"pending",
	"approved",
	"rejected",
])
export type UpgradeRequestStatus = z.infer<typeof upgradeRequestStatusSchema>
```

Import and use in `lib/actions/upgrade-requests.ts:42, 87`.

**Estimated savings:** ~20 lines. Prevents silent breakage when types expand.

**Verify:** `npm run lint:fix && npm run format`

---

## Batch 8: Extract `withBrandingGuard` wrapper in `lib/actions/agent.ts`

### 8a. Create the shared wrapper

Add to `lib/actions/agent.ts` (or a new `lib/actions/branding.ts` file):

```typescript
import type { SupabaseClient } from "@supabase/supabase-js"

type BrandingResult = { success: boolean; error?: string }

async function withBrandingGuard(
	updateFn: (params: {
		agent: { id: string; slug: string; subscription_tier: string | null }
		supabase: SupabaseClient
	}) => Promise<BrandingResult>
): Promise<BrandingResult> {
	const { user, agent, supabase } = await requireAgent()
	if (!user) return { success: false, error: "Not authenticated" }
	if (!agent) return { success: false, error: "Agent profile not found" }

	const { data: agentBranding } = await supabase
		.from("agents")
		.select("branding_enabled_at")
		.eq("id", agent.id)
		.single()

	if (
		!canUseBranding({
			subscriptionTier: (agent.subscription_tier ?? "free") as TierName,
			brandingEnabledAt: agentBranding?.branding_enabled_at ?? null,
		})
	) {
		return { success: false, error: "Custom branding requires a Business plan" }
	}

	const result = await updateFn({ agent, supabase })
	if (!result.success) return result

	revalidatePath("/admin", "layout")
	revalidatePath("/admin/settings/branding")
	revalidatePath(`/agent/${agent.slug}`)
	revalidatePath(`/listing/${agent.slug}`, "layout")
	revalidatePath(`/review/${agent.slug}`)

	return { success: true }
}
```

### 8b. Refactor `updateFavicon`, `updateBrandLogo`, `updateBrandName`

Each becomes ~10 lines instead of ~42:

```typescript
export async function updateFavicon(
	faviconUrl: string | null
): Promise<BrandingResult> {
	return withBrandingGuard(async ({ agent, supabase }) => {
		const { error } = await supabase
			.from("agents")
			.update({ favicon_url: faviconUrl })
			.eq("id", agent.id)
		if (error) {
			console.error("Error updating favicon:", error)
			return { success: false, error: error.message }
		}
		return { success: true }
	})
}
```

Same pattern for `updateBrandLogo` (column: `brand_logo_url`) and `updateBrandName` (column: `brand_name`, plus trim/length validation before the update).

### 8c. Refactor `saveBranding`

`saveBranding` is more complex — it has dual tier checks (subdomain routing + custom branding) and sets `branding_enabled_at`. Handle it differently:

- Extract common auth + agent fetch via `requireAgent()`
- Keep the dual-check logic inline since it's unique to this function
- But share the revalidation block by calling a `revalidateBranding(slug)` helper

### 8d. Extract `revalidateBranding(slug: string)`

```typescript
function revalidateBranding(slug: string) {
	revalidatePath("/admin", "layout")
	revalidatePath("/admin/settings")
	revalidatePath("/admin/settings/branding")
	revalidatePath(`/agent/${slug}`)
	revalidatePath(`/listing/${slug}`, "layout")
	revalidatePath(`/review/${slug}`)
}
```

Use in both `toggleSubdomainRouting` and `saveBranding` to replace their 5-6 line revalidation blocks.

**Estimated savings:** ~130 lines.

**Verify:** Manual testing of branding settings (toggle subdomain, upload favicon, upload logo, change brand name, save all). `npm run test:run`.

---

## Batch 9: Inline Zod schemas → `lib/validations/`

### 9a. Move `paymentSettingsSchema` to `lib/validations/payment-settings.ts`

Create `lib/validations/payment-settings.ts` with the schema currently inline in `lib/actions/payment-settings.ts:7-18`. Export the schema and inferred type. Update the action file to import.

### 9b. Move `watermarkRequestSchema` to `lib/validations/media.ts`

Move the schema from `app/api/watermark/route.ts:24-30` to a validations file. It already imports `watermarkPositionSchema` from `lib/validations/agent.ts` — keep that import.

### 9c. Move analytics schemas to `lib/validations/analytics.ts`

Create `lib/validations/analytics.ts` with:

- `offsetSchema` (from `analytics.ts:25`)
- `listingPathSchema` (from `analytics.ts:26-30`)
- `agentSlugSchema` — or reuse `slugSchema` from `lib/validations/agent.ts` if compatible

### 9d. Add brand name Zod validation

Create a schema for brand name to replace the manual `if (trimmed.length > 50)` checks in `agent.ts:1239-1241` and `agent.ts:1310-1312`:

```typescript
// Add to lib/validations/agent.ts
export const brandNameSchema = z
	.string()
	.trim()
	.max(50, "Brand name must be 50 characters or less")
	.nullable()
```

**Estimated savings:** ~20 lines. Proper separation of validation logic.

**Verify:** `npm run test:run`

---

## Batch 10: Data fetching pattern consolidation

### 10a. Extract `usePrefetchOnMount` hook

Create `lib/hooks/use-prefetch-on-mount.ts`:

```typescript
export function usePrefetchOnMount(
	buildQueries: (
		supabase: SupabaseClient
	) => Array<{ queryKey: QueryKey; queryFn: () => Promise<unknown> }>,
	deps: unknown[] = []
) {
	const queryClient = useQueryClient()
	const hasPrefetched = useRef(false)

	useEffect(() => {
		if (hasPrefetched.current) return
		hasPrefetched.current = true

		const run = async () => {
			const { createClient } = await import("@/lib/supabase/client")
			const supabase = createClient()
			const { data } = await supabase.auth.getSession()
			if (!data.session) return

			const queries = buildQueries(supabase)
			for (const q of queries) {
				queryClient.prefetchQuery({ queryKey: q.queryKey, queryFn: q.queryFn })
			}
		}
		run().catch(() => {})
	}, deps)
}
```

Replace the prefetch logic in:

- `lib/hooks/use-leads-store.ts:157-198`
- `lib/hooks/use-unified-listings.ts:124-157`

### 10b. Replace `formatRelativeDate` in `agent.ts`

The `formatRelativeDate` function at `agent.ts:920-934` is a full reimplementation with long-form labels. Add a `style: "long"` option to `formatTimeAgo` in `format.ts`:

```typescript
export function formatTimeAgo(
	dateString: string,
	options?: {
		showJustNow?: boolean
		localeFallback?: string
		fallbackYear?: boolean
		style?: "short" | "long" // NEW: "short" = "2d ago", "long" = "2 days ago"
	}
): string
```

Then replace the local function in `agent.ts` with:

```typescript
import { formatTimeAgo } from "@/lib/utils/format"
// ... where formatRelativeDate was called:
formatTimeAgo(dateString, { style: "long", showJustNow: true })
```

**Note:** The long-form also needs "Today"/"Yesterday" labels which the current `formatTimeAgo` doesn't have. Either add them as part of the `style: "long"` variant, or use `formatChangelogDate` (from Batch 5) which already has them.

### 10c. Document but defer: optimistic mutation factory

The 18 optimistic mutations across 5 hooks follow the same cancel → snapshot → update → rollback → invalidate pattern. A generic `createOptimisticMutation` factory would save significant code but:

- Each mutation has slightly different cache update logic
- The type signatures vary (infinite queries vs simple queries)
- Risk of over-abstraction is high

**Recommendation:** Defer to a separate PR. Document the pattern in `CLAUDE.md` for new mutations to follow, but don't extract a factory now.

### 10d. Document but defer: count queries

The 3 `getXxxCounts` functions + dashboard duplicate should use `{ count: "exact", head: true }` per status instead of fetching all rows. This is a performance improvement, not purely DRY. Defer to a performance-focused PR.

**Estimated savings:** ~60 lines from prefetch hook + `formatRelativeDate` replacement.

**Verify:** `npm run test:run`, manual testing of leads/listings prefetching.

---

## Post-Implementation

After all 10 batches:

1. `npm run lint:fix && npm run format`
2. `npm run test:run`
3. Manual smoke test: leads page, listings page, collections page, media page, branding settings, analytics dashboard, agent public page
4. Update `docs/code-review/pass-2-dry-violations.md` with the fresh audit report (currently blocked by Plan Mode)

## Summary

| Batch     | Description                        | Files Modified |  Lines Saved   |  Risk  |
| --------- | ---------------------------------- | :------------: | :------------: | :----: |
| 1         | `validateInput` helper             |       15       |      ~70       |  Low   |
| 2         | Clipboard hook migration           |       5        |      ~50       |  Low   |
| 3         | `confirm()` → `<ConfirmDialog>`    |       4        |   ~10 (net)    |  Low   |
| 4         | `<EmptyState>` variant + migration |     5 + 1      |      ~100      | Medium |
| 5         | Date utility consolidation         |       7        |      ~40       |  Low   |
| 6         | Constants consolidation            |       18       |      ~30       |  Low   |
| 7         | Type definition cleanup            |       8        |      ~20       |  Low   |
| 8         | `withBrandingGuard` extraction     |       1        |      ~130      | Medium |
| 9         | Inline schemas → validations       |       4        |      ~20       |  Low   |
| 10        | Data fetching consolidation        |       4        |      ~60       | Medium |
| **Total** |                                    | **~60 files**  | **~530 lines** |        |
