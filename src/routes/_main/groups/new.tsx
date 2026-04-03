import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/groups/new")({
  head: () => ({ meta: [{ title: "Register a Group | Detachment Reaper" }] }),
  component: NewGroupPage,
});

function NewGroupPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="border-l-2 border-primary pl-3 mb-8">
        <p className="label-military text-primary">Units</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Register a Group</h1>
      </div>
      <div className="border border-border bg-card p-12 text-center">
        <p className="label-military text-muted-foreground">Create group coming soon.</p>
      </div>
    </div>
  );
}
