import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/groups/$slug")({
  head: () => ({ meta: [{ title: "Group | Cebu Airsoft Hub" }] }),
  component: GroupProfilePage,
});

function GroupProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="border border-border bg-card p-12 text-center">
        <p className="label-military text-muted-foreground">Group profile coming soon.</p>
      </div>
    </div>
  );
}
