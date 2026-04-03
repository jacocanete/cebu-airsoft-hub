import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [{ title: "Login | Detachment Reaper" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-6">
            <img
              src="/hero-logo.png"
              alt="Detachment Reaper"
              width={64}
              height={64}
              className="h-16 w-16 mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="label-military text-foreground mb-1.5 block"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="operator@example.com"
              autoComplete="email"
              className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="label-military text-foreground"
              >
                Password
              </label>
              <button
                type="button"
                className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
              >
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Register
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="label-military text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
