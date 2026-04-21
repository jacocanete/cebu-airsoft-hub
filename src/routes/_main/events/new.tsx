import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";
import { useCreateEvent } from "@/hooks/use-events";
import { GAME_TYPES } from "@/lib/constants";
import { getCachedSession } from "@/lib/queries/session";

// Default map coordinates (Cebu City center). A proper map picker is a
// follow-up — until then, every new event drops a pin here and the organizer
// sets the actual venue via the "Location" text field.
const DEFAULT_LAT = 10.3157;
const DEFAULT_LNG = 123.8854;

export const Route = createFileRoute("/_main/events/new")({
  head: () => ({ meta: [{ title: "Host a Game | Cebu Airsoft Hub" }] }),
  beforeLoad: ({ context, location }) => {
    const session = getCachedSession(context.queryClient);
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = Route.useNavigate();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [gameType, setGameType] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [entranceFee, setEntranceFee] = useState("");
  const [playerCap, setPlayerCap] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");

  const canSubmit =
    title.trim().length > 0 &&
    gameType.length > 0 &&
    date.length > 0 &&
    location.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const feeNum = entranceFee ? Number(entranceFee) : undefined;
    const capNum = playerCap ? Number(playerCap) : undefined;

    createEvent.mutate(
      {
        title: title.trim(),
        gameType,
        date,
        time: time || undefined,
        // `gameSite` and `locationName` are separate schema fields, but in
        // practice they are never shown independently — we capture a single
        // venue string and duplicate it.
        gameSite: location.trim(),
        locationName: location.trim(),
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
        entranceFee: feeNum,
        playerCap: capNum,
        description: description.trim() || undefined,
        rules: rules.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          const { id } = data as { id: string };
          toast.success("Event created");
          navigate({ to: "/events/$id", params: { id } });
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to create event"),
      },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <BackLink to="/events" label="Back to Events" />

      <div className="mb-8">
        <PageHeader
          eyebrow="Operations"
          title="Host a Game"
          description="Post your game details. Players RSVP to reserve a slot."
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="label-military text-foreground">
            Title <span className="text-primary">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            required
            placeholder="Saturday Ops — MilSim at Area 51"
            className="input-field"
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {title.length}/200
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="game-type" className="label-military text-foreground">
              Game type <span className="text-primary">*</span>
            </label>
            <select
              id="game-type"
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select a type…</option>
              {GAME_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="player-cap" className="label-military text-foreground">
              Player cap{" "}
              <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
                (optional)
              </span>
            </label>
            <input
              id="player-cap"
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              value={playerCap}
              onChange={(e) => setPlayerCap(e.target.value)}
              placeholder="30"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="label-military text-foreground">
              Date <span className="text-primary">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="time" className="label-military text-foreground">
              Start time{" "}
              <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
                (optional)
              </span>
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="label-military text-foreground">
            Venue / Location <span className="text-primary">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="Area 51 Airsoft Park, Mandaue City"
            className="input-field"
          />
          <p className="text-[11px] text-muted-foreground">
            Map pin drops at Cebu City until map picker is added.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fee" className="label-military text-foreground">
            Entrance fee{" "}
            <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
              (optional, in PHP)
            </span>
          </label>
          <input
            id="fee"
            type="number"
            inputMode="numeric"
            min={0}
            value={entranceFee}
            onChange={(e) => setEntranceFee(e.target.value)}
            placeholder="500"
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="label-military text-foreground">
            Mission brief{" "}
            <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
              (optional)
            </span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
            placeholder="Story, objectives, scenario details…"
            className="input-field resize-none"
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {description.length}/2000
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rules" className="label-military text-foreground">
            Rules of engagement{" "}
            <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
              (optional)
            </span>
          </label>
          <textarea
            id="rules"
            rows={4}
            value={rules}
            onChange={(e) => setRules(e.target.value.slice(0, 2000))}
            placeholder="FPS limits, safety gear, BB weight, etc."
            className="input-field resize-none"
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {rules.length}/2000
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            You'll be listed as the organizer. Cancellations are manual for now.
          </p>
          <div className="flex gap-2">
            <Link
              to="/events"
              search={{ tab: "Upcoming", gameType: "All" }}
              className="btn-ghost"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || createEvent.isPending}
              className="btn-primary"
            >
              {createEvent.isPending ? "Creating…" : "Create event"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
