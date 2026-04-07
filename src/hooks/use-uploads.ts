import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type { Upload, UploadContext } from "@/types";

interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export function useDeleteUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/uploads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }),
  });
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UseUploadImageResult {
  upload: Upload | null;
  progress: UploadProgress | null;
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File, context: UploadContext) => Promise<Upload | null>;
  reset: () => void;
}

export function useUploadImage(): UseUploadImageResult {
  const [upload, setUpload] = useState<Upload | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUpload(null);
    setProgress(null);
    setIsUploading(false);
    setError(null);
  }, []);

  const uploadFile = useCallback(
    async (file: File, context: UploadContext): Promise<Upload | null> => {
      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percent: 0 });

      try {
        // 1. Get presigned URL from API
        const presign = await api.post<PresignResponse>("/api/uploads/presign", {
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          context,
        });

        // 2. PUT file directly to storage via XHR for upload progress tracking.
        //    fetch() doesn't support upload progress events.
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", presign.uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress({
                loaded: e.loaded,
                total: e.total,
                percent: Math.round((e.loaded / e.total) * 100),
              });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Storage upload failed: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
          xhr.send(file);
        });

        setProgress({ loaded: file.size, total: file.size, percent: 100 });

        // 3. Confirm upload with API — triggers sharp processing + DB record creation
        const confirmed = await api.post<Upload>("/api/uploads/confirm", {
          key: presign.key,
          context,
          filename: file.name,
          mimeType: file.type,
        });

        setUpload(confirmed);
        return confirmed;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return { upload, progress, isUploading, error, uploadFile, reset };
}

export function useUserMedia(username: string) {
  return useQuery<Upload[]>({
    queryKey: ["uploads", "media", username],
    queryFn: () => api.get(`/api/users/${username}/media`),
    enabled: !!username,
    staleTime: STALE.MEDIUM,
  });
}
