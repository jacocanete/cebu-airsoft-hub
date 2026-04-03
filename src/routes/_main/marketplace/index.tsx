import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { MARKETPLACE_CATEGORIES, CONDITIONS } from "@/lib/constants";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/page-header";
import { ListingCard } from "@/components/marketplace/listing-card";

export const Route = createFileRoute("/_main/marketplace/")({
  head: () => ({
    meta: [{ title: "Marketplace | Detachment Reaper" }],
  }),
  component: MarketplacePage,
});
function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Buy &amp; Sell" title="Marketplace" description="Trade airsoft gear with fellow Cebu players." />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search listings..."
                className="h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
              >
                <Plus className="h-3.5 w-3.5" />
                Sell
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3">
          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Categories</p>
            <div className="flex flex-col gap-0.5">
              {["All", ...MARKETPLACE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  className={`rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                    cat === "All"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Condition</p>
            <div className="flex flex-col gap-0.5">
              {["All", ...CONDITIONS].map((cond) => (
                <button
                  key={cond}
                  className={`rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                    cond === "All"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

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
