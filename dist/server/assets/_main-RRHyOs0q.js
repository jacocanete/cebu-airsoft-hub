import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { XIcon, Menu } from "lucide-react";
import { Slot, Dialog } from "radix-ui";
import { c as cn } from "./utils-H80jjgLf.js";
import { cva } from "class-variance-authority";
import "clsx";
import "tailwind-merge";
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsx(Dialog.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog.Content,
      {
        "data-slot": "sheet-content",
        "data-side": side,
        className: cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsx(Dialog.Close, { "data-slot": "sheet-close", asChild: true, children: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              className: "absolute top-3 right-3",
              size: "icon-sm",
              children: [
                /* @__PURE__ */ jsx(
                  XIcon,
                  {}
                ),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
const navLinks = [
  { href: "/feed", label: "Forum" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/events", label: "Events" },
  { href: "/groups", label: "Groups" }
];
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 shrink-0", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/logo.png",
          alt: "Detachment Reaper",
          width: 32,
          height: 32,
          className: "h-8 w-auto"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "hidden font-bold tracking-tight text-foreground sm:inline", children: "Detachment Reaper" })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "hidden flex-1 items-center gap-0.5 md:flex ml-6", children: navLinks.map((link) => /* @__PURE__ */ jsx(
      Link,
      {
        to: link.href,
        className: "label-military rounded px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground",
        activeProps: { className: "label-military rounded px-3 py-1.5 text-primary" },
        children: link.label
      },
      link.href
    )) }),
    /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-2 ml-auto", children: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/login",
          className: "label-military rounded px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground",
          children: "Log in"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/register",
          className: "rounded bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85",
          children: "Sign up"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "ml-auto md:hidden", children: /* @__PURE__ */ jsxs(Sheet, { open: mobileOpen, onOpenChange: setMobileOpen, children: [
      /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        "button",
        {
          "aria-label": "Open menu",
          className: "flex h-9 w-9 items-center justify-center rounded hover:bg-accent transition-colors",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
        }
      ) }),
      /* @__PURE__ */ jsx(
        SheetContent,
        {
          side: "right",
          className: "w-72 border-l border-border bg-background px-6 pt-10",
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/",
                className: "flex items-center gap-2.5 font-bold",
                onClick: () => setMobileOpen(false),
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: "/logo.png",
                      alt: "Detachment Reaper",
                      width: 32,
                      height: 32,
                      className: "h-8 w-auto"
                    }
                  ),
                  "Detachment Reaper"
                ]
              }
            ),
            /* @__PURE__ */ jsx("nav", { className: "flex flex-col gap-0.5", children: navLinks.map((link) => /* @__PURE__ */ jsx(
              Link,
              {
                to: link.href,
                onClick: () => setMobileOpen(false),
                className: "label-military rounded px-3 py-2.5 transition-colors hover:bg-accent hover:text-foreground",
                children: link.label
              },
              link.href
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 pt-2 border-t border-border", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/login",
                  onClick: () => setMobileOpen(false),
                  className: "rounded border border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent",
                  children: "Log in"
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/register",
                  onClick: () => setMobileOpen(false),
                  className: "rounded bg-primary px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85",
                  children: "Sign up"
                }
              )
            ] })
          ] })
        }
      )
    ] }) })
  ] }) });
}
function MainLayout() {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-background", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsx("p", { className: "label-military", children: "Detachment Reaper — Cebu Airsoft Community" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/50", children: "Lock in. Gear up. Play." })
    ] }) })
  ] });
}
export {
  MainLayout as component
};
