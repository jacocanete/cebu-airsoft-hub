import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Flag } from "lucide-react";
import { CONDITION_COLORS, LISTING_STATUS_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { Badge } from "@/components/shared/badge";
import { PROSE_CLASSES } from "@/lib/prose";
import { useListingDetail, listingDetailQueryOptions } from "@/hooks/use-marketplace";
import { useCurrentUser } from "@/hooks/use-auth";
import { queryClient } from "@/lib/query-client";
import { BackLink } from "@/components/shared/back-link";
import { SkeletonCard } from "@/components/shared/skeleton-list";
import { ShareButton } from "@/components/shared/share-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { ListingImageGallery } from "@/components/marketplace/listing-image-gallery";
import { ListingSidebar } from "@/components/marketplace/listing-sidebar";
import { SellerReviewSection } from "@/components/marketplace/seller-review-section";
import { RelatedListings } from "@/components/marketplace/related-listings";

export const Route = createFileRoute("/_main/marketplace/$id")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(listingDetailQueryOptions(params.id)),
  pendingComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SkeletonCard height="h-[600px]" />
    </div>
  ),
  head: () => ({ meta: [{ title: "Listing | Cebu Airsoft Hub" }] }),
  component: ListingDetailPage,
});

function ListingDetailPage() {
  const { id } = Route.useParams();
  const { data: session } = useCurrentUser();
  const { data: listing } = useListingDetail(id);
  const [reportOpen, setReportOpen] = useState(false);

  const isOwner = session?.user?.id === listing.seller.id;

  // Normalize status for display — API may return "AVAILABLE" or "Available"
  const rawStatus = listing.status.toString();
  const displayStatus =
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BackLink to="/marketplace" label="Back to Marketplace" />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Main content column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <ListingImageGallery images={listing.images} title={listing.title} />

          {/* Header card */}
          <div className="border border-border bg-card p-6">
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge size="xs" colorClass={CONDITION_COLORS[listing.condition] ?? FALLBACK_BADGE}>
                {listing.condition}
              </Badge>
              <Badge size="xs" colorClass={LISTING_STATUS_COLORS[displayStatus] ?? FALLBACK_BADGE}>
                {displayStatus}
              </Badge>
              <Badge size="xs" colorClass="border border-border text-muted-foreground">
                {listing.category}
              </Badge>
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-3">
              {listing.title}
            </h1>

            {/* Price — visible on mobile; hidden on lg where sidebar takes over */}
            <p className="text-3xl font-black text-primary mb-3 lg:hidden">
              ₱{Number(listing.price).toLocaleString()}
            </p>

            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              Listed{" "}
              {new Date(listing.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Description card */}
          <div className="border border-border bg-card p-6">
            <p className="sidebar-label mb-4">Intel Report</p>
            <div className={PROSE_CLASSES}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {listing.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3">
            <ShareButton label="Share" />
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          </div>

          <ReportDialog
            open={reportOpen}
            onOpenChange={setReportOpen}
            targetType="LISTING"
            targetId={listing.id}
          />

          {/* Seller reviews */}
          <SellerReviewSection
            listingId={id}
            sellerId={listing.seller.id}
            sellerName={listing.seller.name}
          />

          {/* Related listings */}
          <RelatedListings listingId={id} category={listing.category} />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <ListingSidebar listing={listing} isOwner={isOwner} />
        </aside>
      </div>
    </div>
  );
}
