import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";

const router = Router();

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_CATEGORIES = [
  "SPAM",
  "HARASSMENT",
  "HATE_SPEECH",
  "NSFW",
  "MISINFORMATION",
  "OFF_TOPIC",
  "CHEATING_ACCUSATION_WITHOUT_PROOF",
  "DOXXING",
  "OTHER",
] as const;

const VALID_TARGETS = [
  "POST",
  "COMMENT",
  "LISTING",
  "USER",
  "EVENT",
  "GROUP",
] as const;

const createReportSchema = z.object({
  targetType: z.enum(VALID_TARGETS),
  targetId: z.string().min(1),
  category: z.enum(VALID_CATEGORIES),
  reason: z.string().max(1000).optional(),
}).refine(
  (d) => d.category !== "OTHER" || (d.reason && d.reason.trim().length > 0),
  { message: "Reason is required when category is OTHER", path: ["reason"] },
);

const resolveReportSchema = z.object({
  action: z.enum(["dismiss", "action_taken"]),
  note: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/reports — submit a report (any authenticated user)
// ---------------------------------------------------------------------------

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { targetType, targetId, category, reason } = parsed.data;

  // Prevent duplicate open reports from the same user on the same target
  const existing = await prisma.report.findFirst({
    where: {
      reporterId: req.user!.id,
      targetType,
      targetId,
      status: "OPEN",
    },
    select: { id: true },
  });

  if (existing) {
    res.status(409).json({ error: "You have already reported this content" });
    return;
  }

  const report = await prisma.report.create({
    data: {
      reporterId: req.user!.id,
      targetType,
      targetId,
      category,
      reason: reason ?? null,
    },
    select: { id: true, createdAt: true },
  });

  res.status(201).json(report);
});

// ---------------------------------------------------------------------------
// GET /api/reports — list reports (mods only)
// ---------------------------------------------------------------------------

router.get(
  "/",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const { status, targetType, category, cursor, limit = "20" } = req.query as Record<
      string,
      string | undefined
    >;

    const take = Math.min(Number(limit), 100);

    const reports = await prisma.report.findMany({
      where: {
        ...(status ? { status: status as "OPEN" | "RESOLVED_ACTIONED" | "RESOLVED_DISMISSED" } : {}),
        ...(targetType ? { targetType: targetType as typeof VALID_TARGETS[number] } : {}),
        ...(category ? { category: category as typeof VALID_CATEGORIES[number] } : {}),
      },
      include: {
        reporter: { select: { id: true, username: true, name: true } },
        resolvedBy: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const nextCursor = reports.length === take ? reports[reports.length - 1].id : null;
    res.json({ reports, nextCursor });
  },
);

// ---------------------------------------------------------------------------
// PATCH /api/reports/:id/resolve — resolve a report (mods only)
// ---------------------------------------------------------------------------

router.patch(
  "/:id/resolve",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = resolveReportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const report = await prisma.report.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, status: true, targetType: true, targetId: true },
    });

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    if (report.status !== "OPEN") {
      res.status(409).json({ error: "Report already resolved" });
      return;
    }

    const { action, note } = parsed.data;
    const newStatus =
      action === "dismiss" ? "RESOLVED_DISMISSED" : "RESOLVED_ACTIONED";

    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: newStatus,
        resolvedById: req.user!.id,
        resolvedAt: new Date(),
        resolutionNote: note ?? null,
      },
    });

    await logAudit({
      actorId: req.user!.id,
      action: action === "dismiss" ? "REPORT_DISMISSED" : "REPORT_RESOLVED",
      targetType: report.targetType,
      targetId: report.targetId,
      reason: note,
      metadata: { reportId: report.id, action },
    });

    res.status(204).end();
  },
);

export default router;
