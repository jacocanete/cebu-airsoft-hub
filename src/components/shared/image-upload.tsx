import { useRef, useCallback, useState } from "react";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadImage, useDeleteUpload } from "@/hooks/use-uploads";
import type { Upload, UploadContext } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface ImageUploadProps {
  context: UploadContext;
  maxFiles?: number;
  value: Upload[];
  onChange: (uploads: Upload[]) => void;
  className?: string;
}

function UploadThumbnail({
  upload,
  onRemove,
}: {
  upload: Upload;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square overflow-hidden border border-border bg-muted/20 group">
      <img
        src={upload.thumbUrl ?? upload.url}
        alt={upload.filename}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${upload.filename}`}
        className="absolute right-1 top-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black focus-visible:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function UploadingSlot({ percent }: { percent: number }) {
  return (
    <div className="relative aspect-square overflow-hidden border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
      <div className="h-1 w-3/4 overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="label-military text-muted-foreground">{percent}%</span>
    </div>
  );
}

export function ImageUpload({
  context,
  maxFiles = 10,
  value,
  onChange,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, progress, isUploading, error: uploadError, reset } = useUploadImage();
  const deleteUpload = useDeleteUpload();
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isFull = value.length >= maxFiles;
  const canAdd = !isFull && !isUploading;

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, WebP, and GIF files are allowed.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "File is too large. Maximum size is 10 MB.";
    }
    return null;
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setValidationError(null);
      reset();

      const fileArray = Array.from(files);
      const remaining = maxFiles - value.length;
      const toUpload = fileArray.slice(0, remaining);

      for (const file of toUpload) {
        const err = validateFile(file);
        if (err) {
          setValidationError(err);
          return;
        }

        const result = await uploadFile(file, context);
        if (result) {
          // In single-image mode (maxFiles=1), replace existing; otherwise append.
          onChange(maxFiles === 1 ? [result] : [...value, result]);
        }
      }
    },
    [context, maxFiles, value, onChange, uploadFile, reset],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      void handleFiles(e.target.files);
      // Reset input so the same file can be re-selected after removal.
      e.target.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (canAdd && e.dataTransfer.files.length) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  function handleRemove(upload: Upload) {
    onChange(value.filter((u) => u.id !== upload.id));
    deleteUpload.mutate(upload.id);
  }

  const error = validationError ?? uploadError;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Thumbnail grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {value.map((upload) => (
            <UploadThumbnail
              key={upload.id}
              upload={upload}
              onRemove={() => handleRemove(upload)}
            />
          ))}
          {isUploading && progress && (
            <UploadingSlot percent={progress.percent} />
          )}
        </div>
      )}

      {/* Drop zone — hidden when full */}
      {!isFull && (
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          aria-label="Upload image"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed py-6 transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/10 hover:border-primary/50 hover:bg-muted/20",
            !canAdd && "cursor-not-allowed opacity-50",
          )}
        >
          {isUploading && progress && value.length === 0 ? (
            <>
              <div className="h-1 w-1/2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="label-military text-muted-foreground">
                Uploading… {progress.percent}%
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <span className="label-military text-muted-foreground">
                {dragOver
                  ? "Drop to upload"
                  : maxFiles === 1
                  ? "Click or drag to upload image"
                  : `Click or drag to upload (${value.length}/${maxFiles})`}
              </span>
              <span className="text-[11px] text-muted-foreground">
                JPEG, PNG, WebP, GIF — max 10 MB
              </span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple={maxFiles > 1}
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
