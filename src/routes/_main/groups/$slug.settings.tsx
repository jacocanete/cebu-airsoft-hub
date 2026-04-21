import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { groupDetailQueryOptions, useGroupDetail } from "@/hooks/use-groups";
import { useCurrentUser } from "@/hooks/use-auth";
import { getCachedSession } from "@/lib/queries/session";
import { SkeletonCard } from "@/components/shared/skeleton-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "@/components/groups/settings/general-tab";
import { MembersTab } from "@/components/groups/settings/members-tab";
import { RequestsTab } from "@/components/groups/settings/requests-tab";
import { InvitesTab } from "@/components/groups/settings/invites-tab";
import type { GroupDetail } from "@/types";

export const Route = createFileRoute("/_main/groups/$slug/settings")({
  beforeLoad: ({ context, location }) => {
    const session = getCachedSession(context.queryClient);
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  loader: async ({ context, params }) => {
    const group = await context.queryClient.ensureQueryData(
      groupDetailQueryOptions(params.slug),
    );
    const role = group.viewerMembership?.role;
    if (role !== "OWNER" && role !== "ADMIN") {
      throw redirect({ to: "/groups/$slug", params: { slug: params.slug } });
    }
    return group;
  },
  pendingComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <SkeletonCard />
    </div>
  ),
  head: ({ loaderData }) => {
    const group = loaderData as GroupDetail | undefined;
    return {
      meta: [{ title: group ? `${group.name} settings | Cebu Airsoft Hub` : "Group settings" }],
    };
  },
  component: GroupSettingsPage,
});

const TABS = ["general", "members", "requests", "invites"] as const;
type Tab = (typeof TABS)[number];

function GroupSettingsPage() {
  const { slug } = Route.useParams();
  const { data: group } = useGroupDetail(slug);
  const { data: session } = useCurrentUser();
  const viewer = session?.user;
  const [tab, setTab] = useState<Tab>("general");

  if (!group || !viewer) return null;

  const pendingCount = group.pendingJoinRequestCount ?? 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/groups/$slug"
        params={{ slug }}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to {group.name}
      </Link>

      <h1 className="mb-1 text-xl font-black uppercase tracking-tight text-foreground">
        {group.name} settings
      </h1>
      <p className="mb-6 text-xs text-muted-foreground">
        Manage members, requests, and group settings.
      </p>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className="w-full"
      >
        <TabsList className="w-full" variant="line">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab group={group} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <MembersTab group={group} viewer={viewer} />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <RequestsTab slug={slug} />
        </TabsContent>
        <TabsContent value="invites" className="mt-6">
          <InvitesTab group={group} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
