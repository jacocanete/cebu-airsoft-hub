import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="flex items-center gap-2">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
