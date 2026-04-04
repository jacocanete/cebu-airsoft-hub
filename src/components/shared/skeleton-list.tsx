interface SkeletonListProps {
  count?: number;
  height?: string;
  className?: string;
}

export function SkeletonList({ count = 5, height = "h-20", className = "" }: SkeletonListProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} rounded border border-border bg-card animate-pulse`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = "h-96" }: { height?: string }) {
  return <div className={`${height} rounded border border-border bg-card animate-pulse`} />;
}
