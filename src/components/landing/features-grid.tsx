import { Link } from "@tanstack/react-router";
import { ShoppingBag, CalendarDays, Users, ArrowRight, Swords } from "lucide-react";

const FEATURES = [
  {
    icon: Swords,
    title: "Forum",
    description:
      "Discuss tactics, share gear reviews, post memes, and connect with the Cebu airsoft community.",
    href: "/feed",
    cta: "Browse discussions",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description:
      "Buy and sell rifles, pistols, gear, and accessories. Set up your own shop and list what you're selling.",
    href: "/marketplace",
    cta: "Browse listings",
  },
  {
    icon: CalendarDays,
    title: "Game Events",
    description:
      "Find upcoming games in Cebu. Check the location, entrance fee, and RSVP so the organizer knows you're in.",
    href: "/events",
    cta: "See upcoming games",
  },
  {
    icon: Users,
    title: "Groups & Teams",
    description:
      "Register your team or airsoft group. Get a group profile, badge your members, and build your squad's presence.",
    href: "/groups",
    cta: "Browse groups",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-12">
        <p className="label-military text-primary mb-2">Platform</p>
        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
          Everything the community needs
        </h2>
        <p className="mt-3 text-muted-foreground max-w-md">
          Built specifically for Cebu airsoft players. No more scattered group
          chats.
        </p>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="group flex flex-col gap-5 bg-card p-6 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="font-bold uppercase tracking-wide text-foreground text-sm">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <Link
                to={feature.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
              >
                {feature.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
