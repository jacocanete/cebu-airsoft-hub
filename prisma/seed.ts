import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const ghost = await prisma.user.upsert({
    where: { username: "ghost_reaper" },
    create: {
      email: "ghost@reaper.ph",
      emailVerified: true,
      name: "Ghost Reaper",
      username: "ghost_reaper",
      bio: "MilSim operator. 8 years on the field.",
      gearList: "VFC HK416, Tokyo Marui MWS, PTS MTEK",
      playStyle: "MilSim, CQB",
    },
    update: {},
  });

  const pablo = await prisma.user.upsert({
    where: { username: "tac_pablo" },
    create: {
      email: "pablo@reaper.ph",
      emailVerified: true,
      name: "Tac Pablo",
      username: "tac_pablo",
      bio: "CQB specialist. Fast and loud.",
    },
    update: {},
  });

  // Create a group
  const taskforce = await prisma.group.upsert({
    where: { slug: "taskforce-reaper" },
    create: {
      name: "Taskforce Reaper",
      slug: "taskforce-reaper",
      description: "Cebu's premier MilSim unit.",
      members: {
        create: [
          { userId: ghost.id, role: "OWNER" },
          { userId: pablo.id, role: "MEMBER" },
        ],
      },
    },
    update: {},
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: "Best fields in Cebu — 2025 roundup",
      content:
        "After playing at every major site this year, here are my picks...\n\n## Top 3\n\n1. **Area 51 Mandaue** — Best for MilSim\n2. **Sandbox Talisay** — Best for CQB\n3. **The Pit** — Most challenging terrain",
      category: "General",
      tags: ["fields", "cebu", "roundup"],
      pinned: true,
      authorId: ghost.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "WTS: VFC HK416 GBBR — Like New",
      content:
        "Letting go of my VFC HK416. Only 3 months old, less than 500 rounds through it. Comes with 2 mags.",
      category: "Buy/Sell",
      tags: ["wts", "vfc", "hk416", "gbbr"],
      authorId: pablo.id,
    },
  });

  // Create an event
  await prisma.gameEvent.create({
    data: {
      title: "Operation Night Reaper",
      description: "Night game at Area 51. Tracer rounds only. Teams of 8.",
      gameSite: "Area 51 Mandaue",
      gameType: "MilSim",
      date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      time: "18:00",
      entranceFee: 350,
      lat: 10.3333,
      lng: 123.9333,
      locationName: "Area 51 Airsoft Park, Mandaue City",
      playerCap: 32,
      organizerId: ghost.id,
      groupId: taskforce.id,
      rsvps: {
        create: [
          { userId: ghost.id, status: "GOING" },
          { userId: pablo.id, status: "GOING" },
        ],
      },
    },
  });

  // Create a marketplace listing
  await prisma.marketplaceListing.create({
    data: {
      title: "Tokyo Marui MWS GBBR",
      description:
        "Stock TM MWS, excellent condition. Selling because I upgraded to a WE.",
      price: 18500,
      condition: "LIKE_NEW",
      category: "Rifles",
      images: [],
      sellerId: pablo.id,
    },
  });

  // Create a comment on post1
  await prisma.comment.create({
    data: {
      content: "Great list! Area 51 is top tier for sure.",
      postId: post1.id,
      authorId: pablo.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
