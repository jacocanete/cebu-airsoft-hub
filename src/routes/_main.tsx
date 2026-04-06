import { Outlet, createFileRoute, useMatchRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/navbar";

export const Route = createFileRoute("/_main")({
  component: MainLayout,
});

function MainLayout() {
  const matchRoute = useMatchRoute();
  const isMessageThread = !!matchRoute({ to: "/messages/$id" });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isMessageThread && (
        <footer className="border-t border-border bg-card py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center gap-1">
            <p className="label-military">
              Detachment Reaper &mdash; Cebu Airsoft Community
            </p>
            <p className="text-xs text-muted-foreground/50">
              Lock in. Gear up. Play.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
