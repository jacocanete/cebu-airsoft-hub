import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Bold, Italic, Link2, Image, Code, Quote, List, ListOrdered, X, Plus, Clock, BarChart2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { P as PROSE_CLASSES } from "./prose-BDvSLuIB.js";
import { c as FORUM_CATEGORIES } from "./constants-EnOrqO6t.js";
import { B as BackLink } from "./back-link-CsNOCM83.js";
import { P as PageHeader } from "./page-header-Di-fQi7S.js";
const TOOLBAR = [
  {
    icon: Bold,
    label: "Bold",
    action: (s) => ({ text: `**${s || "bold text"}**`, offset: s ? 0 : 2 })
  },
  {
    icon: Italic,
    label: "Italic",
    action: (s) => ({ text: `*${s || "italic text"}*`, offset: s ? 0 : 1 })
  },
  {
    icon: Link2,
    label: "Link",
    action: (s) => ({ text: `[${s || "link text"}](url)`, offset: s ? 0 : 1 })
  },
  {
    icon: Image,
    label: "Image",
    action: (s) => ({ text: `![${s || "alt text"}](image-url)`, offset: s ? 0 : 2 })
  },
  {
    icon: Code,
    label: "Code",
    action: (s) => ({ text: `\`${s || "code"}\``, offset: s ? 0 : 1 })
  },
  {
    icon: Quote,
    label: "Blockquote",
    action: (s) => ({ text: `> ${s || "quote"}`, offset: s ? 0 : 2 })
  },
  {
    icon: List,
    label: "Bullet list",
    action: (s) => ({ text: `- ${s || "item"}`, offset: s ? 0 : 2 })
  },
  {
    icon: ListOrdered,
    label: "Numbered list",
    action: (s) => ({ text: `1. ${s || "item"}`, offset: s ? 0 : 3 })
  }
];
function PostEditor({
  value,
  onChange,
  placeholder = "Write your post... (Markdown supported)",
  minRows = 10
}) {
  const [tab, setTab] = useState("write");
  const textareaRef = useRef(null);
  const insertMarkdown = (btn) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const { text, offset } = btn.action(selected);
    const newVal = value.slice(0, start) + text + value.slice(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        selected ? start + text.length : start + offset,
        selected ? start + text.length : start + offset + (selected.length || text.length - offset * 2)
      );
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col border border-border bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex border-b border-border", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setTab("write"),
          className: `px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${tab === "write" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`,
          children: "Write"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setTab("preview"),
          className: `px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${tab === "preview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`,
          children: "Preview"
        }
      )
    ] }),
    tab === "write" && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 border-b border-border px-2 py-1.5 flex-wrap", children: TOOLBAR.map((btn) => {
      const Icon = btn.icon;
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          title: btn.label,
          onClick: () => insertMarkdown(btn),
          className: "rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
          children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
        },
        btn.label
      );
    }) }),
    tab === "write" ? /* @__PURE__ */ jsx(
      "textarea",
      {
        ref: textareaRef,
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        rows: minRows,
        className: "w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground resize-y font-mono leading-relaxed"
      }
    ) : /* @__PURE__ */ jsx("div", { className: "min-h-[200px] px-4 py-3", children: value.trim() ? /* @__PURE__ */ jsx("div", { className: PROSE_CLASSES, children: /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: value }) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground italic", children: "Nothing to preview yet." }) }),
    tab === "write" && /* @__PURE__ */ jsx("div", { className: "border-t border-border px-4 py-1.5", children: /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground/50", children: "Markdown supported · **bold** · *italic* · `code` · > quote" }) })
  ] });
}
const EXPIRY_OPTIONS = [
  { label: "1 hour", value: 1 },
  { label: "6 hours", value: 6 },
  { label: "12 hours", value: 12 },
  { label: "1 day", value: 24 },
  { label: "3 days", value: 72 },
  { label: "7 days", value: 168 },
  { label: "No expiry", value: null }
];
function PollBuilder({ value, onChange, onRemove }) {
  const update = (partial) => onChange({ ...value, ...partial });
  const updateOption = (id, text) => {
    const options = value.options.map(
      (o) => o.id === id ? { ...o, text } : o
    );
    update({ options });
  };
  const addOption = () => {
    if (value.options.length >= 6) return;
    update({
      options: [...value.options, { id: crypto.randomUUID(), text: "" }]
    });
  };
  const removeOption = (id) => {
    if (value.options.length <= 2) return;
    update({ options: value.options.filter((o) => o.id !== id) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "border border-primary/20 bg-primary/5 p-4 flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "label-military text-primary", children: "Poll" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onRemove,
          className: "text-muted-foreground hover:text-destructive transition-colors",
          "aria-label": "Remove poll",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("label", { className: "label-military text-foreground", children: "Question" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: value.question,
          onChange: (e) => update({ question: e.target.value }),
          placeholder: "e.g. Which field should we play at Saturday?",
          className: "h-9 rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("label", { className: "label-military text-foreground", children: "Options" }),
      value.options.map((opt, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "label-military text-muted-foreground/50 w-4 text-center", children: i + 1 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: opt.text,
            onChange: (e) => updateOption(opt.id, e.target.value),
            placeholder: `Option ${i + 1}`,
            className: "flex-1 h-9 rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => removeOption(opt.id),
            disabled: value.options.length <= 2,
            className: "text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
          }
        )
      ] }, opt.id)),
      value.options.length < 6 && /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: addOption,
          className: "flex items-center gap-1.5 self-start label-military text-primary hover:text-primary/80 transition-colors mt-1",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
            "Add option"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 items-center pt-2 border-t border-border", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "switch",
            "aria-checked": value.multiSelect,
            onClick: () => update({ multiSelect: !value.multiSelect }),
            className: `relative h-5 w-9 rounded-full transition-colors ${value.multiSelect ? "bg-primary" : "bg-muted"}`,
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: `absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value.multiSelect ? "translate-x-4" : "translate-x-0.5"}`
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "label-military text-foreground", children: "Allow multiple choices" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: value.expiryHours ?? "null",
            onChange: (e) => update({ expiryHours: e.target.value === "null" ? null : Number(e.target.value) }),
            className: "h-7 rounded border border-border bg-background px-2 text-xs text-foreground outline-none ring-primary focus:ring-1",
            children: EXPIRY_OPTIONS.map((opt) => /* @__PURE__ */ jsx("option", { value: String(opt.value), children: opt.label }, String(opt.value)))
          }
        )
      ] })
    ] })
  ] });
}
function NewPostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);
  const [poll, setPoll] = useState(null);
  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagsInput.trim()) {
      e.preventDefault();
      const tag = tagsInput.trim().replace(/^#/, "").toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 8) {
        setTags([...tags, tag]);
      }
      setTagsInput("");
    }
    if (e.key === "Backspace" && !tagsInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };
  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));
  const addPoll = () => {
    if (poll) return;
    setPoll({
      question: "",
      options: [{
        id: crypto.randomUUID(),
        text: ""
      }, {
        id: crypto.randomUUID(),
        text: ""
      }],
      multiSelect: false,
      expiryHours: 24
    });
  };
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && category;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsx(BackLink, { to: "/feed", label: "Back to Forum" }),
    /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx(PageHeader, { eyebrow: "Forum", title: "Create a Post" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsxs("label", { className: "label-military text-foreground", htmlFor: "title", children: [
          "Title ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("input", { id: "title", type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Write a descriptive title...", maxLength: 200, className: "h-10 rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground/40 text-right", children: [
          title.length,
          "/200"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsxs("label", { className: "label-military text-foreground", htmlFor: "category", children: [
          "Category ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { id: "category", value: category, onChange: (e) => setCategory(e.target.value), className: "h-10 rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select a category..." }),
          FORUM_CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsxs("label", { className: "label-military text-foreground", children: [
          "Body ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(PostEditor, { value: body, onChange: setBody, placeholder: "Write your post... Markdown is supported.", minRows: 12 })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsxs("label", { className: "label-military text-foreground", htmlFor: "tags", children: [
          "Tags ",
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal normal-case tracking-normal text-xs", children: "(optional, press Enter or comma to add)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5 min-h-10 rounded border border-border bg-card px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary", children: [
          tags.map((tag) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary", children: [
            "#",
            tag,
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeTag(tag), className: "hover:text-primary/60 transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
          ] }, tag)),
          /* @__PURE__ */ jsx("input", { id: "tags", type: "text", value: tagsInput, onChange: (e) => setTagsInput(e.target.value), onKeyDown: handleTagKeyDown, placeholder: tags.length === 0 ? "e.g. AEG, maintenance, CQB..." : "", className: "flex-1 min-w-[120px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" })
        ] })
      ] }),
      poll ? /* @__PURE__ */ jsx(PollBuilder, { value: poll, onChange: setPoll, onRemove: () => setPoll(null) }) : /* @__PURE__ */ jsxs("button", { type: "button", onClick: addPoll, className: "self-start inline-flex items-center gap-1.5 rounded border border-border px-3 py-2 label-military text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/50 transition-colors", children: [
        /* @__PURE__ */ jsx(BarChart2, { className: "h-4 w-4" }),
        "Add a Poll"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "By posting, you agree to the community rules." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Link, { to: "/feed", className: "rounded border border-border px-4 py-2 label-military text-muted-foreground hover:bg-accent transition-colors", children: "Cancel" }),
          /* @__PURE__ */ jsx("button", { type: "button", disabled: !canSubmit, className: "rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed", children: "Post" })
        ] })
      ] })
    ] })
  ] });
}
export {
  NewPostPage as component
};
