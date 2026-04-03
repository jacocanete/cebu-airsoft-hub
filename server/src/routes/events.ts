import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, optionalAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, async (_req, res) => {
  const events = await prisma.gameEvent.findMany({
    include: {
      org: { select: { id: true, username: true, name: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: "asc" },
  });

  res.json(events);
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const event = await prisma.gameEvent.findUnique({
    where: { id: req.params.id },
    include: {
      org: { select: { id: true, username: true, name: true } },
      rsvps: {
        where: { status: "GOING" },
        include: { user: { select: { id: true, username: true, name: true } } },
      },
    },
  });

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const userRsvp = req.user
    ? await prisma.rSVP.findUnique({
        where: { userId_eventId: { userId: req.user.id, eventId: event.id } },
      })
    : null;

  res.json({ ...event, userRsvp: userRsvp?.status ?? null });
});

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  gameSite: z.string().min(1),
  gameType: z.string().min(1),
  date: z.string(),
  time: z.string().optional(),
  entranceFee: z.number().optional(),
  lat: z.number(),
  lng: z.number(),
  locationName: z.string().min(1),
  playerCap: z.number().optional(),
  rules: z.string().optional(),
  groupId: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const event = await prisma.gameEvent.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      organizerId: req.user!.id,
    },
    include: {
      org: { select: { id: true, username: true, name: true } },
    },
  });

  res.status(201).json(event);
});

router.post("/:id/rsvp", requireAuth, async (req: AuthRequest, res) => {
  const { status } = z
    .object({ status: z.enum(["GOING", "MAYBE", "CANCELLED"]) })
    .parse(req.body);

  const rsvp = await prisma.rSVP.upsert({
    where: {
      userId_eventId: { userId: req.user!.id, eventId: req.params.id },
    },
    create: { userId: req.user!.id, eventId: req.params.id, status },
    update: { status },
  });

  const rsvpCount = await prisma.rSVP.count({
    where: { eventId: req.params.id, status: "GOING" },
  });

  res.json({ rsvp, rsvpCount });
});

export default router;
