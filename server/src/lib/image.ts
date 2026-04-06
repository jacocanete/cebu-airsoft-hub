import sharp from "sharp";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  "image/jpeg": "webp",
  "image/png": "webp",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  size: number;
}

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const metadata = await sharp(buffer).metadata();

  // GIFs are passed through without conversion to preserve animation.
  if (metadata.format === "gif") {
    return {
      buffer,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      mimeType: "image/gif",
      size: buffer.length,
    };
  }

  const processed = await sharp(buffer)
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: processed.data,
    width: processed.info.width,
    height: processed.info.height,
    mimeType: "image/webp",
    size: processed.info.size,
  };
}

export async function generateThumbnail(
  buffer: Buffer,
  maxWidth = 300,
): Promise<ProcessedImage> {
  const metadata = await sharp(buffer).metadata();

  if (metadata.format === "gif") {
    // For GIFs just resize the first frame as a WebP thumbnail.
    const thumb = await sharp(buffer, { page: 0 })
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: thumb.data,
      width: thumb.info.width,
      height: thumb.info.height,
      mimeType: "image/webp",
      size: thumb.info.size,
    };
  }

  const thumb = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: thumb.data,
    width: thumb.info.width,
    height: thumb.info.height,
    mimeType: "image/webp",
    size: thumb.info.size,
  };
}
