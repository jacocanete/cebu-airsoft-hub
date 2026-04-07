import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type { AuditLogEntry, AuditAction, ModerationTarget } from "@/types";

interface AuditFilters {
  action?: AuditAction;
  targetType?: ModerationTarget;
  actorId?: string;
  cursor?: string;
  limit?: number;
}

interface AuditPage {
  entries: AuditLogEntry[];
  nextCursor: string | null;
}

/** Public modlog — only public=true entries */
export function usePublicAuditLog(filters?: AuditFilters) {
  const params = new URLSearchParams();
  if (filters?.action) params.set("action", filters.action);
  if (filters?.targetType) params.set("targetType", filters.targetType);
  if (filters?.cursor) params.set("cursor", filters.cursor);
  if (filters?.limit) params.set("limit", String(filters.limit));

  return useQuery<AuditPage>({
    queryKey: ["audit", "public", filters],
    queryFn: () => api.get<AuditPage>(`/api/audit${params.size ? `?${params}` : ""}`),
    staleTime: STALE.MEDIUM,
  });
}

/** Mod-only audit log — all entries including private */
export function useModAuditLog(filters?: AuditFilters) {
  const params = new URLSearchParams();
  if (filters?.action) params.set("action", filters.action);
  if (filters?.targetType) params.set("targetType", filters.targetType);
  if (filters?.actorId) params.set("actorId", filters.actorId);
  if (filters?.cursor) params.set("cursor", filters.cursor);
  if (filters?.limit) params.set("limit", String(filters.limit));

  return useQuery<AuditPage>({
    queryKey: ["audit", "mod", filters],
    queryFn: () => api.get<AuditPage>(`/api/audit/mod${params.size ? `?${params}` : ""}`),
    // Omitting staleTime — falls through to STALE.SHORT global default.
  });
}
