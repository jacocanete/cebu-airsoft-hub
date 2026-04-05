import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/notifications — paginated list for the current user
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { cursor, limit = "20", unreadOnly } = req.query as Record<
    string,
    string | undefined
  >;
  const take = Math.min(Number(limit), 100);

  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user!.id,
      ...(unreadOnly === "true" ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.id, read: false },
  });

  const nextCursor =
    notifications.length === take
      ? notifications[notifications.length - 1].id
      : null;

  res.json({ notifications, nextCursor, unreadCount });
});

// ---------------------------------------------------------------------------
// GET /api/notifications/unread-count — lightweight count for the bell badge
// ---------------------------------------------------------------------------

router.get("/unread-count", requireAuth, async (req: AuthRequest, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user!.id, read: false },
  });
  res.json({ count });
});

// ---------------------------------------------------------------------------
// PATCH /api/notifications/:id/read — mark one notification as read
// ---------------------------------------------------------------------------

router.patch("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const notification = await prisma.notification.updateMany({
    where: { id: req.params.id as string, userId: req.user!.id },
    data: { read: true },
  });

  if (notification.count === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  // Return the updated notification so the client can confirm the server state
  const updated = await prisma.notification.findUnique({
    where: { id: req.params.id as string },
  });

  res.json(updated);
});

// ---------------------------------------------------------------------------
// PATCH /api/notifications/read-all — mark all as read
// ---------------------------------------------------------------------------

router.patch("/read-all", requireAuth, async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });
  res.status(204).end();
});

export default router;
