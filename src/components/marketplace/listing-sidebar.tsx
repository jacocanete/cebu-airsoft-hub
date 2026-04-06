import { Link } from "@tanstack/react-router";
import { Tag, Shield, Calendar, Star, Package } from "lucide-react";
import {
  CONDITION_COLORS,
  LISTING_STATUS_COLORS,
  FALLBACK_BADGE,
} from "@/lib/constants";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessageButton } from "@/components/shared/MessageButton";
import { useUpdateListingStatus } from "@/hooks/use-marketplace";
import type { MarketplaceListingDetail } from "@/types";

interface ListingSidebarProps {
  listing: MarketplaceListingDetail;
  isOwner: boolean;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= rounded;
        const half = !filled && i + 0.5 < rounded;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled
                ? "fill-amber-400 text-amber-400"
                : half
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}

function StatusSelect({
  listingId,
  currentStatus,
}: {
  listingId: string;
  currentStatus: string;
}) {
  const { mutate, isPending } = useUpdateListingStatus();

  // Map display status back to API enum
  const toApiStatus = (s: string) =>
    s.toUpperCase().replace(" ", "_") as "AVAILABLE" | "RESERVED" | "SOLD";

  // Normalize incoming status from API (may be "Available", "AVAILABLE", etc.)
  const normalizedCurrent = currentStatus.toUpperCase().replace(" ", "_");

  return (
    <select
      value={normalizedCurrent}
      disabled={isPending}
      onChange={(e) =>
        mutate({ id: listingId, status: e.target.value as "AVAILABLE" | "RESERVED" | "SOLD" })
      }
      aria-label="Update listing status"
      className="w-full rounded border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-widest text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 cursor-pointer"
    >
      <option value="AVAILABLE">Available</option>
      <option value="RESERVED">Reserved</option>
      <option value="SOLD">Sold</option>
    </select>
  );
}

export function ListingSidebar({ listing, isOwner }: ListingSidebarProps) {
  const { seller } = listing;

  const displayStatus =
    typeof listing.status === "string"
      ? listing.status.charAt(0).toUpperCase() +
        listing.status.slice(1).toLowerCase()
      : listing.status;

  const isAvailable =
    listing.status.toString().toUpperCase() === "AVAILABLE" ||
    listing.status === "Available";

  const memberSince = new Date(seller.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Price & Action card */}
      <div className="border border-border bg-card p-4">
        <p className="label-military text-primary mb-2">Price</p>
        <p className="text-3xl font-black text-primary mb-3">
          ₱{Number(listing.price).toLocaleString()}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LISTING_STATUS_COLORS[displayStatus] ?? FALLBACK_BADGE}`}
          >
            {displayStatus}
          </span>
        </div>

        {isOwner ? (
          <div>
            <p className="label-military text-muted-foreground mb-1.5">
              Update status
            </p>
            <StatusSelect
              listingId={listing.id}
              currentStatus={listing.status.toString()}
            />
          </div>
        ) : isAvailable ? (
          <MessageButton
            recipientId={seller.id}
            recipientName={seller.name}
            contextType="LISTING"
            contextId={listing.id}
            defaultMessage={`Hi, I'm interested in your "${listing.title}". Is it still available?`}
            className="w-full justify-center"
          />
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            This item is no longer available
          </p>
        )}
      </div>

      {/* Seller / Operator card */}
      <div className="border border-border bg-card p-4">
        <p className="label-military text-primary mb-3">Operator</p>

        <div className="flex items-start gap-3">
          <UserAvatar
            name={seller.name}
            username={seller.username}
            size="lg"
            linkToProfile
          />
          <div className="min-w-0 flex-1">
            <Link
              to="/profile/$username"
              params={{ username: seller.username }}
              className="block text-sm font-bold text-foreground truncate hover:text-primary transition-colors"
            >
              {seller.name}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              @{seller.username}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Since {memberSince}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            {seller.reviewCount > 0 ? (
              <>
                <StarRating value={seller.averageRating} />
                <span className="text-xs text-muted-foreground">
                  ({seller.reviewCount})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            {seller._count.listings} listing{seller._count.listings !== 1 ? "s" : ""}
          </div>
        </div>

        <Link
          to="/profile/$username"
          params={{ username: seller.username }}
          className="mt-3 block w-full rounded border border-border px-3 py-1.5 text-center label-military hover:bg-accent transition-colors"
        >
          View Profile
        </Link>
      </div>

      {/* Specs card */}
      <div className="border border-border bg-card p-4">
        <p className="label-military text-primary mb-3">Specs</p>

        <dl className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-xs">
            <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
            <dt className="text-muted-foreground shrink-0">Category</dt>
            <dd className="ml-auto font-medium text-foreground text-right">
              {listing.category}
            </dd>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <dt className="text-muted-foreground shrink-0">Condition</dt>
            <dd className="ml-auto">
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CONDITION_COLORS[listing.condition] ?? FALLBACK_BADGE}`}
              >
                {listing.condition}
              </span>
            </dd>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <dt className="text-muted-foreground shrink-0">Listed</dt>
            <dd className="ml-auto font-medium text-foreground text-right">
              {new Date(listing.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
