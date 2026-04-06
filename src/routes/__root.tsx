/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRouteWithContext,
  Link,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/shared/navigation-progress";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import appCss from "@/styles/globals.css?url";
import type { Session } from "@/types";

export interface RouterContext {
  session: Session | null;
}



export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    try {
      const session = await api.get<Session>("/api/auth/get-session");
      return { session };
    } catch {
      return { session: null };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Detachment Reaper — Cebu Airsoft Community" },
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
    <QueryClientProvider client={queryClient}>
      <AuthModalProvider>
        <RootDocument>
          <NavigationProgress />
          <Outlet />
        </RootDocument>
        <AuthModal />
        <Toaster />
      </AuthModalProvider>
    </QueryClientProvider>
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
