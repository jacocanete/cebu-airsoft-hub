import {
  useMutation,
  useQuery,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE } from "@/lib/query-client";
import type {
  Group,
  GroupDetail,
  GroupInviteDetail,
  GroupJoinRequestDetail,
  GroupRole,
  JoinPolicy,
  MyGroupInvite,
} from "@/types";

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => api.get("/api/groups"),
    staleTime: STALE.MEDIUM,
  });
}

export function groupDetailQueryOptions(slug: string) {
  return queryOptions<GroupDetail>({
    queryKey: ["groups", slug],
    queryFn: () => api.get(`/api/groups/${slug}`),
    staleTime: STALE.MEDIUM,
  });
}

export function useGroupDetail(slug: string) {
  return useQuery({
    ...groupDetailQueryOptions(slug),
    enabled: !!slug,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      slug: string;
      description?: string;
      joinPolicy?: JoinPolicy;
      logo?: string;
      banner?: string;
    }) => api.post<Group>("/api/groups", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useUpdateGroup(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string | null;
      logo?: string | null;
      banner?: string | null;
      joinPolicy?: JoinPolicy;
    }) => api.patch<Group>(`/api/groups/${slug}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useRequestJoinGroup(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message?: string) =>
      api.post(`/api/groups/${slug}/join-requests`, { message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups", slug] }),
  });
}

export function useGroupJoinRequests(slug: string, enabled: boolean) {
  return useQuery<GroupJoinRequestDetail[]>({
    queryKey: ["groups", slug, "join-requests"],
    queryFn: () => api.get(`/api/groups/${slug}/join-requests`),
    enabled: enabled && !!slug,
  });
}

export function useRespondToJoinRequest(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: string;
      action: "approve" | "reject";
    }) =>
      api.patch(`/api/groups/${slug}/join-requests/${requestId}`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug] });
      qc.invalidateQueries({ queryKey: ["groups", slug, "join-requests"] });
    },
  });
}

export function useGroupInvites(slug: string, enabled: boolean) {
  return useQuery<GroupInviteDetail[]>({
    queryKey: ["groups", slug, "invites"],
    queryFn: () => api.get(`/api/groups/${slug}/invites`),
    enabled: enabled && !!slug,
  });
}

export function useSendGroupInvite(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitedId: string) =>
      api.post(`/api/groups/${slug}/invites`, { invitedId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug, "invites"] });
    },
  });
}

export function useCancelGroupInvite(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      api.delete(`/api/groups/${slug}/invites/${inviteId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug, "invites"] });
    },
  });
}

export function useMyGroupInvites() {
  return useQuery<MyGroupInvite[]>({
    queryKey: ["groups", "invites", "mine"],
    queryFn: () => api.get("/api/groups/invites/mine"),
  });
}

export function useRespondToGroupInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      inviteId,
      action,
    }: {
      inviteId: string;
      action: "accept" | "decline";
    }) => api.post(`/api/groups/invites/${inviteId}/${action}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", "invites", "mine"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useLeaveGroup(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/api/groups/${slug}/membership`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useKickMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/api/groups/${slug}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug] });
    },
  });
}

export function useChangeMemberRole(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: GroupRole }) =>
      api.patch(`/api/groups/${slug}/members/${userId}`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", slug] });
    },
  });
}
