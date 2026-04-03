import { jsxs, jsx } from "react/jsx-runtime";
function PageHeader({ eyebrow, title, description }) {
  return /* @__PURE__ */ jsxs("div", { className: "border-l-2 border-primary pl-3", children: [
    /* @__PURE__ */ jsx("p", { className: "label-military text-primary", children: eyebrow }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-foreground", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })
  ] });
}
export {
  PageHeader as P
};
