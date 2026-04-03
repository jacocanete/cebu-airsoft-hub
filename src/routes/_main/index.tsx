import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { CtaBanner } from "@/components/landing/cta-banner";

export const Route = createFileRoute("/_main/")({
  head: () => ({
    meta: [{ title: "Detachment Reaper — Cebu Airsoft Community" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatsBar />
      <FeaturesGrid />
      <CtaBanner />
    </div>
  );
}
