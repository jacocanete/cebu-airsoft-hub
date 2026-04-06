import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostImageSliderProps {
  images: string[];
  alt: string;
  onImageClick?: (index: number) => void;
}

export function PostImageSlider({ images, alt, onImageClick }: PostImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onImageClick?.(0)}
        aria-label="View full size"
        className="flex h-[480px] w-full items-center justify-center overflow-hidden border border-border bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <img
          src={images[0]}
          alt={`${alt} — image 1`}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden border border-border bg-muted/10 group">
      {/* Slides */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <button
                type="button"
                onClick={() => onImageClick?.(i)}
                aria-label={`View image ${i + 1} of ${images.length} full size`}
                className="flex h-[480px] w-full items-center justify-center bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <img
                  src={src}
                  alt={`${alt} — image ${i + 1} of ${images.length}`}
                  className="h-full w-full object-contain"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        aria-label="Previous image"
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity",
          canScrollPrev ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        aria-label="Next image"
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity",
          canScrollNext ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to image ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === selectedIndex
                ? "w-4 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/75",
            )}
          />
        ))}
      </div>

      {/* Counter */}
      <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white tabular-nums">
        {selectedIndex + 1} / {images.length}
      </span>
    </div>
  );
}
