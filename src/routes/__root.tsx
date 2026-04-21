/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRouteWithContext,
  Link,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/shared/navigation-progress";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { sessionQueryOptions } from "@/lib/queries/session";
import appCss from "@/styles/globals.css?url";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Populate the session cache before any child beforeLoad runs so protected
  // routes can read it synchronously via queryClient.getQueryData. The
  // queryFn handles cookie forwarding on SSR; the SSR query integration
  // dehydrates the result into the HTML so the client reuses it.
  beforeLoad: ({ context }) => context.queryClient.ensureQueryData(sessionQueryOptions()),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Cebu Airsoft Hub" },
      {
        name: "description",
        content:
          "The home for airsoft players in Cebu. Find games, buy and sell gear, and connect with your team.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <AuthModalProvider>
      <RootDocument>
        <NavigationProgress />
        <Outlet />
      </RootDocument>
      <AuthModal />
      <Toaster />
    </AuthModalProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-6xl font-black uppercase tracking-tight text-primary mb-4">
        404
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Page not found. The route you requested does not exist.
      </p>
      <Link
        to="/"
        className="rounded bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
      >
        Back to base
      </Link>
    </div>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
