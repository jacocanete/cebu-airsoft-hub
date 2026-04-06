import { Link } from "@tanstack/react-router";
import { FileText, ShoppingBag, Crosshair, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageEmbed as MessageEmbedType } from "@/types";

const EMBED_CONFIG = {
  post: {
    Icon: FileText,
    label: "Forum Post",
    borderClass: "border-l-blue-500",
    iconClass: "text-blue-400",
  },
  listing: {
    Icon: ShoppingBag,
    label: "Marketplace",
    borderClass: "border-l-green-500",
    iconClass: "text-green-400",
  },
  event: {
    Icon: Crosshair,
    label: "Game Event",
    borderClass: "border-l-primary",
    iconClass: "text-primary",
  },
  group: {
    Icon: Users,
    label: "Group",
    borderClass: "border-l-purple-500",
    iconClass: "text-purple-400",
  },
} as const;

interface MessageEmbedProps {
  embed: MessageEmbedType;
}

export function MessageEmbed({ embed }: MessageEmbedProps) {
  const config = EMBED_CONFIG[embed.type];

  return (
    <Link
      to={embed.url as string}
      className={cn(
        "mt-2 flex items-start gap-3 rounded border border-border bg-background/60 p-3",
        "border-l-2 transition-colors hover:bg-accent",
        config.borderClass,
      )}
    >
      {embed.image ? (
        <img
          src={embed.image}
          alt=""
          className="h-12 w-12 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-accent">
          <config.Icon className={cn("h-4 w-4", config.iconClass)} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="label-military mb-0.5">{config.label}</p>
        <p className="truncate text-sm font-medium text-foreground">
          {embed.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {embed.description}
        </p>
      </div>
    </Link>
  );
}
