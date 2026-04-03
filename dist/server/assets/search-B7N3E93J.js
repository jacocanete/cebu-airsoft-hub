import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Search, ChevronUp, MessageSquare } from "lucide-react";
import { b as CATEGORY_COLORS, F as FALLBACK_BADGE } from "./constants-EnOrqO6t.js";
import { b as MOCK_POSTS } from "./mock-data-Ci_j4hTR.js";
import { B as BackLink } from "./back-link-CsNOCM83.js";
import { P as PageHeader } from "./page-header-Di-fQi7S.js";
import { R as Route } from "./router-DVns_yRn.js";
function SearchPage() {
  const {
    q
  } = Route.useSearch();
  const query = q?.toLowerCase().trim() ?? "";
  const results = query ? MOCK_POSTS.filter((p) => p.title.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query)) || p.category.toLowerCase().includes(query) || p.author.username.toLowerCase().includes(query)) : [];
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(BackLink, { to: "/feed", label: "Back to Forum" }),
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(PageHeader, { eyebrow: "Forum", title: "Search Results" }) }),
    /* @__PURE__ */ jsx("form", { className: "mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 max-w-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx("input", { type: "text", name: "q", defaultValue: q, placeholder: "Search posts, tags, authors...", className: "h-10 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors", children: "Search" })
    ] }) }),
    !query ? /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-12 text-center", children: [
      /* @__PURE__ */ jsx(Search, { className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "label-military text-muted-foreground", children: "Enter a search term above" })
    ] }) : results.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-12 text-center", children: [
      /* @__PURE__ */ jsxs("p", { className: "label-military text-muted-foreground mb-1", children: [
        'No results for "',
        q,
        '"'
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/50", children: "Try a different keyword, tag, or category" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { className: "label-military text-muted-foreground mb-4", children: [
        results.length,
        " result",
        results.length !== 1 ? "s" : "",
        ' for "',
        q,
        '"'
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1.5", children: results.map((post) => /* @__PURE__ */ jsxs("article", { className: "flex gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5 pt-0.5 shrink-0", children: [
          /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: post.upvotes })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-1 flex flex-wrap items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}`, children: post.category }) }),
          /* @__PURE__ */ jsx(Link, { to: "/feed/$id", params: {
            id: post.id
          }, children: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-foreground leading-snug hover:text-primary transition-colors", children: post.title }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "u/",
              post.author.username
            ] }),
            /* @__PURE__ */ jsx("span", { children: post.createdAt }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
              post.commentCount
            ] })
          ] })
        ] })
      ] }, post.id)) })
    ] })
  ] });
}
export {
  SearchPage as component
};
