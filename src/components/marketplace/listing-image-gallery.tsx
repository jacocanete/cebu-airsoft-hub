import { useState } from "react";
import { ImageOff } from "lucide-react";
import { PostImageSlider } from "@/components/shared/post-image-slider";
import { ImageLightbox } from "@/components/shared/image-lightbox";

interface ListingImageGalleryProps {
  images: string[];
  title: string;
}

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  return (
    <>
      <PostImageSlider
        images={images}
        alt={title}
        onImageClick={(i) => { setLightboxIndex(i); setLightboxOpen(true); }}
      />
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        alt={title}
      />
    </>
  );
}
