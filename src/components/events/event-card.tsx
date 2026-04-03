import { Link } from "@tanstack/react-router";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { GAME_TYPE_COLORS, EVENT_STATUS_COLORS, FALLBACK_BADGE } from "@/lib/constants";
import { MOCK_EVENTS } from "@/lib/mock-data";

export function EventCard({ event }: { event: (typeof MOCK_EVENTS)[number] }) {
  const playerCap = event.playerCap ?? 0;
  const rsvpPercent =
    playerCap > 0 ? Math.round((event.rsvpCount / playerCap) * 100) : 0;
  const [month, day] = event.date.split(" ");

  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      className="group flex border border-border bg-card transition-colors hover:border-primary/30 hover:bg-accent"
    >
      <div className="flex flex-col items-center justify-center border-r border-border bg-primary/5 px-5 py-4 shrink-0">
        <span className="text-2xl font-black text-primary leading-none">
          {day?.replace(",", "")}
        </span>
        <span className="label-military text-primary">{month?.toUpperCase()}</span>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${GAME_TYPE_COLORS[event.gameType] ?? FALLBACK_BADGE}`}
          >
            {event.gameType}
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${EVENT_STATUS_COLORS[event.status] ?? FALLBACK_BADGE}`}
          >
            {event.status}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {event.time}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.locationName}
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            ₱{event.entranceFee}
          </span>
        </div>

        {playerCap > 0 && (
          <div className="mt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                RSVP
              </span>
              <span className="text-[10px] font-bold text-foreground">
                {event.rsvpCount}/{playerCap}
              </span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${rsvpPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
