import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { Plus, Star, ShoppingBag } from "lucide-react";
import { MARKETPLACE_CATEGORIES, CONDITIONS } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { ListingCard } from "@/components/marketplace/listing-card";
import { FilterGroup } from "@/components/shared/filter-group";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { useListingsInfinite } from "@/hooks/use-marketplace";

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

function EmptyMarketplaceState({ category }: { category: string }) {
  const message =
    category === "All"
      ? "No listings yet — be the first to sell something."
      : `No listings in ${category} yet.`;

  return (
    <div className="flex flex-col items-center justify-center border border-border bg-card py-16 px-4 text-center">
      <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mb-4" />
      <p className="label-military text-muted-foreground mb-4">{message}</p>
      <Link
        to="/marketplace/new"
        className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Plus className="h-3.5 w-3.5" />
        Create a listing
      </Link>
    </div>
  );
}

function MarketplacePage() {
  const { category, condition } = Route.useSearch();
  const navigate = Route.useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useListingsInfinite({
    category: category === "All" ? undefined : category,
    condition: condition === "All" ? undefined : condition,
  });

  const allItems = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const { featuredListings, regularListings } = useMemo(() => {
    const featured: typeof allItems = [];
    const regular: typeof allItems = [];
    for (const l of allItems) (l.featured ? featured : regular).push(l);
    return { featuredListings: featured, regularListings: regular };
  }, [allItems]);

  // Intersection observer — triggers fetchNextPage when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleCategoryChange(next: string) {
    navigate({ search: (prev) => ({ ...prev, category: next }) });
  }

  function handleConditionChange(next: string) {
    navigate({ search: (prev) => ({ ...prev, condition: next }) });
  }

  const isEmpty = !isLoading && allItems.length === 0;

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
          ) : isEmpty ? (
            <EmptyMarketplaceState category={category} />
          ) : (
            <>
              {/* Featured listings section */}
              {featuredListings.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                    <span className="label-military text-primary">Featured</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </div>
              )}

              {/* Divider between featured and regular */}
              {featuredListings.length > 0 && regularListings.length > 0 && (
                <div className="flex items-center gap-3 py-2 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="label-military text-muted-foreground/40">listings</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Regular paginated listings */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {regularListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-px" />

              {isFetchingNextPage && (
                <div className="mt-3">
                  <SkeletonList count={3} height="h-48" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" />
                </div>
              )}

              {!hasNextPage && regularListings.length > 0 && (
                <p className="mt-6 text-center label-military text-muted-foreground/40">
                  End of listings — reload to see new items
                </p>
              )}
            </>
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
            <p className="sidebar-label mb-2">Selling gear?</p>
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

          <div className="border border-border bg-card p-4">
            <div className="flex items-start gap-2">
              <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0 mt-px" />
              <p className="sidebar-label">Featured slots</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Feature your listing to pin it at the top of the marketplace.
              Up to 6 listings can be featured at any time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
