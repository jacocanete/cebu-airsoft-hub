import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const FEATURED_CAP = 6;

// Seller select shape reused across list and detail
const sellerSelectBase = { id: true, username: true, name: true };

router.get("/", async (req, res) => {
  const {
    condition,
    category,
    q,
    status = "AVAILABLE",
    cursor,
    limit: limitStr,
  } = req.query as Record<string, string>;

  const limit = Math.min(Math.max(parseInt(limitStr ?? "20", 10) || 20, 1), 50);
  const isFirstPage = !cursor;

  const baseWhere: Prisma.MarketplaceListingWhereInput = {
    ...(status ? { status: status as "AVAILABLE" | "RESERVED" | "SOLD" } : {}),
    ...(condition ? { condition: condition as "NEW" | "LIKE_NEW" | "USED" | "FOR_PARTS" } : {}),
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Page 1: fetch featured listings separately (max 6, available only)
  const featured = isFirstPage
    ? await prisma.marketplaceListing.findMany({
        where: { ...baseWhere, featured: true },
        include: { seller: { select: sellerSelectBase } },
        orderBy: { featuredAt: "desc" },
        take: FEATURED_CAP,
      })
    : [];

  const featuredIds = new Set(featured.map((l) => l.id));

  // Cursor-paginated regular (non-featured) listings
  const regularRaw = await prisma.marketplaceListing.findMany({
    where: {
      ...baseWhere,
      // Exclude featured items from the regular stream so they don't appear twice
      ...(featuredIds.size > 0 ? { id: { notIn: [...featuredIds] } } : {}),
      featured: false,
    },
    include: { seller: { select: sellerSelectBase } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasNextPage = regularRaw.length > limit;
  const regularSlice = hasNextPage ? regularRaw.slice(0, limit) : regularRaw;
  const nextCursor = hasNextPage ? regularSlice[regularSlice.length - 1].id : null;

  res.json({ items: [...featured, ...regularSlice], nextCursor });
});

router.get("/:id", async (req, res) => {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: req.params.id as string },
    include: {
      seller: {
        select: {
          ...sellerSelectBase,
          avatar: true,
          createdAt: true,
          _count: { select: { listings: true } },
        },
      },
    },
  });

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const reviewStats = await prisma.sellerReview.aggregate({
    where: { sellerId: listing.sellerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  res.json({
    ...listing,
    seller: {
      ...listing.seller,
      averageRating: reviewStats._avg.rating ?? 0,
      reviewCount: reviewStats._count.rating,
    },
  });
});

router.get("/:id/reviews", async (req, res) => {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: req.params.id as string },
    select: { sellerId: true },
  });

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const reviews = await prisma.sellerReview.findMany({
    where: { sellerId: listing.sellerId },
    include: {
      reviewer: {
        select: { id: true, username: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.json(reviews);
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

router.post("/:id/reviews", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: req.params.id as string },
    select: { id: true, sellerId: true },
  });

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (listing.sellerId === req.user!.id) {
    res.status(403).json({ error: "Cannot review your own listing" });
    return;
  }

  const existing = await prisma.sellerReview.findFirst({
    where: {
      sellerId: listing.sellerId,
      reviewerId: req.user!.id,
      listingId: listing.id,
    },
  });

  if (existing) {
    res
      .status(409)
      .json({ error: "You have already reviewed this seller for this listing" });
    return;
  }

  const review = await prisma.sellerReview.create({
    data: {
      sellerId: listing.sellerId,
      reviewerId: req.user!.id,
      listingId: listing.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
    include: {
      reviewer: {
        select: { id: true, username: true, name: true, avatar: true },
      },
    },
  });

  res.status(201).json(review);
});

router.get("/:id/related", async (req, res) => {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: req.params.id as string },
    select: { id: true, category: true },
  });

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const related = await prisma.marketplaceListing.findMany({
    where: {
      category: listing.category,
      id: { not: listing.id },
      status: "AVAILABLE",
    },
    include: {
      seller: { select: sellerSelectBase },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  res.json(related);
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
      seller: { select: sellerSelectBase },
    },
  });

  res.status(201).json(listing);
});

router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z
    .object({ status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]) })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const id = req.params.id as string;

  const listing = await prisma.marketplaceListing.findUnique({ where: { id } });

  if (!listing || listing.sellerId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updated = await prisma.marketplaceListing.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  res.json(updated);
});

router.patch("/:id/feature", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;

  const listing = await prisma.marketplaceListing.findUnique({ where: { id } });

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (listing.sellerId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Toggle off
  if (listing.featured) {
    const updated = await prisma.marketplaceListing.update({
      where: { id },
      data: { featured: false, featuredAt: null },
    });
    res.json(updated);
    return;
  }

  // Toggle on — check global cap
  const featuredCount = await prisma.marketplaceListing.count({
    where: { featured: true },
  });

  if (featuredCount >= FEATURED_CAP) {
    res.status(409).json({
      error: `Featured slots are full (max ${FEATURED_CAP}). Try again later.`,
    });
    return;
  }

  const updated = await prisma.marketplaceListing.update({
    where: { id },
    data: { featured: true, featuredAt: new Date() },
  });

  res.json(updated);
});

export default router;
