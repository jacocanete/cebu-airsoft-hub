import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Shield, Users, Search, Plus } from "lucide-react";
import { a as MOCK_GROUPS } from "./mock-data-Ci_j4hTR.js";
import { P as PageHeader } from "./page-header-Di-fQi7S.js";
function GroupCard({ group }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/groups/$slug",
      params: { slug: group.slug },
      className: "group flex flex-col border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center border border-primary/30 bg-primary/10 shrink-0", children: /* @__PURE__ */ jsx(Shield, { className: "h-6 w-6 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate", children: group.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              group.memberCount,
              " operators"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2", children: group.description }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-border", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
            group.memberCount,
            " members"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
            group.gameCount,
            " games"
          ] })
        ] })
      ]
    }
  );
}
function GroupsPage() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { eyebrow: "Units", title: "Groups & Teams", description: "Register your airsoft team and connect with other groups in Cebu." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search groups...", className: "h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/groups/new", className: "inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
        "Register group"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: MOCK_GROUPS.map((group) => /* @__PURE__ */ jsx(GroupCard, { group }, group.slug)) })
  ] });
}
export {
  GroupsPage as component
};
