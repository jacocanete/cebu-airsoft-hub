import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ChevronUp, ChevronDown, Pin, MessageSquare, Search, Flame, Clock, TrendingUp, Plus } from "lucide-react";
import { b as CATEGORY_COLORS, F as FALLBACK_BADGE, c as FORUM_CATEGORIES } from "./constants-EnOrqO6t.js";
import { b as MOCK_POSTS } from "./mock-data-Ci_j4hTR.js";
import { P as PageHeader } from "./page-header-Di-fQi7S.js";
function PostCard({ post }) {
  return /* @__PURE__ */ jsxs(
    "article",
    {
      className: `flex gap-3 border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent ${post.pinned ? "border-primary/30 bg-primary/5" : "border-border"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5 pt-0.5 shrink-0", children: [
          /* @__PURE__ */ jsx("button", { className: "rounded p-0.5 text-muted-foreground transition-colors hover:text-primary", children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: post.upvotes }),
          /* @__PURE__ */ jsx("button", { className: "rounded p-0.5 text-muted-foreground transition-colors hover:text-primary", children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex flex-wrap items-center gap-2", children: [
            post.pinned && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary", children: [
              /* @__PURE__ */ jsx(Pin, { className: "h-3 w-3" }),
              " Pinned"
            ] }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category] ?? FALLBACK_BADGE}`,
                children: post.category
              }
            ),
            post.tags.map((tag) => /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground/60", children: [
              "#",
              tag
            ] }, tag))
          ] }),
          /* @__PURE__ */ jsx(Link, { to: "/feed/$id", params: { id: post.id }, children: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-foreground leading-snug hover:text-primary transition-colors", children: post.title }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/profile/$username",
                params: { username: post.author.username },
                className: "hover:text-primary transition-colors",
                children: [
                  "u/",
                  post.author.username
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { children: post.createdAt }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/feed/$id",
                params: { id: post.id },
                className: "inline-flex items-center gap-1 hover:text-foreground transition-colors",
                children: [
                  /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
                  post.commentCount
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const SORT_OPTIONS = [{
  label: "Hot",
  icon: Flame
}, {
  label: "New",
  icon: Clock
}, {
  label: "Top",
  icon: TrendingUp
}];
const pinnedPosts = MOCK_POSTS.filter((p) => p.pinned);
const regularPosts = MOCK_POSTS.filter((p) => !p.pinned);
function FeedPage() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { eyebrow: "Community", title: "Forum" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsx("form", { action: "/feed/search", className: "flex-1 max-w-sm", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx("input", { type: "text", name: "q", placeholder: "Search posts...", className: "h-9 w-full rounded border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: SORT_OPTIONS.map(({
              label,
              icon: Icon
            }) => /* @__PURE__ */ jsxs("button", { className: `inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${label === "Hot" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
              label
            ] }, label)) }),
            /* @__PURE__ */ jsxs(Link, { to: "/feed/new", className: "inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
              "Post"
            ] })
          ] })
        ] }),
        pinnedPosts.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1.5 mb-1.5", children: pinnedPosts.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id)) }),
        pinnedPosts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 py-2 mb-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-border" }),
          /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground/40", children: "posts" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-border" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1.5", children: regularPosts.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id)) })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Categories" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: ["All", ...FORUM_CATEGORIES].map((cat) => /* @__PURE__ */ jsx("button", { className: `rounded px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${cat === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: cat }, cat)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-2", children: "Rules of Engagement" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Keep it respectful. No doxxing. No cheating accusations without proof. Safety first — on and off the field." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx(Link, { to: "/register", className: "block rounded bg-primary px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85", children: "Join the community" }),
            /* @__PURE__ */ jsx(Link, { to: "/feed/new", className: "block rounded border border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:border-primary/50", children: "Create a post" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  FeedPage as component
};
