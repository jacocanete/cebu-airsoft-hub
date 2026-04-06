import { useState } from "react";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

interface ListingImageGalleryProps {
  images: string[];
  title: string;
}

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="border border-border bg-card overflow-hidden">
        <div className="aspect-[4/3] w-full bg-muted/20 flex flex-col items-center justify-center gap-2">
          <ImageOff className="h-10 w-10 text-muted-foreground/30" />
          <span className="label-military text-muted-foreground/40">No images</span>
        </div>
      </div>
    );
  }

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < images.length - 1;

  return (
    <div className="border border-border bg-card overflow-hidden">
      {/* Main image */}
      <div className="relative aspect-[4/3] w-full bg-muted/20 overflow-hidden group">
        <img
          src={images[selectedIndex]}
          alt={`${title} — image ${selectedIndex + 1} of ${images.length}`}
          className="h-full w-full object-cover"
        />

        {/* Navigation arrows — only shown when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
              disabled={!hasPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={!hasNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Image counter */}
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white tabular-nums">
              {selectedIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto p-2 border-t border-border bg-muted/10">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === selectedIndex ? "true" : undefined}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-colors ${
                i === selectedIndex
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
