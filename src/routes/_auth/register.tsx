import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({
    meta: [{ title: "Register | Detachment Reaper" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
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
            Join the ranks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your operator account
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="name"
                className="label-military text-foreground mb-1.5 block"
              >
                Callsign
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ghost"
                autoComplete="name"
                className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="label-military text-foreground mb-1.5 block"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="ghost_reaper"
                autoComplete="username"
                className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="label-military text-foreground mb-1.5 block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="label-military text-foreground mb-1.5 block"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red"
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
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
