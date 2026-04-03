import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CircularText } from "@/components/ui/circular-text";
import { LetterGlitch } from "@/components/ui/letter-glitch";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-primary z-10" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <LetterGlitch
          glitchColors={["#e90003", "#3a3a3a", "#a9a9a9"]}
          glitchSpeed={55}
          outerVignette={true}
          centerVignette={false}
          smooth={true}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <div className="flex flex-col items-center gap-12 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:py-0 lg:min-h-[640px]">
          <div className="w-full max-w-xl lg:py-24">
            <div className="mb-5 inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="label-military text-primary">
                Cebu Airsoft Community
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl uppercase leading-[0.9] mb-6">
              One home
              <br />
              <span className="text-primary">for Cebu</span>
              <br />
              airsoft.
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
              Discuss, buy, sell, and play. Detachment Reaper is the community
              hub for airsoft players in Cebu — find games near you, gear up
              from fellow players, and connect with your team.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red"
              >
                Join the community
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:border-primary/50"
              >
                Find a game
              </Link>
            </div>
          </div>

          <div
            className="relative flex-shrink-0 flex items-center justify-center lg:py-16"
            style={{ width: 560, height: 560 }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, oklch(0.45 0.27 25 / 22%) 0%, transparent 65%)",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <CircularText
                text="Detachment Reaper - Cebu Airsoft Community - "
                spinDuration={22}
                onHover="speedUp"
                radius={130}
                fontSize={26}
                className="text-primary/80"
              />
            </div>

            <img
              src="/hero-logo.png"
              alt="Detachment Reaper"
              width={560}
              height={560}
              className="h-[560px] w-auto object-contain drop-shadow-[0_0_48px_oklch(0.45_0.27_25_/_0.5)] pointer-events-none relative z-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
