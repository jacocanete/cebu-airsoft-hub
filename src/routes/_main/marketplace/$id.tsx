import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/marketplace/$id")({
  head: () => ({ meta: [{ title: "Listing | Detachment Reaper" }] }),
  component: ListingDetailPage,
});

function ListingDetailPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="border border-border bg-card p-12 text-center">
        <p className="label-military text-muted-foreground">Listing detail coming soon.</p>
      </div>
    </div>
  );
}
