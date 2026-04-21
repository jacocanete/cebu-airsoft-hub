import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  md: "h-16 w-16 text-lg",
  lg: "h-20 w-20 text-xl",
  "2xl": "h-24 w-24 text-2xl",
} as const;

type LogoSize = keyof typeof sizeClasses;

export function GroupLogo({
  name,
  logo,
  size = "md",
  className,
}: {
  name: string;
  logo?: string | null;
  size?: LogoSize;
  className?: string;
}) {
  if (logo) {
    return (
      <div
        className={cn(
          "shrink-0 overflow-hidden border border-border bg-muted",
          sizeClasses[size],
          className,
        )}
      >
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary",
        sizeClasses[size],
        className,
      )}
      aria-label={`${name} logo`}
    >
      <Shield className="h-1/2 w-1/2" />
    </div>
  );
}
