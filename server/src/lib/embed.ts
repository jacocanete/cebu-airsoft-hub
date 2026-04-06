import { prisma } from "../prisma.js";

export type EmbedType = "post" | "listing" | "event" | "group";

export interface MessageEmbed {
  type: EmbedType;
  title: string;
  description: string;
  image?: string;
  url: string;
}

// Matches internal app URLs for each resource type.
// The CLIENT_URL env var is used so we only resolve links that belong to this
// deployment (not arbitrary external URLs).
const INTERNAL_PATTERNS: Array<{
  type: EmbedType;
  // Named group "id" captures the resource identifier
  re: RegExp;
}> = [
  { type: "post",    re: /\/feed\/([a-z0-9]+)/i },
  { type: "listing", re: /\/marketplace\/([a-z0-9]+)/i },
  { type: "event",   re: /\/events\/([a-z0-9]+)/i },
  { type: "group",   re: /\/groups\/([a-z0-9-]+)/i },
];

/**
 * Scans message content for the first recognisable internal link and returns a
 * metadata snapshot to be stored as JSON on the Message record.
 *
 * Returns null when no internal link is found or the referenced resource no
 * longer exists (deleted / soft-deleted).
 */
export async function extractEmbed(
  content: string,
): Promise<MessageEmbed | null> {
  for (const { type, re } of INTERNAL_PATTERNS) {
    const match = content.match(re);
    if (!match) continue;

    const id = match[1];

    try {
      switch (type) {
        case "post": {
          const post = await prisma.post.findFirst({
            where: { id, deletedAt: null },
            select: {
              id: true,
              title: true,
              content: true,
              category: true,
              author: { select: { username: true } },
            },
          });
          if (!post) return null;
          return {
            type: "post",
            title: post.title,
            description: `${post.category} · by ${post.author.username} · ${post.content.slice(0, 150)}${post.content.length > 150 ? "…" : ""}`,
            url: `/feed/${post.id}`,
          };
        }

        case "listing": {
          const listing = await prisma.marketplaceListing.findUnique({
            where: { id },
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              condition: true,
              images: true,
            },
          });
          if (!listing) return null;
          return {
            type: "listing",
            title: listing.title,
            description: `₱${Number(listing.price).toLocaleString()} · ${listing.condition.replace("_", " ")}`,
            image: listing.images[0] ?? undefined,
            url: `/marketplace/${listing.id}`,
          };
        }

        case "event": {
          const event = await prisma.gameEvent.findUnique({
            where: { id },
            select: {
              id: true,
              title: true,
              gameSite: true,
              gameType: true,
              date: true,
              locationName: true,
            },
          });
          if (!event) return null;
          return {
            type: "event",
            title: event.title,
            description: `${event.gameType} · ${event.locationName} · ${new Date(event.date).toLocaleDateString()}`,
            url: `/events/${event.id}`,
          };
        }

        case "group": {
          // Groups use slug in URLs
          const group = await prisma.group.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              logo: true,
              _count: { select: { members: true } },
            },
          });
          if (!group) return null;
          return {
            type: "group",
            title: group.name,
            description: `${group._count.members} member${group._count.members !== 1 ? "s" : ""}${group.description ? ` · ${group.description.slice(0, 100)}` : ""}`,
            image: group.logo ?? undefined,
            url: `/groups/${group.slug}`,
          };
        }
      }
    } catch {
      // Non-fatal — if the DB query fails we just skip the embed
      return null;
    }
  }

  return null;
}
