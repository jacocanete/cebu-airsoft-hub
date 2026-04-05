import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/marketplace/new")({
  head: () => ({ meta: [{ title: "Sell an Item | Detachment Reaper" }] }),
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewListingPage,
});

function NewListingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="border-l-2 border-primary pl-3 mb-8">
        <p className="label-military text-primary">Marketplace</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Sell an Item</h1>
      </div>
      <div className="border border-border bg-card p-12 text-center">
        <p className="label-military text-muted-foreground">Create listing coming soon.</p>
      </div>
    </div>
  );
}
