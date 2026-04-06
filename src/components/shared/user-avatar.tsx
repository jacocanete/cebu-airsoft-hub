import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
  "2xl": "h-24 w-24 text-2xl",
} as const;

type AvatarSize = keyof typeof sizeClasses;

interface UserAvatarProps {
  name: string;
  username?: string;
  avatar?: string;
  size?: AvatarSize;
  linkToProfile?: boolean;
  className?: string;
}

function AvatarBox({
  name,
  avatar,
  size = "md",
  className,
}: {
  name: string;
  avatar?: string;
  size?: AvatarSize;
  className?: string;
}) {
  if (avatar) {
    return (
      <div
        className={cn(
          "shrink-0 overflow-hidden border border-border",
          sizeClasses[size],
          className,
        )}
      >
        <img
          src={avatar}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-border bg-primary/10 font-black text-primary",
        sizeClasses[size],
        className,
      )}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

export function UserAvatar({
  name,
  username,
  avatar,
  size = "md",
  linkToProfile = false,
  className,
}: UserAvatarProps) {
  if (linkToProfile && username) {
    return (
      <Link
        to="/profile/$username"
        params={{ username }}
        className="hover:opacity-80 transition-opacity"
      >
        <AvatarBox name={name} avatar={avatar} size={size} className={className} />
      </Link>
    );
  }

  return <AvatarBox name={name} avatar={avatar} size={size} className={className} />;
}
