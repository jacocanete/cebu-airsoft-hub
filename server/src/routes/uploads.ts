import { Router } from "express";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import {
  getPresignedUploadUrl,
  getPublicUrl,
  getObject,
  putObject,
  deleteObjects,
  headObject,
} from "../lib/r2.js";
import {
  isAllowedMimeType,
  MIME_TO_EXT,
  MAX_FILE_SIZE,
  processImage,
  generateThumbnail,
} from "../lib/image.js";


const router = Router();

const UPLOAD_CONTEXT_VALUES = [
  "AVATAR",
  "COVER_PHOTO",
  "POST_IMAGE",
  "LISTING_IMAGE",
  "GROUP_LOGO",
  "GROUP_BANNER",
] as const;

// ---------------------------------------------------------------------------
// POST /api/uploads/presign
// ---------------------------------------------------------------------------

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().int().positive(),
  context: z.enum(UPLOAD_CONTEXT_VALUES),
});

router.post("/presign", requireAuth, async (req: AuthRequest, res) => {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { filename, mimeType, size, context } = parsed.data;
  const userId = req.user!.id;

  if (!isAllowedMimeType(mimeType)) {
    res.status(400).json({ error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." });
    return;
  }

  if (size > MAX_FILE_SIZE) {
    res.status(400).json({ error: "File too large. Maximum size is 10 MB." });
    return;
  }

  const ext = MIME_TO_EXT[mimeType];
  const id = createId();
  const key = `${context.toLowerCase()}/${userId}/${id}.${ext}`;
  const publicUrl = getPublicUrl(key);

  const uploadUrl = await getPresignedUploadUrl(key, mimeType);

  res.json({ uploadUrl, key, publicUrl });
});

// ---------------------------------------------------------------------------
// POST /api/uploads/confirm
// ---------------------------------------------------------------------------

const confirmSchema = z.object({
  key: z.string().min(1),
  context: z.enum(UPLOAD_CONTEXT_VALUES),
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
});

router.post("/confirm", requireAuth, async (req: AuthRequest, res) => {
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { key, context, filename, mimeType } = parsed.data;
  const userId = req.user!.id;

  // Verify the key belongs to this user — key pattern: {context}/{userId}/{id}.{ext}
  const keyParts = key.split("/");
  if (keyParts.length < 3 || keyParts[1] !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Verify the object actually exists in storage
  let headResult;
  try {
    headResult = await headObject(key);
  } catch {
    res.status(422).json({ error: "Upload not found in storage. Complete the upload first." });
    return;
  }

  const rawSize = headResult.ContentLength ?? 0;

  // Download the object to process with sharp
  const getResult = await getObject(key);
  const stream = getResult.Body;
  if (!stream) {
    res.status(500).json({ error: "Failed to retrieve uploaded file." });
    return;
  }

  // Collect stream into buffer
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  const rawBuffer = Buffer.concat(chunks);

  // Process original (convert to WebP, get dimensions)
  let processed;
  try {
    processed = await processImage(rawBuffer);
  } catch {
    res.status(422).json({ error: "Failed to process image. File may be corrupt." });
    return;
  }

  // Overwrite the original with the processed version
  await putObject(key, processed.buffer, processed.mimeType);

  // Generate and upload thumbnail
  const thumbId = createId();
  const thumbExt = "webp";
  const contextDir = context.toLowerCase();
  const thumbKey = `${contextDir}/${userId}/${thumbId}-thumb.${thumbExt}`;

  let thumb;
  try {
    thumb = await generateThumbnail(rawBuffer);
  } catch {
    // Non-fatal: proceed without thumbnail
    thumb = null;
  }

  if (thumb) {
    await putObject(thumbKey, thumb.buffer, thumb.mimeType);
  }

  const url = getPublicUrl(key);
  const thumbUrl = thumb ? getPublicUrl(thumbKey) : null;

  const upload = await prisma.upload.create({
    data: {
      key,
      thumbKey: thumb ? thumbKey : null,
      url,
      thumbUrl,
      filename,
      mimeType: processed.mimeType,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      // context is validated by Zod against the enum values; the cast is safe
      context: context as "AVATAR" | "COVER_PHOTO" | "POST_IMAGE" | "LISTING_IMAGE" | "GROUP_LOGO" | "GROUP_BANNER",
      uploaderId: userId,
    },
  });

  res.status(201).json(upload);
});

// ---------------------------------------------------------------------------
// DELETE /api/uploads/:id
// ---------------------------------------------------------------------------

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params as { id: string };

  const upload = await prisma.upload.findUnique({
    where: { id },
    select: { id: true, uploaderId: true, key: true, thumbKey: true },
  });

  if (!upload) {
    res.status(404).json({ error: "Upload not found" });
    return;
  }

  if (upload.uploaderId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const keysToDelete = [upload.key, ...(upload.thumbKey ? [upload.thumbKey] : [])];
  await deleteObjects(keysToDelete);
  await prisma.upload.delete({ where: { id } });

  res.status(204).end();
});

export default router;
