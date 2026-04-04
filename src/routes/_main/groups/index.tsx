import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GroupCard } from "@/components/groups/group-card";
import { SkeletonList } from "@/components/shared/skeleton-list";
import { useGroups } from "@/hooks/use-groups";

export const Route = createFileRoute("/_main/groups/")({
  head: () => ({
    meta: [{ title: "Groups | Detachment Reaper" }],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const { data: groups = [], isLoading } = useGroups();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Units"
        title="Groups &amp; Teams"
        description="Register your airsoft team and connect with other groups in Cebu."
      />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups..."
            className="h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>

        <Link
          to="/groups/new"
          className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="h-3.5 w-3.5" />
          Register group
        </Link>
      </div>

      {isLoading ? (
        <SkeletonList count={6} height="h-36" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.slug} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
