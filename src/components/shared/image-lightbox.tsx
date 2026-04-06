import { useEffect, useCallback, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alt?: string;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  alt = "Image",
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const hasMultiple = images.length > 1;

  // Sync index when initialIndex or open changes
  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, prev, next]);

  const src = images[index];
  if (!src) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        {/* Content */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-center justify-center duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            Image viewer
          </DialogPrimitive.Title>

          {/* Close */}
          <DialogPrimitive.Close
            aria-label="Close image viewer"
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          {/* Prev */}
          {hasMultiple && (
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <img
            key={src}
            src={src}
            alt={`${alt} ${index + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
            draggable={false}
          />

          {/* Next */}
          {hasMultiple && (
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Counter */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white tabular-nums">
              {index + 1} / {images.length}
            </div>
          )}

          {/* Thumbnail strip for multi-image */}
          {hasMultiple && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 px-4">
              {images.map((thumb, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "h-10 w-10 shrink-0 overflow-hidden border-2 transition-all",
                    i === index
                      ? "border-white opacity-100"
                      : "border-transparent opacity-50 hover:opacity-75",
                  )}
                >
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
