import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, DollarSign, Share2, Flag, Shield } from "lucide-react";
import { G as GAME_TYPE_COLORS, F as FALLBACK_BADGE, E as EVENT_STATUS_COLORS } from "./constants-EnOrqO6t.js";
import { h as MOCK_EVENT_DETAIL } from "./mock-data-Ci_j4hTR.js";
import { B as BackLink } from "./back-link-CsNOCM83.js";
import { U as UserAvatar } from "./user-avatar-CoRUOLaw.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function EventDetailPage() {
  const event = MOCK_EVENT_DETAIL;
  const playerCap = event.playerCap ?? 0;
  const rsvpPercent = playerCap > 0 ? Math.round(event.rsvpCount / playerCap * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(BackLink, { to: "/events", label: "Back to Events" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:gap-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-6 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${GAME_TYPE_COLORS[event.gameType] ?? FALLBACK_BADGE}`, children: event.gameType }),
            /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${EVENT_STATUS_COLORS[event.status] ?? FALLBACK_BADGE}`, children: event.status })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl mb-4", children: event.title }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 pb-4 border-b border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(CalendarDays, { className: "h-4 w-4 text-primary shrink-0" }),
              event.date
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary shrink-0" }),
              event.time
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-primary shrink-0" }),
              event.locationName
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-primary shrink-0" }),
              "₱",
              event.entranceFee,
              " entrance"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4", children: [
            /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Mission Brief" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line", children: event.description })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 aspect-[16/9] w-full border border-border bg-muted/30 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-2" }),
            /* @__PURE__ */ jsx("p", { className: "label-military text-muted-foreground/30", children: "Map coming soon" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-4 mt-4 border-t border-border flex-wrap", children: [
            /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 label-military text-muted-foreground hover:bg-accent hover:text-foreground transition-colors", children: [
              /* @__PURE__ */ jsx(Share2, { className: "h-3.5 w-3.5" }),
              "Share"
            ] }),
            /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 label-military text-muted-foreground hover:bg-accent hover:text-foreground transition-colors", children: [
              /* @__PURE__ */ jsx(Flag, { className: "h-3.5 w-3.5" }),
              "Report"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-6", children: [
          /* @__PURE__ */ jsxs("p", { className: "label-military text-primary mb-4", children: [
            "Confirmed Operators (",
            event.participants.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: event.participants.map((participant) => /* @__PURE__ */ jsxs(Link, { to: "/profile/$username", params: {
            username: participant.username
          }, className: "flex items-center gap-3 rounded p-2 transition-colors hover:bg-accent", children: [
            /* @__PURE__ */ jsx(UserAvatar, { name: participant.name, username: participant.username, size: "xs", linkToProfile: true }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-foreground truncate", children: participant.name }),
              participant.team && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary shrink-0", children: [
                /* @__PURE__ */ jsx(Shield, { className: "h-2.5 w-2.5" }),
                participant.team
              ] })
            ] })
          ] }, participant.username)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-72 shrink-0 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "RSVP" }),
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                event.rsvpCount,
                " / ",
                playerCap,
                " slots"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-primary", children: [
                rsvpPercent,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-border rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-primary transition-all", style: {
              width: `${rsvpPercent}%`
            } }) })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "w-full rounded bg-primary px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red", children: "RSVP — I'm in" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-center text-[10px] text-muted-foreground/50", children: [
            playerCap - event.rsvpCount,
            " slots remaining"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Organizer" }),
          /* @__PURE__ */ jsxs(Link, { to: "/profile/$username", params: {
            username: event.organizer.username
          }, className: "flex items-center gap-3 hover:opacity-80 transition-opacity", children: [
            /* @__PURE__ */ jsx(UserAvatar, { name: event.organizer.name, username: event.organizer.username, size: "sm", linkToProfile: true }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: event.organizer.name }),
              /* @__PURE__ */ jsxs("p", { className: "label-military text-muted-foreground/60", children: [
                "u/",
                event.organizer.username
              ] })
            ] })
          ] }),
          event.organizer.team && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-border", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
            event.organizer.team
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Event Details" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: [{
            label: "Type",
            value: event.gameType
          }, {
            label: "Fee",
            value: `₱${event.entranceFee}`
          }, {
            label: "Capacity",
            value: `${playerCap} players`
          }, {
            label: "Date",
            value: event.date
          }].map(({
            label,
            value
          }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground", children: label }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-foreground", children: value })
          ] }, label)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  EventDetailPage as component
};
