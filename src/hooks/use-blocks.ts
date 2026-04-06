import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-auth";
import type { BlockedUser } from "@/types";

const BLOCKS_KEY = ["blocks"] as const;

export function useBlockedUsers() {
  const { data: session } = useCurrentUser();

  return useQuery<BlockedUser[]>({
    queryKey: BLOCKS_KEY,
    queryFn: () => api.get<BlockedUser[]>("/api/blocks"),
    enabled: !!session?.user,
    staleTime: 5 * 60_000,
  });
}

export function useBlockUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.post<BlockedUser>("/api/blocks", { userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOCKS_KEY });
      // Conversations with this user will disappear on next refetch
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.delete(`/api/blocks/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOCKS_KEY });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** Returns true if the given userId is blocked by the current user */
export function useIsBlocked(userId: string | undefined) {
  const { data: blocks } = useBlockedUsers();
  if (!userId || !blocks) return false;
  return blocks.some((b) => b.blocked.id === userId);
}
