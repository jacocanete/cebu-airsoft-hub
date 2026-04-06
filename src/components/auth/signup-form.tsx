import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRegister } from "@/hooks/use-auth";

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const register = useRegister();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    register.mutate({ name, username, email, password }, { onSuccess });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="signup-name"
            className="label-military text-foreground mb-1.5 block"
          >
            Callsign
          </label>
          <input
            id="signup-name"
            type="text"
            placeholder="Ghost"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label
            htmlFor="signup-username"
            className="label-military text-foreground mb-1.5 block"
          >
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            placeholder="ghost_reaper"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="label-military text-foreground mb-1.5 block"
        >
          Email
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="label-military text-foreground mb-1.5 block"
        >
          Password
        </label>
        <div className="flex items-center gap-2">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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

      <div>
        <label
          htmlFor="signup-confirm-password"
          className="label-military text-foreground mb-1.5 block"
        >
          Confirm password
        </label>
        <div className="flex items-center gap-2">
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError && (
          <p className="mt-1 text-xs text-red-400">{passwordError}</p>
        )}
      </div>

      {register.error && (
        <p className="text-xs text-red-400">
          {register.error instanceof Error
            ? register.error.message
            : "Registration failed"}
        </p>
      )}

      <button
        type="submit"
        disabled={register.isPending}
        className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red disabled:opacity-60"
      >
        {register.isPending ? "Creating account…" : "Create account"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
