import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { MARKETPLACE_CATEGORIES, CONDITIONS } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { ListingCard } from "@/components/marketplace/listing-card";
import { FilterGroup } from "@/components/shared/filter-group";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { useListings } from "@/hooks/use-marketplace";

const DEFAULT_MARKETPLACE_SEARCH = {
  category: "All",
  condition: "All",
};

export const Route = createFileRoute("/_main/marketplace/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : "All",
    condition: typeof search.condition === "string" ? search.condition : "All",
  }),
  search: {
    middlewares: [stripSearchParams(DEFAULT_MARKETPLACE_SEARCH)],
  },
  head: () => ({
    meta: [{ title: "Marketplace | Cebu Airsoft Hub" }],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const { category, condition } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: listings = [], isLoading } = useListings({
    category: category === "All" ? undefined : category,
    condition: condition === "All" ? undefined : condition,
  });

  function handleCategoryChange(next: string) {
    navigate({ search: (prev) => ({ ...prev, category: next }) });
  }

  function handleConditionChange(next: string) {
    navigate({ search: (prev) => ({ ...prev, condition: next }) });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          eyebrow="Buy &amp; Sell"
          title="Marketplace"
          description="Trade airsoft gear with fellow Cebu players."
        />
        <Link
          to="/marketplace/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="h-3.5 w-3.5" />
          Sell
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">

          {isLoading ? (
            <SkeletonList count={6} height="h-48" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3">
          <FilterGroup
            label="Categories"
            options={MARKETPLACE_CATEGORIES}
            value={category}
            onChange={handleCategoryChange}
          />
          <FilterGroup
            label="Condition"
            options={CONDITIONS}
            value={condition}
            onChange={handleConditionChange}
          />

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-2">Selling gear?</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              List your guns, gear, and accessories for the Cebu airsoft
              community.
            </p>
            <Link
              to="/marketplace/new"
              className="block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors"
            >
              Create a listing
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
