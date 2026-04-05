import type { SessionUser } from "@/types";

/**
 * Returns true for MODERATOR and ADMIN — anyone who can take mod actions.
 */
export function isMod(user: SessionUser | null | undefined): boolean {
  return user?.role === "MODERATOR" || user?.role === "ADMIN";
}

/**
 * Returns true only for ADMIN — site owner / super-user actions.
 */
export function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === "ADMIN";
}

/**
 * Returns true if the user can moderate a specific piece of content —
 * i.e. they are either the content author OR a mod/admin.
 *
 * Use this for actions like delete/edit where "owner OR mod" applies.
 */
export function canModerate(
  user: SessionUser | null | undefined,
  authorId: string,
): boolean {
  if (!user) return false;
  return user.id === authorId || isMod(user);
}
