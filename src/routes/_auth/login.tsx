import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";
import { AuthHeader } from "@/components/shared/auth-header";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [{ title: "Login | Detachment Reaper" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "",
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          if (redirect) {
            window.location.href = redirect;
          } else {
            navigate({ to: "/feed" });
          }
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <AuthHeader title="Welcome back" subtitle="Sign in to your account" />

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
          </div>

          {login.error && (
            <p className="text-xs text-red-400">
              {login.error instanceof Error
                ? login.error.message
                : "Invalid credentials"}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red disabled:opacity-60"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
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
