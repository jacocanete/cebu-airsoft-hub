const STATS = [
  { label: "Operators", barWidth: "w-16", rotation: "-rotate-1" },
  { label: "Games Hosted", barWidth: "w-20", rotation: "rotate-[0.5deg]" },
  { label: "Gear Listings", barWidth: "w-14", rotation: "-rotate-[0.8deg]" },
  { label: "Active Units", barWidth: "w-[72px]", rotation: "rotate-1" },
];

export function StatsBar() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center px-6 py-7 gap-2"
            >
              <dt className="flex flex-col items-center gap-1.5">
                <span
                  className={`relative block h-5 ${stat.barWidth} ${stat.rotation}`}
                  aria-label="redacted"
                  style={{
                    background:
                      "linear-gradient(180deg, #d4d4d4 0%, #e8e8e8 40%, #c8c8c8 100%)",
                    clipPath:
                      "polygon(0% 15%, 1% 0%, 3% 8%, 5% 2%, 7% 10%, 9% 1%, 11% 7%, 13% 0%, 15% 9%, 17% 2%, 100% 2%, 99% 20%, 98% 5%, 97% 18%, 96% 3%, 95% 15%, 94% 2%, 93% 12%, 92% 0%, 91% 10%, 90% 0%, 90% 85%, 91% 100%, 93% 92%, 95% 100%, 97% 88%, 99% 100%, 100% 80%, 100% 100%, 0% 100%, 0% 85%)",
                    boxShadow:
                      "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                />
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground/30 uppercase">
                  [redacted]
                </span>
              </dt>
              <dd className="label-military">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
