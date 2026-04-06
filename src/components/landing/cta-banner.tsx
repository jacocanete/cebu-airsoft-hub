import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-card">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-primary" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
        <p className="label-military text-primary mb-3">Ready to deploy?</p>
        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
          Lock in. Gear up. Play.
        </h2>
        <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
          Create a free account and start connecting with Cebu&apos;s airsoft
          community.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red"
          >
            Create an account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/feed"
            search={{ tag: undefined, sort: "new", category: "All" }}
            className="inline-flex items-center gap-2 rounded border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:border-primary/50"
          >
            Browse as guest
          </Link>
        </div>
      </div>
    </section>
  );
}
