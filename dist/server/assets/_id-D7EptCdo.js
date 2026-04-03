import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Shield, ChevronRight, ChevronUp, ChevronDown, MessageSquare, Clock, CheckCircle, Share2, Flag } from "lucide-react";
import { useState } from "react";
import { P as POLL_STATUS_COLORS, b as CATEGORY_COLORS } from "./constants-EnOrqO6t.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { P as PROSE_CLASSES } from "./prose-BDvSLuIB.js";
import { e as MOCK_POST_DETAIL, f as MOCK_POLL, g as MOCK_COMMENTS } from "./mock-data-Ci_j4hTR.js";
import { B as BackLink } from "./back-link-CsNOCM83.js";
import { U as UserAvatar } from "./user-avatar-CoRUOLaw.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function CommentItem({ comment, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [vote, setVote] = useState(0);
  const score = comment.upvotes + vote;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 4;
  return /* @__PURE__ */ jsxs("div", { className: `flex gap-2 ${depth > 0 ? "mt-3" : ""}`, children: [
    depth > 0 && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCollapsed(!collapsed),
        className: "w-4 shrink-0 flex justify-center pt-1 group",
        "aria-label": "Collapse thread",
        children: /* @__PURE__ */ jsx("span", { className: "w-px flex-1 bg-border group-hover:bg-primary transition-colors" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/profile/$username",
            params: { username: comment.author.username },
            className: "text-xs font-bold text-foreground hover:text-primary transition-colors",
            children: [
              "u/",
              comment.author.username
            ]
          }
        ),
        comment.author.team && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-2.5 w-2.5" }),
          comment.author.team
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: comment.createdAt })
      ] }),
      collapsed ? /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setCollapsed(false),
          className: "text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2",
          children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
            "Show ",
            comment.replies?.length ?? 0,
            " replies"
          ]
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/90 leading-relaxed mb-2 whitespace-pre-wrap", children: comment.content }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setVote(vote === 1 ? 0 : 1),
                className: `p-0.5 rounded transition-colors ${vote === 1 ? "text-primary" : "text-muted-foreground hover:text-primary"}`,
                children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: `text-xs font-bold min-w-[20px] text-center ${score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "text-muted-foreground"}`, children: score }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setVote(vote === -1 ? 0 : -1),
                className: `p-0.5 rounded transition-colors ${vote === -1 ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`,
                children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setReplyOpen(!replyOpen),
              className: "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors",
              children: [
                /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
                "Reply"
              ]
            }
          ),
          hasReplies && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setCollapsed(true),
              className: "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors",
              children: "Collapse"
            }
          )
        ] }),
        replyOpen && /* @__PURE__ */ jsxs("div", { className: "mb-3 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "textarea",
            {
              autoFocus: true,
              rows: 3,
              placeholder: `Replying to u/${comment.author.username}...`,
              className: "w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { className: "rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors", children: "Reply" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setReplyOpen(false),
                className: "rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors",
                children: "Cancel"
              }
            )
          ] })
        ] }),
        hasReplies && depth < maxDepth && /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(CommentThread, { comments: comment.replies, depth: depth + 1 }) }),
        hasReplies && depth >= maxDepth && /* @__PURE__ */ jsx("button", { className: "text-xs text-primary hover:underline", children: "Continue thread →" })
      ] })
    ] })
  ] });
}
function CommentThread({ comments, depth = 0 }) {
  return /* @__PURE__ */ jsx("div", { className: `flex flex-col ${depth === 0 ? "gap-5" : "gap-0"}`, children: comments.map((comment) => /* @__PURE__ */ jsx(CommentItem, { comment, depth }, comment.id)) });
}
function Poll({ poll }) {
  const [voted, setVoted] = useState(false);
  const [selected, setSelected] = useState([]);
  const handleSelect = (id) => {
    if (voted) return;
    if (poll.multiSelect) {
      setSelected(
        (prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };
  const handleVote = () => {
    if (selected.length === 0) return;
    setVoted(true);
  };
  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);
  return /* @__PURE__ */ jsxs("div", { className: "border border-primary/20 bg-primary/5 p-5 my-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold uppercase tracking-wide text-foreground", children: poll.question }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `shrink-0 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${POLL_STATUS_COLORS[poll.status]}`,
          children: poll.status === "open" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
            " Open"
          ] }) : "Closed"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-4", children: poll.options.map((option) => {
      const pct = voted || poll.status === "closed" ? Math.round(option.votes / (poll.totalVotes || 1) * 100) : 0;
      const isSelected = selected.includes(option.id);
      const isWinner = option.votes === maxVotes;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleSelect(option.id),
          disabled: voted || poll.status === "closed",
          className: `relative w-full text-left rounded border overflow-hidden transition-colors ${isSelected && !voted ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"} ${voted || poll.status === "closed" ? "cursor-default" : "cursor-pointer"}`,
          children: [
            (voted || poll.status === "closed") && /* @__PURE__ */ jsx(
              "div",
              {
                className: `absolute inset-y-0 left-0 transition-all duration-700 ${isWinner ? "bg-primary/20" : "bg-muted/60"}`,
                style: { width: `${pct}%` }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-between px-3 py-2.5 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                !voted && poll.status === "open" && /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary" : "border-border bg-background"}`,
                    children: isSelected && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary-foreground" })
                  }
                ),
                voted && isSelected && /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 shrink-0 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground truncate", children: option.text })
              ] }),
              (voted || poll.status === "closed") && /* @__PURE__ */ jsxs("span", { className: `shrink-0 text-xs font-black ${isWinner ? "text-primary" : "text-muted-foreground"}`, children: [
                pct,
                "%"
              ] })
            ] })
          ]
        },
        option.id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "label-military text-muted-foreground/60", children: [
        poll.totalVotes,
        " ",
        poll.totalVotes === 1 ? "vote" : "votes",
        poll.multiSelect && " · Multiple choice",
        poll.expiresAt && ` · Closes ${poll.expiresAt}`
      ] }),
      !voted && poll.status === "open" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleVote,
          disabled: selected.length === 0,
          className: "rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed",
          children: "Vote"
        }
      ),
      voted && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setVoted(false);
            setSelected([]);
          },
          className: "text-xs text-muted-foreground hover:text-primary transition-colors label-military",
          children: "Change vote"
        }
      )
    ] })
  ] });
}
function PostPage() {
  const post = MOCK_POST_DETAIL;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(BackLink, { to: "/feed", label: "Back to Forum" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:gap-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-6 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
            post.pinned,
            /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[post.category]}`, children: post.category }),
            post.tags.map((tag) => /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground/60", children: [
              "#",
              tag
            ] }, tag))
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl mb-4", children: post.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pb-4 border-b border-border", children: [
            /* @__PURE__ */ jsx(UserAvatar, { name: post.author.name, username: post.author.username, size: "sm", linkToProfile: true }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Link, { to: "/profile/$username", params: {
                  username: post.author.username
                }, className: "text-sm font-bold text-foreground hover:text-primary transition-colors", children: post.author.name }),
                post.author.team && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary", children: [
                  /* @__PURE__ */ jsx(Shield, { className: "h-2.5 w-2.5" }),
                  post.author.team
                ] })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "label-military text-muted-foreground/60", children: [
                "u/",
                post.author.username,
                " · ",
                post.createdAt,
                " · ",
                post.viewCount.toLocaleString(),
                " views"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `pt-4 ${PROSE_CLASSES}`, children: /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: post.content }) }),
          /* @__PURE__ */ jsx(Poll, { poll: MOCK_POLL }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-4 border-t border-border flex-wrap", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 border border-border rounded overflow-hidden", children: [
              /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors", children: [
                /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5" }),
                post.upvotes
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-border" }),
              /* @__PURE__ */ jsx("button", { className: "px-2.5 py-1.5 text-muted-foreground hover:bg-accent transition-colors", children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" }) })
            ] }),
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
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5 pb-4 border-b border-border flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxs("p", { className: "label-military text-primary", children: [
              post.commentCount,
              " Comments"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-0.5", children: ["Best", "New", "Old"].map((s) => /* @__PURE__ */ jsx("button", { className: `rounded px-2.5 py-1 label-military transition-colors ${s === "Best" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: s }, s)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx("textarea", { rows: 3, placeholder: "Write a reply... (Markdown supported)", className: "w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none font-mono" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground/40", children: "**bold** · *italic* · `code` · > quote" }),
              /* @__PURE__ */ jsx("button", { className: "rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors", children: "Comment" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(CommentThread, { comments: MOCK_COMMENTS })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-64 shrink-0 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Author" }),
          /* @__PURE__ */ jsxs(Link, { to: "/profile/$username", params: {
            username: post.author.username
          }, className: "flex items-center gap-3 hover:opacity-80 transition-opacity", children: [
            /* @__PURE__ */ jsx(UserAvatar, { name: post.author.name, username: post.author.username, size: "md", linkToProfile: true }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: post.author.name }),
              /* @__PURE__ */ jsxs("p", { className: "label-military text-muted-foreground/60", children: [
                "u/",
                post.author.username
              ] })
            ] })
          ] }),
          post.author.team && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-border", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
            post.author.team
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Stats" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: [{
            label: "Upvotes",
            value: post.upvotes
          }, {
            label: "Comments",
            value: post.commentCount
          }, {
            label: "Views",
            value: post.viewCount.toLocaleString()
          }].map(({
            label,
            value
          }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground", children: label }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-primary", children: value })
          ] }, label)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-2", children: "Got something to share?" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3 leading-relaxed", children: "Post your guides, reviews, or questions in the forum." }),
          /* @__PURE__ */ jsx(Link, { to: "/feed/new", className: "block rounded bg-primary px-3 py-2 text-center label-military text-primary-foreground hover:bg-primary/85 transition-colors", children: "Create a post" })
        ] })
      ] })
    ] })
  ] });
}
export {
  PostPage as component
};
