import { Link } from "@tanstack/react-router";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
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
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
