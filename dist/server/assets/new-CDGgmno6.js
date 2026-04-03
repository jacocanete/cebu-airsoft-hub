import { jsxs, jsx } from "react/jsx-runtime";
function NewEventPage() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl px-4 py-8 sm:px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-l-2 border-primary pl-3 mb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "label-military text-primary", children: "Operations" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-foreground", children: "Host a Game" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border border-border bg-card p-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "label-military text-muted-foreground", children: "Create event coming soon." }) })
  ] });
}
export {
  NewEventPage as component
};
