import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  thumbSrc?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  thumbSrc,
  alt,
  className,
  aspectRatio = "aspect-square",
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const displaySrc = thumbSrc ?? src;

  return (
    <div className={cn("relative overflow-hidden bg-muted/20", aspectRatio, className)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/30" />
      )}
      <img
        src={displaySrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
