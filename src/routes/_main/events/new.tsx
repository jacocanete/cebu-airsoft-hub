import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";

export const Route = createFileRoute("/_main/events/new")({
  head: () => ({ meta: [{ title: "Host a Game | Cebu Airsoft Hub" }] }),
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewEventPage,
});

function NewEventPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Operations" title="Host a Game" className="mb-8" />
      <div className="border border-border bg-card p-12 text-center">
        <p className="label-military text-muted-foreground">Create event coming soon.</p>
      </div>
    </div>
  );
}
