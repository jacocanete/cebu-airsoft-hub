import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";

export const Route = createFileRoute("/_main/groups/new")({
  head: () => ({ meta: [{ title: "Register a Group | Cebu Airsoft Hub" }] }),
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewGroupPage,
});

function NewGroupPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Units" title="Register a Group" className="mb-8" />
      <div className="border border-border bg-card p-12 text-center">
        <p className="label-military text-muted-foreground">Create group coming soon.</p>
      </div>
    </div>
  );
}
