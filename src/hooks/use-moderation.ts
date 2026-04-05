import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------
// Post mod mutations
// ---------------------------------------------------------------------------

export function useRemovePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      api.delete(`/api/posts/${postId}`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

export function useRestorePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/api/posts/${postId}/restore`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

export function usePinPost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/api/posts/${postId}/pin`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

export function useLockPost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/api/posts/${postId}/lock`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

// Author self-delete uses the same DELETE endpoint but with no body
export function useDeletePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/api/posts/${postId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Comment mod mutations
// ---------------------------------------------------------------------------

export function useRemoveComment(postId: string, commentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      api.delete(`/api/posts/${postId}/comments/${commentId}`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useRestoreComment(postId: string, commentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch(`/api/posts/${postId}/comments/${commentId}/restore`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useDeleteComment(postId: string, commentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.delete(`/api/posts/${postId}/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}
