import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, DollarSign, CalendarDays, Users } from "lucide-react";
import { G as GAME_TYPE_COLORS, F as FALLBACK_BADGE, E as EVENT_STATUS_COLORS, d as GAME_TYPES } from "./constants-EnOrqO6t.js";
import { c as MOCK_EVENTS } from "./mock-data-Ci_j4hTR.js";
import { P as PageHeader } from "./page-header-Di-fQi7S.js";
function EventCard({ event }) {
  const playerCap = event.playerCap ?? 0;
  const rsvpPercent = playerCap > 0 ? Math.round(event.rsvpCount / playerCap * 100) : 0;
  const [month, day] = event.date.split(" ");
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/events/$id",
      params: { id: event.id },
      className: "group flex border border-border bg-card transition-colors hover:border-primary/30 hover:bg-accent",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center border-r border-border bg-primary/5 px-5 py-4 shrink-0", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-black text-primary leading-none", children: day?.replace(",", "") }),
          /* @__PURE__ */ jsx("span", { className: "label-military text-primary", children: month?.toUpperCase() })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 p-4 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${GAME_TYPE_COLORS[event.gameType] ?? FALLBACK_BADGE}`,
                children: event.gameType
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${EVENT_STATUS_COLORS[event.status] ?? FALLBACK_BADGE}`,
                children: event.status
              }
            )
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors", children: event.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
              event.time
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
              event.locationName
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(DollarSign, { className: "h-3 w-3" }),
              "₱",
              event.entranceFee
            ] })
          ] }),
          playerCap > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "RSVP" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-foreground", children: [
                event.rsvpCount,
                "/",
                playerCap
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-border rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full bg-emerald-500 transition-all",
                style: { width: `${rsvpPercent}%` }
              }
            ) })
          ] })
        ] })
      ]
    }
  );
}
function EventsPage() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { eyebrow: "Operations", title: "Game Events", description: "Find upcoming airsoft games in Cebu. RSVP to lock in your slot." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: ["Upcoming", "Past"].map((tab) => /* @__PURE__ */ jsx("button", { className: `rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${tab === "Upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: tab }, tab)) }),
          /* @__PURE__ */ jsxs(Link, { to: "/events/new", className: "inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "h-3.5 w-3.5" }),
            "Host game"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: MOCK_EVENTS.map((event) => /* @__PURE__ */ jsx(EventCard, { event }, event.id)) })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Game Type" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: ["All", ...GAME_TYPES].map((type) => /* @__PURE__ */ jsx("button", { className: `rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${type === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: type }, type)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-2", children: "Hosting a game?" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3", children: "Create an event and let the community know. Set your date, location, fee, and player limit." }),
          /* @__PURE__ */ jsx(Link, { to: "/events/new", className: "block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors", children: "Create an event" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("p", { className: "label-military text-primary", children: "Quick Stats" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: [{
            label: "Upcoming Games",
            value: "4"
          }, {
            label: "Players RSVP'd",
            value: "95"
          }, {
            label: "This Month",
            value: "12 games"
          }].map(({
            label,
            value
          }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground", children: label }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-primary", children: value })
          ] }, label)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  EventsPage as component
};
