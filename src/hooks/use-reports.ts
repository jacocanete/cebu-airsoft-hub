import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Report, ModerationTarget, ReportCategory } from "@/types";

interface ReportFilters {
  status?: string;
  targetType?: ModerationTarget;
  category?: ReportCategory;
  cursor?: string;
  limit?: number;
}

interface ReportsPage {
  reports: Report[];
  nextCursor: string | null;
}

export function useReports(filters?: ReportFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.targetType) params.set("targetType", filters.targetType);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.cursor) params.set("cursor", filters.cursor);
  if (filters?.limit) params.set("limit", String(filters.limit));

  return useQuery<ReportsPage>({
    queryKey: ["reports", filters],
    queryFn: () => api.get<ReportsPage>(`/api/reports${params.size ? `?${params}` : ""}`),
    staleTime: 30_000,
  });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: {
      targetType: ModerationTarget;
      targetId: string;
      category: ReportCategory;
      reason?: string;
    }) => api.post("/api/reports", data),
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "dismiss" | "action_taken";
      note?: string;
    }) => api.patch(`/api/reports/${id}/resolve`, { action, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
