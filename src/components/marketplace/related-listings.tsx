import { useRelatedListings } from "@/hooks/use-marketplace";
import { ListingCard } from "@/components/marketplace/listing-card";

interface RelatedListingsProps {
  listingId: string;
  category: string;
}

export function RelatedListings({ listingId, category }: RelatedListingsProps) {
  const { data: listings, isLoading } = useRelatedListings(listingId);

  if (isLoading || !listings || listings.length === 0) return null;

  return (
    <div>
      <div className="mb-4">
        <p className="label-military text-primary mb-0.5">More like this</p>
        <h2 className="text-base font-bold uppercase tracking-tight text-foreground">
          More in {category}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
