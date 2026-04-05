import { Router } from "express";
import type { AuditAction, ModerationTarget } from "@prisma/client";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

const auditSelect = {
  id: true,
  action: true,
  targetType: true,
  targetId: true,
  reason: true,
  metadata: true,
  public: true,
  createdAt: true,
  actor: { select: { id: true, username: true, name: true } },
};

// ---------------------------------------------------------------------------
// GET /api/audit — public modlog (public entries only)
// ---------------------------------------------------------------------------

router.get("/", async (req, res) => {
  const { cursor, limit = "30", action, targetType } = req.query as Record<
    string,
    string | undefined
  >;

  const take = Math.min(Number(limit), 100);

  const entries = await prisma.auditLogEntry.findMany({
    where: {
      public: true,
      ...(action ? { action: action as AuditAction } : {}),
      ...(targetType ? { targetType: targetType as ModerationTarget } : {}),
    },
    select: auditSelect,
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const nextCursor = entries.length === take ? entries[entries.length - 1].id : null;
  res.json({ entries, nextCursor });
});

// ---------------------------------------------------------------------------
// GET /api/audit/mod — full audit log (mods only, includes private entries)
// ---------------------------------------------------------------------------

router.get(
  "/mod",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const { cursor, limit = "30", action, targetType, actorId } = req.query as Record<
      string,
      string | undefined
    >;

    const take = Math.min(Number(limit), 100);

    const entries = await prisma.auditLogEntry.findMany({
      where: {
        ...(action ? { action: action as AuditAction } : {}),
        ...(targetType ? { targetType: targetType as ModerationTarget } : {}),
        ...(actorId ? { actorId } : {}),
      },
      select: auditSelect,
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const nextCursor = entries.length === take ? entries[entries.length - 1].id : null;
    res.json({ entries, nextCursor });
  },
);

export default router;
