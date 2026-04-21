import { prisma } from "../prisma.js";

export type GroupRole = "MEMBER" | "ADMIN" | "OWNER";

export async function getGroupRole(
  userId: string,
  groupId: string,
): Promise<GroupRole | null> {
  const m = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { role: true },
  });
  return m?.role ?? null;
}

export function isGroupStaffRole(role: GroupRole | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export async function isGroupStaff(
  userId: string,
  groupId: string,
): Promise<boolean> {
  return isGroupStaffRole(await getGroupRole(userId, groupId));
}

export async function isGroupMember(
  userId: string,
  groupId: string,
): Promise<boolean> {
  const m = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { userId: true },
  });
  return !!m;
}
