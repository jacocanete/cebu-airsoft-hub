import { createRootRoute, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter as createRouter$1 } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
const appCss = "/assets/globals-DfsQqcXg.css";
const Route$k = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      { title: "Detachment Reaper — Cebu Airsoft Community" },
      {
        name: "description",
        content: "The home for airsoft players in Cebu. Find games, buy and sell gear, and connect with your team."
      }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  component: RootComponent,
  notFoundComponent: NotFound
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function NotFound() {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center bg-background text-center px-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-6xl font-black uppercase tracking-tight text-primary mb-4", children: "404" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Page not found. The route you requested does not exist." }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "rounded bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85",
        children: "Back to base"
      }
    )
  ] });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "h-full antialiased dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "min-h-full flex flex-col", children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$j = () => import("./_main-RRHyOs0q.js");
const Route$j = createFileRoute("/_main")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./_auth-BIPa6fIa.js");
const Route$i = createFileRoute("/_auth")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./index-CWy00JFe.js");
const Route$h = createFileRoute("/_main/")({
  head: () => ({
    meta: [{
      title: "Detachment Reaper — Cebu Airsoft Community"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./settings-Bq7snBj5.js");
const Route$g = createFileRoute("/_main/settings")({
  head: () => ({
    meta: [{
      title: "Settings | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./register-CtEcBOY4.js");
const Route$f = createFileRoute("/_auth/register")({
  head: () => ({
    meta: [{
      title: "Register | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./login-DkPYgK95.js");
const Route$e = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [{
      title: "Login | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./index-DjAAU6x7.js");
const Route$d = createFileRoute("/_main/marketplace/")({
  head: () => ({
    meta: [{
      title: "Marketplace | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./index-Czgk1VXY.js");
const Route$c = createFileRoute("/_main/groups/")({
  head: () => ({
    meta: [{
      title: "Groups | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./index-BeKwHSRw.js");
const Route$b = createFileRoute("/_main/feed/")({
  head: () => ({
    meta: [{
      title: "Forum | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./index-CdzOmRby.js");
const Route$a = createFileRoute("/_main/events/")({
  head: () => ({
    meta: [{
      title: "Events | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_username-DnQyBxmP.js");
const Route$9 = createFileRoute("/_main/profile/$username")({
  head: () => ({
    meta: [{
      title: "Profile | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./new-B9TIHFHi.js");
const Route$8 = createFileRoute("/_main/marketplace/new")({
  head: () => ({
    meta: [{
      title: "Sell an Item | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_id-BLhVbJgH.js");
const Route$7 = createFileRoute("/_main/marketplace/$id")({
  head: () => ({
    meta: [{
      title: "Listing | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./new-Dabpxs0i.js");
const Route$6 = createFileRoute("/_main/groups/new")({
  head: () => ({
    meta: [{
      title: "Register a Group | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_slug-B9zkOMcR.js");
const Route$5 = createFileRoute("/_main/groups/$slug")({
  head: () => ({
    meta: [{
      title: "Group | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./search-B7N3E93J.js");
const Route$4 = createFileRoute("/_main/feed/search")({
  validateSearch: (search) => ({
    q: search.q || ""
  }),
  head: () => ({
    meta: [{
      title: "Search | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./new-DjlOaFEb.js");
const Route$3 = createFileRoute("/_main/feed/new")({
  head: () => ({
    meta: [{
      title: "Create Post | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_id-D7EptCdo.js");
const Route$2 = createFileRoute("/_main/feed/$id")({
  head: () => ({
    meta: [{
      title: "Post | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./new-CDGgmno6.js");
const Route$1 = createFileRoute("/_main/events/new")({
  head: () => ({
    meta: [{
      title: "Host a Game | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_id-DwjUaplD.js");
const Route = createFileRoute("/_main/events/$id")({
  head: () => ({
    meta: [{
      title: "Event | Detachment Reaper"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const MainRoute = Route$j.update({
  id: "/_main",
  getParentRoute: () => Route$k
});
const AuthRoute = Route$i.update({
  id: "/_auth",
  getParentRoute: () => Route$k
});
const MainIndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => MainRoute
});
const MainSettingsRoute = Route$g.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => MainRoute
});
const AuthRegisterRoute = Route$f.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => AuthRoute
});
const AuthLoginRoute = Route$e.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => AuthRoute
});
const MainMarketplaceIndexRoute = Route$d.update({
  id: "/marketplace/",
  path: "/marketplace/",
  getParentRoute: () => MainRoute
});
const MainGroupsIndexRoute = Route$c.update({
  id: "/groups/",
  path: "/groups/",
  getParentRoute: () => MainRoute
});
const MainFeedIndexRoute = Route$b.update({
  id: "/feed/",
  path: "/feed/",
  getParentRoute: () => MainRoute
});
const MainEventsIndexRoute = Route$a.update({
  id: "/events/",
  path: "/events/",
  getParentRoute: () => MainRoute
});
const MainProfileUsernameRoute = Route$9.update({
  id: "/profile/$username",
  path: "/profile/$username",
  getParentRoute: () => MainRoute
});
const MainMarketplaceNewRoute = Route$8.update({
  id: "/marketplace/new",
  path: "/marketplace/new",
  getParentRoute: () => MainRoute
});
const MainMarketplaceIdRoute = Route$7.update({
  id: "/marketplace/$id",
  path: "/marketplace/$id",
  getParentRoute: () => MainRoute
});
const MainGroupsNewRoute = Route$6.update({
  id: "/groups/new",
  path: "/groups/new",
  getParentRoute: () => MainRoute
});
const MainGroupsSlugRoute = Route$5.update({
  id: "/groups/$slug",
  path: "/groups/$slug",
  getParentRoute: () => MainRoute
});
const MainFeedSearchRoute = Route$4.update({
  id: "/feed/search",
  path: "/feed/search",
  getParentRoute: () => MainRoute
});
const MainFeedNewRoute = Route$3.update({
  id: "/feed/new",
  path: "/feed/new",
  getParentRoute: () => MainRoute
});
const MainFeedIdRoute = Route$2.update({
  id: "/feed/$id",
  path: "/feed/$id",
  getParentRoute: () => MainRoute
});
const MainEventsNewRoute = Route$1.update({
  id: "/events/new",
  path: "/events/new",
  getParentRoute: () => MainRoute
});
const MainEventsIdRoute = Route.update({
  id: "/events/$id",
  path: "/events/$id",
  getParentRoute: () => MainRoute
});
const AuthRouteChildren = {
  AuthLoginRoute,
  AuthRegisterRoute
};
const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
const MainRouteChildren = {
  MainSettingsRoute,
  MainIndexRoute,
  MainEventsIdRoute,
  MainEventsNewRoute,
  MainFeedIdRoute,
  MainFeedNewRoute,
  MainFeedSearchRoute,
  MainGroupsSlugRoute,
  MainGroupsNewRoute,
  MainMarketplaceIdRoute,
  MainMarketplaceNewRoute,
  MainProfileUsernameRoute,
  MainEventsIndexRoute,
  MainFeedIndexRoute,
  MainGroupsIndexRoute,
  MainMarketplaceIndexRoute
};
const MainRouteWithChildren = MainRoute._addFileChildren(MainRouteChildren);
const rootRouteChildren = {
  AuthRoute: AuthRouteWithChildren,
  MainRoute: MainRouteWithChildren
};
const routeTree = Route$k._addFileChildren(rootRouteChildren)._addFileTypes();
function createRouter() {
  return createRouter$1({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true
  });
}
function getRouter() {
  return createRouter();
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createRouter,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$4 as R,
  router as r
};
