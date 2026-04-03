import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Users } from "lucide-react";
import { GAME_TYPES } from "@/lib/constants";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/page-header";
import { EventCard } from "@/components/events/event-card";

export const Route = createFileRoute("/_main/events/")({
  head: () => ({
    meta: [{ title: "Events | Detachment Reaper" }],
  }),
  component: EventsPage,
});
function EventsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Operations" title="Game Events" description="Find upcoming airsoft games in Cebu. RSVP to lock in your slot." />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {["Upcoming", "Past"].map((tab) => (
                <button
                  key={tab}
                  className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                    tab === "Upcoming"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link
              to="/events/new"
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Host game
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_EVENTS.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3">
          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Game Type</p>
            <div className="flex flex-col gap-0.5">
              {["All", ...GAME_TYPES].map((type) => (
                <button
                  key={type}
                  className={`rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                    type === "All"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-2">Hosting a game?</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Create an event and let the community know. Set your date,
              location, fee, and player limit.
            </p>
            <Link
              to="/events/new"
              className="block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors"
            >
              Create an event
            </Link>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <p className="label-military text-primary">Quick Stats</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Upcoming Games", value: "4" },
                { label: "Players RSVP'd", value: "95" },
                { label: "This Month", value: "12 games" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="label-military text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-sm font-black text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
