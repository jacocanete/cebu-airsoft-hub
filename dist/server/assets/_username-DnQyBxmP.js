import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Shield, MapPin, CalendarDays, ChevronUp, MessageSquare, Users } from "lucide-react";
import { b as MOCK_POSTS, d as MOCK_PROFILE } from "./mock-data-Ci_j4hTR.js";
const TABS = ["Posts", "Comments", "Listings"];
function ProfilePage() {
  const user = MOCK_PROFILE;
  const activityPosts = MOCK_POSTS.filter((p) => !p.pinned).slice(0, 2);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "h-40 w-full border-b border-border sm:h-48", style: {
      background: "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)"
    } }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-7xl px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative -mt-12 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-24 w-24 items-center justify-center border-4 border-background bg-card text-3xl font-black text-primary shrink-0", children: user.name[0] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pb-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-foreground", children: user.name }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
              user.team
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "u/",
              user.username
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
              user.playStyle
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(CalendarDays, { className: "h-3 w-3" }),
              "Joined ",
              user.joinedAt
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:gap-10 pb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-5 mb-4", children: [
            /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-2", children: "Bio" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: user.bio })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card", children: [
            /* @__PURE__ */ jsx("div", { className: "flex border-b border-border", children: TABS.map((tab) => /* @__PURE__ */ jsx("button", { className: `flex-1 py-3 text-center text-xs font-semibold uppercase tracking-widest transition-colors ${tab === "Posts" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`, children: tab }, tab)) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col divide-y divide-border", children: activityPosts.map((post) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-4 transition-colors hover:bg-accent", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5 pt-0.5 shrink-0", children: [
                /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: post.upvotes })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx(Link, { to: "/feed/$id", params: {
                  id: post.id
                }, className: "text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug", children: post.title }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-3 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsx("span", { children: post.category }),
                  /* @__PURE__ */ jsx("span", { children: post.createdAt }),
                  /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
                    post.commentCount
                  ] })
                ] })
              ] })
            ] }, post.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-64 shrink-0 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Stats" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: [{
              label: "Posts",
              value: user.postCount
            }, {
              label: "Listings",
              value: user.listingCount
            }, {
              label: "Games Attended",
              value: user.gamesAttended
            }].map(({
              label,
              value
            }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground", children: label }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-primary", children: value })
            ] }, label)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Unit" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10 shrink-0", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: user.team }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
                  "48 operators"
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ProfilePage as component
};
