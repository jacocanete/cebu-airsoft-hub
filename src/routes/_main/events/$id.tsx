import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Flag,
} from "lucide-react";
import { MessageButton } from "@/components/shared/MessageButton";
import { GAME_TYPE_COLORS, EVENT_STATUS_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { BackLink } from "@/components/shared/back-link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { SkeletonCard } from "@/components/shared/skeleton-list";
import { useEventDetail, useRsvp } from "@/hooks/use-events";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ShareButton } from "@/components/shared/share-button";

export const Route = createFileRoute("/_main/events/$id")({
  head: () => ({
    meta: [{ title: "Event | Detachment Reaper" }],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = Route.useParams();
  const { data: event, isLoading } = useEventDetail(id);
  const rsvp = useRsvp();
  const requireAuth = useRequireAuth();

  if (isLoading || !event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SkeletonCard />
      </div>
    );
  }

  const playerCap = event.playerCap ?? 0;
  const rsvpPercent =
    playerCap > 0 ? Math.round((event.rsvpCount / playerCap) * 100) : 0;

  const participants = Array.isArray(event.rsvps) ? event.rsvps.map((r) => r.user) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BackLink to="/events" label="Back to Events" />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex-1 min-w-0">
          <div className="border border-border bg-card p-6 mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${GAME_TYPE_COLORS[event.gameType] ?? FALLBACK_BADGE}`}
              >
                {event.gameType}
              </span>
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${EVENT_STATUS_COLORS[event.status] ?? FALLBACK_BADGE}`}
              >
                {event.status}
              </span>
            </div>

            <h1 className="text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl mb-4">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                {event.date}
              </div>
              {event.time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  {event.time}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                {event.locationName}
              </div>
              {event.entranceFee != null && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-primary shrink-0" />
                  ₱{event.entranceFee} entrance
                </div>
              )}
            </div>

            {event.description && (
              <div className="pt-4">
                <p className="label-military text-primary mb-3">Mission Brief</p>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            )}

            <div className="mt-6 aspect-[16/9] w-full border border-border bg-muted/30 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="label-military text-muted-foreground/30">
                  Map coming soon
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border flex-wrap">
              <ShareButton />
              <button className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 label-military text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Flag className="h-3.5 w-3.5" />
                Report
              </button>
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <p className="label-military text-primary mb-4">
              Confirmed Operators ({participants.length})
            </p>
            <div className="flex flex-col gap-2">
              {participants.map((participant) => (
                <Link
                  key={participant.username}
                  to="/profile/$username"
                  params={{ username: participant.username }}
                  className="flex items-center gap-3 rounded p-2 transition-colors hover:bg-accent"
                >
                  <UserAvatar
                    name={participant.name}
                    username={participant.username}
                    size="xs"
                    linkToProfile
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {participant.name}
                    </span>

                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">RSVP</p>
            {playerCap > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {event.rsvpCount} / {playerCap} slots
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {rsvpPercent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${rsvpPercent}%` }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => requireAuth(() => rsvp.mutate({ eventId: id, status: "GOING" }))}
              disabled={rsvp.isPending}
              className="w-full rounded bg-primary px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red disabled:opacity-60"
            >
              RSVP — I&apos;m in
            </button>
            {playerCap > 0 && (
              <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
                {playerCap - event.rsvpCount} slots remaining
              </p>
            )}
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Organizer</p>
            <Link
              to="/profile/$username"
              params={{ username: event.organizer.username }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                name={event.organizer.name}
                username={event.organizer.username}
                size="sm"
                linkToProfile
              />
              <div>
                <p className="text-sm font-bold text-foreground">
                  {event.organizer.name}
                </p>
                <p className="label-military text-muted-foreground/60">
                  u/{event.organizer.username}
                </p>
              </div>
            </Link>
            <div className="mt-3 pt-3 border-t border-border">
              <MessageButton
                recipientId={event.organizer.id}
                recipientName={event.organizer.name}
                contextType="EVENT"
                contextId={event.id}
                defaultMessage={`Hi! I have a question about "${event.title}".`}
              />
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="label-military text-primary mb-3">Event Details</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Type", value: event.gameType },
                ...(event.entranceFee != null
                  ? [{ label: "Fee", value: `₱${event.entranceFee}` }]
                  : []),
                ...(playerCap > 0
                  ? [{ label: "Capacity", value: `${playerCap} players` }]
                  : []),
                { label: "Date", value: event.date },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="label-military text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-foreground">
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
