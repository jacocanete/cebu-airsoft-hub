import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const { condition, category, q, status = "AVAILABLE" } = req.query as Record<string, string>;

  const listings = await prisma.marketplaceListing.findMany({
    where: {
      ...(status ? { status: status as "AVAILABLE" | "RESERVED" | "SOLD" } : {}),
      ...(condition ? { condition: condition as "NEW" | "LIKE_NEW" | "USED" | "FOR_PARTS" } : {}),
      ...(category ? { category } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: {
      seller: { select: { id: true, username: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(listings);
});

router.get("/:id", async (req, res) => {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: req.params.id },
    include: {
      seller: { select: { id: true, username: true, name: true } },
    },
  });

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json(listing);
});

const createListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  condition: z.enum(["NEW", "LIKE_NEW", "USED", "FOR_PARTS"]),
  category: z.string().min(1),
  images: z.array(z.string()).default([]),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const listing = await prisma.marketplaceListing.create({
    data: {
      ...parsed.data,
      sellerId: req.user!.id,
    },
    include: {
      seller: { select: { id: true, username: true, name: true } },
    },
  });

  res.status(201).json(listing);
});

router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const { status } = z
    .object({ status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]) })
    .parse(req.body);

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: req.params.id },
  });

  if (!listing || listing.sellerId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updated = await prisma.marketplaceListing.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json(updated);
});

export default router;
