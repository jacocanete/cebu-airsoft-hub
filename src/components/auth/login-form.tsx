import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="login-email"
          className="label-military text-foreground mb-1.5 block"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="operator@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="label-military text-foreground mb-1.5 block"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
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
        className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red disabled:opacity-60"
      >
        {login.isPending ? "Signing in…" : "Sign in"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
