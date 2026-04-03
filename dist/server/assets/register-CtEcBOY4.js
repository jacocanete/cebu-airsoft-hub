import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
function RegisterPage() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-block mb-6", children: /* @__PURE__ */ jsx("img", { src: "/hero-logo.png", alt: "Detachment Reaper", width: 64, height: 64, className: "h-16 w-16 mx-auto" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-foreground", children: "Join the ranks" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Create your operator account" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "label-military text-foreground mb-1.5 block", children: "Callsign" }),
          /* @__PURE__ */ jsx("input", { id: "name", type: "text", placeholder: "Ghost", autoComplete: "name", className: "h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "username", className: "label-military text-foreground mb-1.5 block", children: "Username" }),
          /* @__PURE__ */ jsx("input", { id: "username", type: "text", placeholder: "ghost_reaper", autoComplete: "username", className: "h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "label-military text-foreground mb-1.5 block", children: "Email" }),
        /* @__PURE__ */ jsx("input", { id: "email", type: "email", placeholder: "operator@example.com", autoComplete: "email", className: "h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "label-military text-foreground mb-1.5 block", children: "Password" }),
        /* @__PURE__ */ jsx("input", { id: "password", type: "password", placeholder: "••••••••", autoComplete: "new-password", className: "h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "confirm-password", className: "label-military text-foreground mb-1.5 block", children: "Confirm password" }),
        /* @__PURE__ */ jsx("input", { id: "confirm-password", type: "password", placeholder: "••••••••", autoComplete: "new-password", className: "h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "submit", className: "mt-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red", children: [
        "Create account",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-semibold text-primary hover:text-primary/80 transition-colors", children: "Sign in" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "label-military text-muted-foreground/50 hover:text-muted-foreground transition-colors", children: "← Back to home" }) })
  ] }) });
}
export {
  RegisterPage as component
};
