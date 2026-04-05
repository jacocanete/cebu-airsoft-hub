const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year",   365 * 24 * 60 * 60],
  ["month",   30 * 24 * 60 * 60],
  ["week",     7 * 24 * 60 * 60],
  ["day",          24 * 60 * 60],
  ["hour",              60 * 60],
  ["minute",                 60],
  ["second",                  1],
];

export function formatRelativeTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  for (const [unit, secInUnit] of UNITS) {
    if (Math.abs(diffSec) >= secInUnit || unit === "second") {
      return rtf.format(Math.round(diffSec / secInUnit), unit);
    }
  }
  return rtf.format(0, "second");
}
