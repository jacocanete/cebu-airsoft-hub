import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../prisma.js";

export type Role = "USER" | "MODERATOR" | "ADMIN";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: Role;
  };
  session?: { id: string };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const raw = session.user as {
    id: string;
    email: string;
    name: string;
    username?: string;
    role?: string;
  };

  const role = isValidRole(raw.role) ? raw.role : "USER";

  // Enforce account-level bans. Check for an active (non-expired, non-lifted) ban.
  const activeBan = await prisma.ban.findFirst({
    where: {
      userId: raw.id,
      liftedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { reason: true, expiresAt: true },
  });

  if (activeBan) {
    const until = activeBan.expiresAt
      ? ` until ${activeBan.expiresAt.toISOString()}`
      : " permanently";
    res.status(403).json({
      error: "Account banned",
      reason: activeBan.reason,
      bannedUntil: activeBan.expiresAt?.toISOString() ?? null,
      message: `Your account has been banned${until}: ${activeBan.reason}`,
    });
    return;
  }

  req.user = {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    username: raw.username ?? "",
    role,
  };
  req.session = { id: session.session.id };
  next();
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session) {
    const raw = session.user as {
      id: string;
      email: string;
      name: string;
      username?: string;
      role?: string;
    };

    req.user = {
      id: raw.id,
      email: raw.email,
      name: raw.name,
      username: raw.username ?? "",
      role: isValidRole(raw.role) ? raw.role : "USER",
    };
    req.session = { id: session.session.id };
  }
  next();
}

/**
 * Middleware factory that restricts access to users with one of the given roles.
 * Always chained AFTER requireAuth so req.user is guaranteed.
 *
 * Usage:
 *   router.delete("/:id", requireAuth, requireRole("MODERATOR", "ADMIN"), handler)
 */
export function requireRole(...allowed: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Role helpers — used inside route handlers for ownership-OR-role checks
// ---------------------------------------------------------------------------

export function isMod(user: AuthRequest["user"]): boolean {
  return user?.role === "MODERATOR" || user?.role === "ADMIN";
}

export function isAdmin(user: AuthRequest["user"]): boolean {
  return user?.role === "ADMIN";
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

const VALID_ROLES: Role[] = ["USER", "MODERATOR", "ADMIN"];

function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && VALID_ROLES.includes(value as Role);
}
