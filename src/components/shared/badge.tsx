import { cn } from "@/lib/utils";

interface BadgeProps {
  colorClass: string;
  children: React.ReactNode;
  /** "sm" matches the text-xs size used in post/event detail views;
   *  "xs" matches the text-[10px] size used in card list views. */
  size?: "sm" | "xs";
  className?: string;
}

export function Badge({ colorClass, children, size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 font-semibold uppercase tracking-wide",
        size === "sm" ? "text-xs" : "text-[10px]",
        colorClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
