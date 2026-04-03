import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { C as CONDITION_COLORS, F as FALLBACK_BADGE, L as LISTING_STATUS_COLORS, M as MARKETPLACE_CATEGORIES, a as CONDITIONS } from "./constants-EnOrqO6t.js";
import { M as MOCK_LISTINGS } from "./mock-data-Ci_j4hTR.js";
import { P as PageHeader } from "./page-header-Di-fQi7S.js";
function ListingCard({
  listing
}) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/marketplace/$id",
      params: { id: listing.id },
      className: "group flex flex-col border border-border bg-card transition-colors hover:border-primary/30 hover:bg-accent",
      children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] w-full bg-muted/30 flex items-center justify-center border-b border-border", children: /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground/30", children: "No image" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 p-4 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CONDITION_COLORS[listing.condition] ?? FALLBACK_BADGE}`,
                children: listing.condition
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LISTING_STATUS_COLORS[listing.status] ?? FALLBACK_BADGE}`,
                children: listing.status
              }
            )
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2", children: listing.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg font-black text-primary", children: [
            "₱",
            listing.price.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/profile/$username",
                params: { username: listing.seller.username },
                className: "hover:text-primary transition-colors",
                onClick: (e) => e.stopPropagation(),
                children: listing.seller.name
              }
            ),
            /* @__PURE__ */ jsx("span", { children: listing.createdAt })
          ] })
        ] })
      ]
    }
  );
}
function MarketplacePage() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { eyebrow: "Buy & Sell", title: "Marketplace", description: "Trade airsoft gear with fellow Cebu players." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-sm", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search listings...", className: "h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", children: [
              /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-3.5 w-3.5" }),
              "Filters"
            ] }),
            /* @__PURE__ */ jsxs(Link, { to: "/marketplace/new", className: "inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
              "Sell"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: MOCK_LISTINGS.map((listing) => /* @__PURE__ */ jsx(ListingCard, { listing }, listing.id)) })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Categories" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: ["All", ...MARKETPLACE_CATEGORIES].map((cat) => /* @__PURE__ */ jsx("button", { className: `rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${cat === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: cat }, cat)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Condition" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: ["All", ...CONDITIONS].map((cond) => /* @__PURE__ */ jsx("button", { className: `rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${cond === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: cond }, cond)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-2", children: "Selling gear?" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3", children: "List your guns, gear, and accessories for the Cebu airsoft community." }),
          /* @__PURE__ */ jsx(Link, { to: "/marketplace/new", className: "block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors", children: "Create a listing" })
        ] })
      ] })
    ] })
  ] });
}
export {
  MarketplacePage as component
};
