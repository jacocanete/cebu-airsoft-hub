import { Link } from "@tanstack/react-router";
import { CONDITION_COLORS, LISTING_STATUS_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import type { MarketplaceListing } from "@/types";

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <Link
      to="/marketplace/$id"
      params={{ id: listing.id }}
      className="group flex flex-col border border-border bg-card transition-colors hover:border-primary/30 hover:bg-accent"
    >
      <div className="aspect-[4/3] w-full bg-muted/30 flex items-center justify-center border-b border-border overflow-hidden">
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="label-military text-muted-foreground/30">No image</span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CONDITION_COLORS[listing.condition] ?? FALLBACK_BADGE}`}
          >
            {listing.condition}
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LISTING_STATUS_COLORS[listing.status] ?? FALLBACK_BADGE}`}
          >
            {listing.status}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {listing.title}
        </h3>

        <p className="text-lg font-black text-primary">
          ₱{listing.price.toLocaleString()}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <Link
            to="/profile/$username"
            params={{ username: listing.seller.username }}
            className="hover:text-primary transition-colors"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {listing.seller.name}
          </Link>
          <span>{listing.createdAt}</span>
        </div>
      </div>
    </Link>
  );
}
