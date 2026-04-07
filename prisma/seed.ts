import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: date offset from now
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600 * 1000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 3600 * 1000);

async function main() {
  console.log("Seeding database...");

  // ─────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────

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

  const sniper = await prisma.user.upsert({
    where: { username: "sniper_king_cebu" },
    create: {
      email: "sniper@cebu.ph",
      emailVerified: true,
      name: "Mark Villanueva",
      username: "sniper_king_cebu",
      bio: "Long range or nothing. VSR-10 all day.",
      gearList: "Tokyo Marui VSR-10, A&K SVD",
      playStyle: "Sniper, MilSim",
    },
    update: {},
  });

  const speedster = await prisma.user.upsert({
    where: { username: "speedster_cebu" },
    create: {
      email: "speedster@cebu.ph",
      emailVerified: true,
      name: "Nico Reyes",
      username: "speedster_cebu",
      bio: "Speedsoft is life. 300+ fps and counting.",
      gearList: "Krytac Trident CRB, AAP-01",
      playStyle: "Speedsoft, CQB",
    },
    update: {},
  });

  const techie = await prisma.user.upsert({
    where: { username: "gearhead_ph" },
    create: {
      email: "techie@cebu.ph",
      emailVerified: true,
      name: "Renz Dela Cruz",
      username: "gearhead_ph",
      bio: "I tech guns so you don't have to. Cebu-based tech.",
      gearList: "Custom AEG builds, WE Dragon",
      playStyle: "Open Field, MilSim",
    },
    update: {},
  });

  const operator = await prisma.user.upsert({
    where: { username: "operator_ph" },
    create: {
      email: "operator@cebu.ph",
      emailVerified: true,
      name: "Jericho Santos",
      username: "operator_ph",
      bio: "Former army. Now just airsofting on weekends.",
      gearList: "VFC MP5, WE G17",
      playStyle: "MilSim, Night Games",
    },
    update: {},
  });

  const newbie = await prisma.user.upsert({
    where: { username: "newbie_airsoft" },
    create: {
      email: "newbie@cebu.ph",
      emailVerified: true,
      name: "Carlo Mendez",
      username: "newbie_airsoft",
      bio: "Just started. Still learning the ropes.",
      playStyle: "Open Field",
    },
    update: {},
  });

  const dealer = await prisma.user.upsert({
    where: { username: "cebu_airsoft_dealer" },
    create: {
      email: "dealer@cebu.ph",
      emailVerified: true,
      name: "Airsoft Hub Cebu",
      username: "cebu_airsoft_dealer",
      bio: "Official dealer. Wide stock of rifles, pistols, and gear.",
      gearList: "Various",
      playStyle: "N/A",
    },
    update: {},
  });

  const fieldOwner = await prisma.user.upsert({
    where: { username: "area51_official" },
    create: {
      email: "area51@cebu.ph",
      emailVerified: true,
      name: "Area 51 Airsoft Park",
      username: "area51_official",
      bio: "Official account of Area 51 Airsoft Park, Mandaue City.",
    },
    update: {},
  });

  const mod = await prisma.user.upsert({
    where: { username: "mod_cebu" },
    create: {
      email: "mod@cebu.ph",
      emailVerified: true,
      name: "Cebu Mod Team",
      username: "mod_cebu",
      bio: "Community moderator.",
      role: "MODERATOR",
    },
    update: {},
  });

  const allUsers = [ghost, pablo, sniper, speedster, techie, operator, newbie, dealer, fieldOwner, mod];

  console.log(`  ✓ ${allUsers.length} users`);

  // ─────────────────────────────────────────────
  // GROUPS
  // ─────────────────────────────────────────────

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
          { userId: operator.id, role: "MEMBER" },
        ],
      },
    },
    update: {},
  });

  const speedforce = await prisma.group.upsert({
    where: { slug: "speedforce-cebu" },
    create: {
      name: "Speedforce Cebu",
      slug: "speedforce-cebu",
      description: "Speedsoft and CQB dominance in Cebu.",
      members: {
        create: [
          { userId: speedster.id, role: "OWNER" },
          { userId: newbie.id, role: "MEMBER" },
        ],
      },
    },
    update: {},
  });

  const techTeam = await prisma.group.upsert({
    where: { slug: "cebu-tech-squad" },
    create: {
      name: "Cebu Tech Squad",
      slug: "cebu-tech-squad",
      description: "Gun technicians and builders of Cebu.",
      members: {
        create: [
          { userId: techie.id, role: "OWNER" },
          { userId: sniper.id, role: "ADMIN" },
          { userId: dealer.id, role: "MEMBER" },
        ],
      },
    },
    update: {},
  });

  console.log("  ✓ 3 groups");

  // ─────────────────────────────────────────────
  // POSTS (50 total)
  // ─────────────────────────────────────────────

  const postAuthors = [ghost, pablo, sniper, speedster, techie, operator, newbie, dealer, fieldOwner];

  const postData = [
    // General category
    { title: "Best fields in Cebu — 2025 roundup", content: "After playing at every major site this year, here are my picks...\n\n## Top 3\n\n1. **Area 51 Mandaue** — Best for MilSim\n2. **Sandbox Talisay** — Best for CQB\n3. **The Pit** — Most challenging terrain", category: "General", tags: ["fields", "cebu", "roundup"], pinned: true, authorId: ghost.id },
    { title: "Welcome to the Cebu Airsoft Hub!", content: "This is the official community forum for Cebu airsofters. Introduce yourself below!", category: "General", tags: ["welcome", "community"], pinned: true, authorId: mod.id },
    { title: "Introduce yourself — new players thread", content: "New to the community? Drop your name, play style, and what you're running. Everyone started somewhere.", category: "General", tags: ["introduction", "newbies"], authorId: ghost.id },
    { title: "Best chronograph readings you've seen at a local field?", content: "Curious what the velocity standards are at different sites. What have you clocked?", category: "General", tags: ["fps", "chrono"], authorId: pablo.id },
    { title: "How do you transport your guns around Cebu?", content: "Getting stopped at checkpoints is a pain. What bags/cases do you guys use?", category: "General", tags: ["transport", "safety"], authorId: operator.id },
    { title: "Who's playing this weekend at Area 51?", content: "Looking for a team. Dropping in solo this Saturday. Anyone want to squad up?", category: "General", tags: ["weekend", "area51", "squad"], authorId: newbie.id },
    { title: "Night game etiquette — what are your rules?", content: "With more night games happening, I think we need to talk about tracer unit discipline and light discipline.", category: "General", tags: ["nightgame", "etiquette"], authorId: operator.id },
    { title: "Cebu airsoft scene in 2025 — growth is real", content: "Remember when there were only 2 fields in the entire province? Now we have 7+. Wild how much it's grown.", category: "General", tags: ["community", "growth"], authorId: ghost.id },
    { title: "Post your loadout photos here", content: "Show us what you're running! Full kit shots, flats, whatever. Let's see the gear.", category: "General", tags: ["loadout", "kit", "photos"], authorId: speedster.id },
    { title: "Hydration on the field — what do you carry?", content: "Cebu heat is no joke. Lost 2kg of water weight last weekend. Share your hydration setup.", category: "General", tags: ["health", "hydration"], authorId: sniper.id },

    // Gear Reviews
    { title: "VFC HK416 GBBR — 6 month review", content: "## Overview\nBeen running the VFC HK416 GBBR for 6 months now. Here's what I've found.\n\n**Pros:** Realistic cycling, excellent recoil, solid build\n**Cons:** Mag capacity, gas efficiency in cold weather\n\n**Verdict:** 8.5/10 — highly recommended for MilSim.", category: "Gear Reviews", tags: ["vfc", "hk416", "gbbr", "review"], authorId: ghost.id },
    { title: "Krytac Trident CRB review — speedsoft beast", content: "If you're running speedsoft, the Krytac Trident CRB is hard to beat. Consistent, reliable, easy to tech.", category: "Gear Reviews", tags: ["krytac", "trident", "speedsoft", "review"], authorId: speedster.id },
    { title: "Tokyo Marui VSR-10 — still king of bolt actions?", content: "Despite being old, the VSR-10 still sets the benchmark. Here's why.", category: "Gear Reviews", tags: ["vsr10", "tm", "sniper", "review"], authorId: sniper.id },
    { title: "WE Dragon .50 GBB — is it worth the hype?", content: "Short answer: yes. Long answer: read on.", category: "Gear Reviews", tags: ["we", "dragon", "gbb", "review"], authorId: techie.id },
    { title: "PTS MTEK FLUX helmet — worth the price?", content: "Paid 8k for this helmet. Here's whether it was worth it or if you should get a knockoff.", category: "Gear Reviews", tags: ["pts", "mtek", "helmet", "review"], authorId: ghost.id },
    { title: "AAP-01 — best budget sidearm in 2025?", content: "The AAP-01 has been out a few years now. Does it still hold up against newer competition?", category: "Gear Reviews", tags: ["aap01", "pistol", "review", "budget"], authorId: speedster.id },
    { title: "Full review: Multicam vs Kryptek for Philippine climate", content: "Both patterns are popular but which actually works better in the Cebu bush? I tested both for 3 months.", category: "Gear Reviews", tags: ["camo", "multicam", "kryptek", "review"], authorId: operator.id },
    { title: "Plate carrier comparison: LBT vs Ferro vs Clone", content: "Tested three plate carriers for comfort, modularity, and heat management in Cebu's weather.", category: "Gear Reviews", tags: ["platecarrier", "lbt", "ferro", "review"], authorId: ghost.id },

    // Tips & Tactics
    { title: "CQB room clearing fundamentals for airsofters", content: "Proper room clearing isn't just for the military. Here's how to do it safely in CQB games.", category: "Tips & Tactics", tags: ["cqb", "tactics", "roomclearing"], authorId: operator.id },
    { title: "How to stay cool under pressure in MilSim ops", content: "Stress inoculation techniques that actually work. From a former military guy.", category: "Tips & Tactics", tags: ["milsim", "mindset", "tactics"], authorId: operator.id },
    { title: "Sniper hides in Cebu terrain — tips and tricks", content: "The jungle terrain here is different from elsewhere. Here's how to use it to your advantage.", category: "Tips & Tactics", tags: ["sniper", "ghillie", "tactics"], authorId: sniper.id },
    { title: "Communication protocols for team games", content: "Using proper comms is the difference between winning and losing. Here's a simple system that works.", category: "Tips & Tactics", tags: ["comms", "teamwork", "tactics"], authorId: ghost.id },
    { title: "How to read terrain fast on the fly", content: "You won't always have time to scout. Here's how to assess a field quickly when the game starts.", category: "Tips & Tactics", tags: ["terrain", "tactics", "awareness"], authorId: sniper.id },
    { title: "Flanking 101 — when and how to do it", content: "Flanking is one of the most powerful tools in airsoft but it needs to be done right.", category: "Tips & Tactics", tags: ["flanking", "tactics", "movement"], authorId: pablo.id },
    { title: "The underestimated power of overwatch", content: "Nobody wants to sit still and provide overwatch, but it wins games. Here's why.", category: "Tips & Tactics", tags: ["overwatch", "tactics", "support"], authorId: ghost.id },

    // Buy/Sell
    { title: "WTS: VFC HK416 GBBR — Like New", content: "Letting go of my VFC HK416. Only 3 months old, less than 500 rounds through it. Comes with 2 mags.", category: "Buy/Sell", tags: ["wts", "vfc", "hk416", "gbbr"], authorId: pablo.id },
    { title: "WTB: Tokyo Marui MWS or NGRS — budget 20k", content: "Looking for a TM MWS or any NGRS. Budget is 20k. Dm me if you have.", category: "Buy/Sell", tags: ["wtb", "tm", "mws", "ngrs"], authorId: newbie.id },
    { title: "WTS: Plate carrier + pouches package deal", content: "Selling my entire plate carrier setup. Cummerbund, mag pouches, admin pouch. All Multicam. 4.5k takes all.", category: "Buy/Sell", tags: ["wts", "platecarrier", "multicam"], authorId: speedster.id },
    { title: "WTT: Krytac for TM MWS — even trade?", content: "I have a full stock Krytac CRB. Looking to trade for a TM MWS. Can add cash if needed.", category: "Buy/Sell", tags: ["wtt", "krytac", "mws", "trade"], authorId: speedster.id },
    { title: "WTS: Lot of BB ammo — various brands", content: "Clearing out my ammo stock. 0.25g, 0.28g, 0.30g. All unsealed bags. 500 per kilo.", category: "Buy/Sell", tags: ["wts", "bb", "ammo", "bulk"], authorId: dealer.id },
    { title: "WTS: Multicam kit — shirt, pants, boonie", content: "Full Multicam uniform. Size M. Worn twice. 1800 takes all.", category: "Buy/Sell", tags: ["wts", "multicam", "uniform"], authorId: operator.id },
    { title: "WTB: Any budget pistol under 3k", content: "Looking for a starter pistol for newbies in my team. Budget 3k. Doesn't need to be perfect.", category: "Buy/Sell", tags: ["wtb", "pistol", "budget"], authorId: newbie.id },
    { title: "WTS: Gas cans — lot of 10", content: "Have 10 full 1000ml gas cans. 350 each or 3000 for the lot.", category: "Buy/Sell", tags: ["wts", "gas", "gbb"], authorId: dealer.id },

    // Memes
    { title: "POV: You just got hit but the opponent doesn't call it", content: "We've all been there. The rage is real.", category: "Memes", tags: ["meme", "hitcalling", "rage"], authorId: pablo.id },
    { title: "Types of players at every local game", content: "The aggressive runner, the camper, the guy who never calls hits, the one who brought real military gear.", category: "Memes", tags: ["meme", "players", "types"], authorId: speedster.id },
    { title: "When your BBs run out at the worst moment possible", content: "True story from last weekend. I had 50 BBs left and 6 enemies. You can guess how it ended.", category: "Memes", tags: ["meme", "ammo", "struggle"], authorId: newbie.id },
    { title: "The grind from newbie kit to veteran loadout", content: "First loadout: borrowed gun and shorts. Now: full multicam, plate carrier, and two sidearms.", category: "Memes", tags: ["meme", "loadout", "progression"], authorId: ghost.id },
    { title: "Airsoft wife starter pack", content: "\"Why do you need another gun, you already have three\" has entered the chat.", category: "Memes", tags: ["meme", "wife", "relationship"], authorId: pablo.id },

    // News
    { title: "Area 51 Airsoft Park announces field expansion", content: "Area 51 in Mandaue is expanding their CQB zone. New buildings being added before Q3 2025.", category: "News", tags: ["area51", "news", "field"], authorId: fieldOwner.id },
    { title: "New gun laws in PH — what airsofters need to know", content: "Recent updates to Republic Act 10591 have implications for the airsoft community. Here's a breakdown.", category: "News", tags: ["law", "news", "ra10591"], authorId: mod.id },
    { title: "Upcoming PASA national tournament qualifiers in Cebu", content: "PASA is hosting qualifier rounds in Cebu this August. Registration opens July 1.", category: "News", tags: ["pasa", "tournament", "news"], authorId: mod.id },
    { title: "Sandbox Talisay now open Saturdays until midnight", content: "Great news for night game fans. Sandbox extended their weekend hours starting June 2025.", category: "News", tags: ["sandbox", "news", "nightgame"], authorId: fieldOwner.id },
    { title: "VFC releasing new GBBR models in 2025 — what's confirmed", content: "VFC has confirmed the HK45, SCAR-L, and a revamped G28 for their 2025 lineup.", category: "News", tags: ["vfc", "news", "gbbr"], authorId: ghost.id },
    { title: "Cebu Airsoft Alliance year-end tournament recap", content: "The 2024 year-end tournament had over 200 players. Here's the full recap and final standings.", category: "News", tags: ["tournament", "recap", "caa"], authorId: mod.id },
  ];

  // Create posts with staggered timestamps (2 hours apart)
  const createdPosts = [];
  for (let i = 0; i < postData.length; i++) {
    const post = await prisma.post.create({
      data: {
        ...postData[i],
        createdAt: hoursAgo(postData.length * 2 - i * 2),
      },
    });
    createdPosts.push(post);
  }

  console.log(`  ✓ ${createdPosts.length} posts`);

  // ─────────────────────────────────────────────
  // COMMENTS (30 total)
  // ─────────────────────────────────────────────

  const commentData = [
    { content: "Great list! Area 51 is top tier for sure.", postId: createdPosts[0].id, authorId: pablo.id },
    { content: "Sandbox Talisay has improved a lot since last year.", postId: createdPosts[0].id, authorId: sniper.id },
    { content: "The Pit is underrated. Terrain there is insane.", postId: createdPosts[0].id, authorId: operator.id },
    { content: "Thanks for the write-up! Just joined last week.", postId: createdPosts[1].id, authorId: newbie.id },
    { content: "Welcome! Don't be shy to ask questions here.", postId: createdPosts[1].id, authorId: ghost.id },
    { content: "Love this community. Very helpful compared to FB groups.", postId: createdPosts[1].id, authorId: speedster.id },
    { content: "I'm Mark, play sniper, running VSR-10. Nice to meet everyone.", postId: createdPosts[2].id, authorId: sniper.id },
    { content: "Carlo here, total newbie, just bought my first pistol!", postId: createdPosts[2].id, authorId: newbie.id },
    { content: "700 fps from a sniper at The Pit last month. Wild.", postId: createdPosts[3].id, authorId: sniper.id },
    { content: "Most fields cap at 400 for AEGs and 500 for bolt actions here.", postId: createdPosts[3].id, authorId: ghost.id },
    { content: "I use a rifle case inside a regular duffel bag. Nobody looks twice.", postId: createdPosts[4].id, authorId: operator.id },
    { content: "Pelican 1750 is the gold standard if you have budget.", postId: createdPosts[4].id, authorId: ghost.id },
    { content: "The VFC 416 cycling sound is just *chef's kiss*.", postId: createdPosts[10].id, authorId: pablo.id },
    { content: "Gas efficiency is the only real downside. Goes through mags fast.", postId: createdPosts[10].id, authorId: operator.id },
    { content: "VSR-10 is still unbeatable for the price. Period.", postId: createdPosts[12].id, authorId: ghost.id },
    { content: "Agreed. The aftermarket support alone makes it worth it.", postId: createdPosts[12].id, authorId: techie.id },
    { content: "Communication is 80% of winning. Can't stress this enough.", postId: createdPosts[21].id, authorId: ghost.id },
    { content: "We use a simple phonetic alphabet system. Works great.", postId: createdPosts[21].id, authorId: operator.id },
    { content: "Flanking saved our squad last week at Area 51.", postId: createdPosts[23].id, authorId: pablo.id },
    { content: "Counter-flanking is the answer though. Always send a guy to watch the flanks.", postId: createdPosts[23].id, authorId: ghost.id },
    { content: "How many mags included in the sale?", postId: createdPosts[25].id, authorId: ghost.id },
    { content: "2 mags and a speed loader. DM for details!", postId: createdPosts[25].id, authorId: pablo.id },
    { content: "Is the MWS still available?", postId: createdPosts[26].id, authorId: techie.id },
    { content: "Still looking! Anyone?", postId: createdPosts[26].id, authorId: newbie.id },
    { content: "I died at the airsoft wife starter pack 💀", postId: createdPosts[33].id, authorId: speedster.id },
    { content: "My wife literally said this exact line last week lmao", postId: createdPosts[33].id, authorId: operator.id },
    { content: "This law update is confusing. Thanks for the clear breakdown.", postId: createdPosts[40].id, authorId: newbie.id },
    { content: "Worth noting: transport rules are the most commonly violated.", postId: createdPosts[40].id, authorId: operator.id },
    { content: "PASA qualifier in Cebu! Finally. Been waiting years for this.", postId: createdPosts[41].id, authorId: speedster.id },
    { content: "Registering my whole squad. See everyone there.", postId: createdPosts[41].id, authorId: ghost.id },
  ];

  const createdComments = [];
  for (let i = 0; i < commentData.length; i++) {
    const comment = await prisma.comment.create({
      data: {
        ...commentData[i],
        createdAt: hoursAgo(commentData.length - i),
      },
    });
    createdComments.push(comment);
  }

  // A few nested replies
  await prisma.comment.create({
    data: {
      content: "Hard agree. Sandbox really stepped up their maintenance.",
      postId: createdPosts[0].id,
      authorId: speedster.id,
      parentCommentId: createdComments[1].id,
      createdAt: hoursAgo(10),
    },
  });

  await prisma.comment.create({
    data: {
      content: "What brand BBs are you running in it?",
      postId: createdPosts[10].id,
      authorId: newbie.id,
      parentCommentId: createdComments[12].id,
      createdAt: hoursAgo(8),
    },
  });

  await prisma.comment.create({
    data: {
      content: "Geoffs or Valken 0.28g. Both feed perfectly.",
      postId: createdPosts[10].id,
      authorId: pablo.id,
      parentCommentId: createdComments[12].id,
      createdAt: hoursAgo(7),
    },
  });

  console.log(`  ✓ ${commentData.length + 3} comments`);

  // ─────────────────────────────────────────────
  // VOTES (posts)
  // ─────────────────────────────────────────────

  const voteAuthors = [ghost, pablo, sniper, speedster, techie, operator, newbie, dealer, fieldOwner, mod];

  // Give every post some upvotes and a few downvotes
  const voteInserts: { userId: string; postId: string; value: number }[] = [];

  for (let pi = 0; pi < createdPosts.length; pi++) {
    // Upvotes: popular posts get more
    const upvoterCount = 3 + (pi % 5);
    const downvoterCount = pi % 3 === 0 ? 1 : 0;

    for (let vi = 0; vi < upvoterCount && vi < voteAuthors.length; vi++) {
      const userId = voteAuthors[(pi + vi) % voteAuthors.length].id;
      if (userId !== createdPosts[pi].authorId) {
        voteInserts.push({ userId, postId: createdPosts[pi].id, value: 1 });
      }
    }

    if (downvoterCount > 0) {
      const userId = voteAuthors[(pi + 7) % voteAuthors.length].id;
      if (userId !== createdPosts[pi].authorId) {
        // avoid duplicate if already voted
        const alreadyIn = voteInserts.find(v => v.userId === userId && v.postId === createdPosts[pi].id);
        if (!alreadyIn) {
          voteInserts.push({ userId, postId: createdPosts[pi].id, value: -1 });
        }
      }
    }
  }

  // Deduplicate by (userId, postId)
  const uniqueVotes = Array.from(
    new Map(voteInserts.map(v => [`${v.userId}:${v.postId}`, v])).values()
  );

  await prisma.vote.createMany({ data: uniqueVotes, skipDuplicates: true });

  // Comment votes
  const commentVoteInserts: { userId: string; commentId: string; value: number }[] = [];
  for (let ci = 0; ci < createdComments.length; ci++) {
    const upvoterCount = 2 + (ci % 3);
    for (let vi = 0; vi < upvoterCount && vi < voteAuthors.length; vi++) {
      const userId = voteAuthors[(ci + vi) % voteAuthors.length].id;
      if (userId !== createdComments[ci].authorId) {
        commentVoteInserts.push({ userId, commentId: createdComments[ci].id, value: 1 });
      }
    }
  }

  const uniqueCommentVotes = Array.from(
    new Map(commentVoteInserts.map(v => [`${v.userId}:${v.commentId}`, v])).values()
  );

  await prisma.commentVote.createMany({ data: uniqueCommentVotes, skipDuplicates: true });

  console.log(`  ✓ ${uniqueVotes.length} post votes, ${uniqueCommentVotes.length} comment votes`);

  // ─────────────────────────────────────────────
  // MARKETPLACE LISTINGS (30)
  // ─────────────────────────────────────────────

  // Listings marked featured: true will be pinned to the top of the marketplace.
  // Max 6 can be featured at any time globally.
  const listingData = [
    { title: "Tokyo Marui MWS GBBR", description: "Stock TM MWS, excellent condition. Selling because I upgraded to a WE.", price: 18500, condition: "LIKE_NEW" as const, category: "Rifles", sellerId: pablo.id, featured: true, featuredAt: daysAgo(1) },
    { title: "VFC HK416D GBBR — Full Kit", description: "VFC HK416D with 3 mags, gas, and original box. Well maintained.", price: 22000, condition: "LIKE_NEW" as const, category: "Rifles", sellerId: ghost.id, featured: true, featuredAt: daysAgo(2) },
    { title: "Krytac Trident MK2 CRB", description: "Used for 6 months. Stock internals, no mods. Ready to play.", price: 9800, condition: "USED" as const, category: "Rifles", sellerId: speedster.id },
    { title: "AK-74M Full Metal AEG", description: "Classic AK-74M by LCT. Full metal and wood. Shoots straight. Needs a new hop rubber.", price: 7500, condition: "USED" as const, category: "Rifles", sellerId: operator.id },
    { title: "G&G CM16 Raider — starter rifle", description: "Perfect beginner rifle. Shoots 320 fps. Comes with 1 hi-cap mag.", price: 4500, condition: "USED" as const, category: "Rifles", sellerId: newbie.id },
    { title: "WE Dragon .50 GBB Pistol", description: "Rare WE Dragon. Fires hard. Original box included.", price: 5200, condition: "LIKE_NEW" as const, category: "Pistols", sellerId: techie.id, featured: true, featuredAt: daysAgo(3) },
    { title: "Tokyo Marui Hi-Capa 5.1 Gold Match", description: "TM Hi-Capa 5.1. Stock. Minor scuffs on the grip. 2 mags.", price: 8500, condition: "USED" as const, category: "Pistols", sellerId: ghost.id },
    { title: "AAP-01 Assassin — Upgraded", description: "AAP-01 with flat hop, SAS barrel, and lightweight bolt. Shoots 300+ fps consistently.", price: 5800, condition: "USED" as const, category: "Pistols", sellerId: speedster.id },
    { title: "Glock 17 Gen 3 GBB (WE)", description: "WE Glock 17. Works fine, just upgrading to TM. Comes with 2 mags.", price: 2800, condition: "USED" as const, category: "Pistols", sellerId: newbie.id },
    { title: "WE EU18 — Black", description: "Compact and reliable. Great backup sidearm. Shoots 280 fps.", price: 3200, condition: "LIKE_NEW" as const, category: "Pistols", sellerId: dealer.id },
    { title: "VFC MP5A5 GBBR", description: "VFC MP5A5 with 2 mags. Excellent cycling feel. Minor wear on stock.", price: 19000, condition: "USED" as const, category: "SMGs", sellerId: operator.id, featured: true, featuredAt: daysAgo(4) },
    { title: "Krytac Kriss Vector AEG", description: "Krytac Vector in FDE. Unique platform. Shoots 330 fps. 1 mag included.", price: 11500, condition: "LIKE_NEW" as const, category: "SMGs", sellerId: dealer.id },
    { title: "JG MP5K AEG — Budget Pick", description: "Budget MP5K. Good for CQB. Shoots 290 fps. Needs a hop-up adjustment.", price: 2500, condition: "USED" as const, category: "SMGs", sellerId: techie.id },
    { title: "CYMA M870 Spring Shotgun", description: "3-shot spread. Great for CQB. Includes 2 shell sets.", price: 1800, condition: "USED" as const, category: "Shotguns", sellerId: operator.id },
    { title: "Tokyo Marui M3 Super 90 AEG Shotgun", description: "TM M3 shotgun AEG. Rare and powerful. All original.", price: 9000, condition: "LIKE_NEW" as const, category: "Shotguns", sellerId: ghost.id },
    { title: "Ferro Concepts Slickster Plate Carrier", description: "Ferro Concepts Slickster in Ranger Green. Barely used. No plates.", price: 7200, condition: "LIKE_NEW" as const, category: "Gear & Apparel", sellerId: ghost.id, featured: true, featuredAt: daysAgo(5) },
    { title: "Full Multicam uniform set — size L", description: "Combat shirt and pants in Multicam. Crye-cut knock-off but high quality. Size L.", price: 2200, condition: "USED" as const, category: "Gear & Apparel", sellerId: operator.id },
    { title: "PTS MTEK FLUX Helmet", description: "PTS MTEK FLUX in Black. One size. Fits up to 58cm head. Minor surface scuffs.", price: 6500, condition: "USED" as const, category: "Gear & Apparel", sellerId: ghost.id },
    { title: "Mechanix gloves — lot of 3 pairs", description: "Three pairs of Mechanix M-Pact. Sizes M, L, L. All used but functional.", price: 900, condition: "USED" as const, category: "Gear & Apparel", sellerId: speedster.id },
    { title: "Element tactical boots — size 42", description: "Element boots in coyote. Worn maybe 5 games. Still firm soles.", price: 2400, condition: "USED" as const, category: "Gear & Apparel", sellerId: newbie.id },
    { title: "Suppressor — 14mm CCW, 200mm", description: "Aluminum suppressor, realistic look. Fits any 14mm CCW barrel.", price: 800, condition: "LIKE_NEW" as const, category: "Accessories", sellerId: dealer.id },
    { title: "Perun V2 MOSFET", description: "Perun optical MOSFET for V2 gearboxes. Installed for 3 months. Full features.", price: 1800, condition: "USED" as const, category: "Accessories", sellerId: techie.id },
    { title: "Madbull Daniel Defense RIS II Rail", description: "Madbull DD RIS II 12-inch. Fits M4/M16 series. Minor dings.", price: 2500, condition: "USED" as const, category: "Accessories", sellerId: ghost.id },
    { title: "Tokyo Marui hop up chamber — M4", description: "TM hop up chamber for M4/M16 AEGs. Replaced with a Prometheus unit.", price: 500, condition: "USED" as const, category: "Parts", sellerId: techie.id },
    { title: "SHS 16:1 gear set", description: "SHS 16:1 gears for V2/V3 gearbox. Never installed.", price: 600, condition: "NEW" as const, category: "Parts", sellerId: techie.id },
    { title: "Prometheus 6.03 EG barrel — 363mm", description: "Prometheus EG 6.03mm precision barrel, 363mm. Excellent accuracy upgrade.", price: 2200, condition: "LIKE_NEW" as const, category: "Parts", sellerId: dealer.id },
    { title: "Geoffs 0.28g BBs — 5000 rounds", description: "Geoffs Super Precision 0.28g. One bag of 5000. Unopened.", price: 750, condition: "NEW" as const, category: "Ammo & BBs", sellerId: dealer.id },
    { title: "Valken Accelerate 0.25g — 5000 rounds", description: "Valken Accelerate 0.25g. 5000 rounds. Half the bag used.", price: 350, condition: "USED" as const, category: "Ammo & BBs", sellerId: newbie.id },
    { title: "BLS 0.30g Premium BBs — 3000 rounds", description: "BLS Precision 0.30g. Great for upgraded builds. 3000 rounds.", price: 500, condition: "NEW" as const, category: "Ammo & BBs", sellerId: dealer.id },
    { title: "Mixed BB lot — 0.20g to 0.30g clearance", description: "Clearing out multiple partial bags. All reputable brands. Sold as-is.", price: 400, condition: "USED" as const, category: "Ammo & BBs", sellerId: speedster.id },
  ];

  const statuses = ["AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE", "RESERVED", "SOLD"] as const;
  const createdListings = [];
  for (let i = 0; i < listingData.length; i++) {
    const { featured = false, featuredAt = null, ...rest } = listingData[i];
    const listing = await prisma.marketplaceListing.create({
      data: {
        ...rest,
        images: [],
        status: statuses[i % statuses.length],
        featured,
        featuredAt,
        createdAt: daysAgo(listingData.length - i),
      },
    });
    createdListings.push(listing);
  }

  console.log(`  ✓ ${createdListings.length} marketplace listings`);

  // ─────────────────────────────────────────────
  // GAME EVENTS (12)
  // ─────────────────────────────────────────────

  const gameTypes = ["MilSim", "CQB", "Speedsoft", "Open Field", "Night Game"] as const;
  const gameSites = [
    { site: "Area 51 Airsoft Park, Mandaue City", lat: 10.3333, lng: 123.9333, locationName: "Area 51 Airsoft Park, Mandaue City" },
    { site: "Sandbox Airsoft Field, Talisay", lat: 10.2437, lng: 123.8478, locationName: "Sandbox Airsoft Field, Talisay City" },
    { site: "The Pit CQB, Cebu City", lat: 10.3157, lng: 123.8854, locationName: "The Pit CQB, Cebu City" },
    { site: "Warzone Airsoft, Lapu-Lapu", lat: 10.3103, lng: 123.9494, locationName: "Warzone Airsoft Park, Lapu-Lapu City" },
  ];

  const eventOrganizers = [ghost, speedster, fieldOwner, operator, mod];

  const eventDataList = [
    { title: "Operation Night Reaper", description: "Night game at Area 51. Tracer rounds only. Teams of 8.", gameType: "MilSim", date: daysFromNow(7), entranceFee: 350, playerCap: 32, status: "UPCOMING" as const, organizerId: ghost.id, groupId: taskforce.id, siteIndex: 0 },
    { title: "CQB Throwdown — January Edition", description: "Fast-paced CQB at The Pit. Speed and accuracy wins.", gameType: "CQB", date: daysFromNow(14), entranceFee: 250, playerCap: 20, status: "UPCOMING" as const, organizerId: pablo.id, groupId: null, siteIndex: 2 },
    { title: "Speedsoft Open Series Round 1", description: "First round of the Cebu Speedsoft Open Series. Prizes for top 3.", gameType: "Speedsoft", date: daysFromNow(21), entranceFee: 400, playerCap: 40, status: "UPCOMING" as const, organizerId: speedster.id, groupId: speedforce.id, siteIndex: 1 },
    { title: "Open Field Saturday — Area 51", description: "Casual walk-on game. All play styles welcome.", gameType: "Open Field", date: daysFromNow(3), entranceFee: 200, playerCap: 60, status: "UPCOMING" as const, organizerId: fieldOwner.id, groupId: null, siteIndex: 0 },
    { title: "Night Ops Alpha — Tracer Game", description: "Full dark game. Tracers mandatory. No white lights.", gameType: "Night Game", date: daysFromNow(10), entranceFee: 300, playerCap: 24, status: "UPCOMING" as const, organizerId: operator.id, groupId: taskforce.id, siteIndex: 3 },
    { title: "Tech Day — Build & Play", description: "Bring your project builds. Tech station available. Casual game after.", gameType: "Open Field", date: daysFromNow(30), entranceFee: 150, playerCap: 30, status: "UPCOMING" as const, organizerId: techie.id, groupId: techTeam.id, siteIndex: 1 },
    { title: "Taskforce Reaper vs Speedforce — Challenge Match", description: "Inter-team challenge. 5v5 best of 5 rounds.", gameType: "CQB", date: daysAgo(7), entranceFee: 0, playerCap: 10, status: "COMPLETED" as const, organizerId: ghost.id, groupId: taskforce.id, siteIndex: 2 },
    { title: "Cebu Airsoft Alliance — Q1 Tournament", description: "Q1 2025 tournament. Prelims through finals in one day.", gameType: "Open Field", date: daysAgo(30), entranceFee: 500, playerCap: 80, status: "COMPLETED" as const, organizerId: mod.id, groupId: null, siteIndex: 0 },
    { title: "Saturday Walk-On — Sandbox Talisay", description: "Regular weekly walk-on. Come as you are.", gameType: "Open Field", date: daysAgo(3), entranceFee: 200, playerCap: 50, status: "COMPLETED" as const, organizerId: fieldOwner.id, groupId: null, siteIndex: 1 },
    { title: "Cancelled: Rain Game — April 5", description: "Called off due to weather. Rescheduled TBA.", gameType: "MilSim", date: daysAgo(5), entranceFee: 350, playerCap: 32, status: "CANCELLED" as const, organizerId: ghost.id, groupId: taskforce.id, siteIndex: 0 },
    { title: "Midnight CQB at The Pit", description: "18+ only. Loud music, fast games, prizes.", gameType: "CQB", date: daysFromNow(45), entranceFee: 300, playerCap: 16, status: "UPCOMING" as const, organizerId: pablo.id, groupId: null, siteIndex: 2 },
    { title: "Sniper vs Riflemen — The Hunt", description: "Snipers vs riflemen scenario at Sandbox. Can the riflemen survive?", gameType: "MilSim", date: daysFromNow(60), entranceFee: 280, playerCap: 24, status: "UPCOMING" as const, organizerId: sniper.id, groupId: null, siteIndex: 1 },
  ];

  const createdEvents = [];
  for (const ev of eventDataList) {
    const { siteIndex, groupId, ...rest } = ev;
    const site = gameSites[siteIndex];
    const event = await prisma.gameEvent.create({
      data: {
        ...rest,
        gameSite: site.site,
        lat: site.lat,
        lng: site.lng,
        locationName: site.locationName,
        ...(groupId ? { groupId } : {}),
        time: "09:00",
        rsvps: {
          create: (() => {
            const idx = createdEvents.length;
            const user1 = allUsers[(idx + 1) % allUsers.length];
            const user2 = allUsers[(idx + 2) % allUsers.length];
            const entries: { userId: string; status: "GOING" | "MAYBE" | "CANCELLED" }[] = [
              { userId: rest.organizerId, status: "GOING" },
            ];
            if (user1.id !== rest.organizerId) entries.push({ userId: user1.id, status: "GOING" });
            if (user2.id !== rest.organizerId && user2.id !== user1.id) entries.push({ userId: user2.id, status: "MAYBE" });
            return entries;
          })(),
        },
      },
    });
    createdEvents.push(event);
  }

  console.log(`  ✓ ${createdEvents.length} game events`);

  // ─────────────────────────────────────────────
  // CONVERSATIONS + MESSAGES (25 conversations, 70+ messages)
  // ─────────────────────────────────────────────

  const conversationPairs = [
    { p1: ghost, p2: pablo, subject: "VFC HK416 sale inquiry" },
    { p1: ghost, p2: sniper, subject: "MilSim team coordination" },
    { p1: ghost, p2: speedster, subject: "Challenge match logistics" },
    { p1: ghost, p2: techie, subject: "Gun tech request" },
    { p1: ghost, p2: operator, subject: "Operation Night Reaper planning" },
    { p1: pablo, p2: sniper, subject: "VSR-10 upgrade advice" },
    { p1: pablo, p2: speedster, subject: "WTT: Krytac for MWS" },
    { p1: pablo, p2: newbie, subject: "Mentoring new player" },
    { p1: pablo, p2: dealer, subject: "Stock inquiry — gas cans" },
    { p1: sniper, p2: techie, subject: "VSR-10 tech work" },
    { p1: sniper, p2: operator, subject: "Night game sniper role" },
    { p1: sniper, p2: fieldOwner, subject: "Long range zone availability" },
    { p1: speedster, p2: techie, subject: "AAP-01 tune-up" },
    { p1: speedster, p2: newbie, subject: "Speedsoft training session" },
    { p1: speedster, p2: dealer, subject: "BB order — bulk" },
    { p1: techie, p2: operator, subject: "MP5 gearbox rebuild" },
    { p1: techie, p2: dealer, subject: "Parts sourcing" },
    { p1: techie, p2: fieldOwner, subject: "Tech station at Tech Day" },
    { p1: operator, p2: newbie, subject: "First game advice" },
    { p1: operator, p2: mod, subject: "Event coordination" },
    { p1: newbie, p2: dealer, subject: "Starter pistol question" },
    { p1: newbie, p2: fieldOwner, subject: "Walk-on rules inquiry" },
    { p1: dealer, p2: fieldOwner, subject: "Ammo restocking at field" },
    { p1: dealer, p2: mod, subject: "Sponsored event proposal" },
    { p1: fieldOwner, p2: mod, subject: "Rule clarification request" },
  ];

  const sampleMessages: Record<string, [string, string][]> = {
    "VFC HK416 sale inquiry": [
      ["pablo", "Hi! Is the HK416 still available?"],
      ["ghost", "Yes it is! Condition is like new. 3 months old."],
      ["pablo", "What's your lowest for meetup price?"],
      ["ghost", "21,500 meetup in Mandaue. Final offer."],
      ["pablo", "Deal. When can we meet?"],
    ],
    "MilSim team coordination": [
      ["ghost", "Mark, you joining Operation Night Reaper?"],
      ["sniper", "Definitely. What role do you need?"],
      ["ghost", "Overwatch from the north building. Snipers are perfect there."],
      ["sniper", "Got it. I'll bring the VSR and a sidearm."],
    ],
    "Gun tech request": [
      ["ghost", "Renz, can you check my 416? Cycling is inconsistent in cold weather."],
      ["techie", "Common issue with VFC GBBRs. Bring it by Saturday."],
      ["ghost", "Will do. What do I need to buy beforehand?"],
      ["techie", "Get some silicon oil and a new nozzle O-ring. I'll handle the rest."],
      ["ghost", "Perfect. See you Saturday."],
    ],
    "VSR-10 upgrade advice": [
      ["pablo", "Mark, thinking of upgrading my VSR. Where should I start?"],
      ["sniper", "Hop up first — PDI W-hold or Maple Leaf MR Hop."],
      ["pablo", "Which do you prefer?"],
      ["sniper", "Maple Leaf for PH weather. Less affected by humidity."],
      ["pablo", "Got it. Barrel next?"],
      ["sniper", "Yes. Prometheus 6.03 or Laylax 6.01 depending on budget."],
    ],
    "AAP-01 tune-up": [
      ["speedster", "Renz, my AAP is shooting inconsistent. Can you look at it?"],
      ["techie", "When did you last clean the barrel?"],
      ["speedster", "Uhh... never?"],
      ["techie", "That's your problem. Bring it by. I'll clean and re-lube everything."],
    ],
    "First game advice": [
      ["operator", "Carlo, first game tips: stay low, call your hits, and don't run around blind."],
      ["newbie", "Thank you sir! Any gear I should bring?"],
      ["operator", "Water (2L minimum in this heat), knee pads, and a backup pistol if you have one."],
      ["newbie", "I only have my pistol right now. Is that okay?"],
      ["operator", "Yes. Borrow a rifle at the field or play close quarters."],
    ],
    "Starter pistol question": [
      ["newbie", "Hi! Looking for a budget pistol under 3k. What do you have?"],
      ["dealer", "We have the WE EU18 for 2,800 and a used Glock 17 for 2,500."],
      ["newbie", "What's the difference?"],
      ["dealer", "EU18 is more compact. Glock 17 has better aftermarket parts."],
      ["newbie", "I'll go with the Glock. Can I reserve it?"],
      ["dealer", "Sure! Come by the shop Saturday."],
    ],
  };

  const createdConversations = [];
  for (let i = 0; i < conversationPairs.length; i++) {
    const { p1, p2, subject } = conversationPairs[i];
    const conv = await prisma.conversation.create({
      data: {
        subject,
        participant1Id: p1.id,
        participant2Id: p2.id,
        lastMessageAt: hoursAgo(conversationPairs.length - i),
      },
    });
    createdConversations.push({ conv, p1, p2, subject });
  }

  // Create messages for conversations that have pre-defined dialogue
  let totalMessages = 0;
  for (const { conv, p1, p2, subject } of createdConversations) {
    const dialogue = sampleMessages[subject];
    const usernameToUser: Record<string, typeof p1> = {
      [p1.username]: p1,
      [p2.username]: p2,
    };

    if (dialogue) {
      for (let mi = 0; mi < dialogue.length; mi++) {
        const [senderUsername, content] = dialogue[mi];
        const senderUser = Object.values(usernameToUser).find(u => u.username === senderUsername) ?? p1;
        await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: senderUser.id,
            content,
            createdAt: hoursAgo(dialogue.length * 2 - mi * 2),
            readAt: mi < dialogue.length - 1 ? hoursAgo(dialogue.length - mi) : null,
          },
        });
        totalMessages++;
      }
    } else {
      // Generic messages for conversations without pre-defined dialogue
      const genericMessages: [typeof p1, string][] = [
        [p1, "Hey, quick question about your listing."],
        [p2, "Sure, go ahead!"],
        [p1, "Is it still available?"],
        [p2, "Yes, still available. Interested?"],
        [p1, "Possibly. Can you send more details?"],
        [p2, "Of course. I'll send photos shortly."],
      ];
      for (let mi = 0; mi < genericMessages.length; mi++) {
        const [sender, content] = genericMessages[mi];
        await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: sender.id,
            content,
            createdAt: hoursAgo(genericMessages.length * 2 - mi * 2),
            readAt: mi < genericMessages.length - 1 ? hoursAgo(genericMessages.length - mi) : null,
          },
        });
        totalMessages++;
      }
    }
  }

  // Update lastMessageAt on conversations
  await Promise.all(
    createdConversations.map(({ conv }, i) =>
      prisma.conversation.update({
        where: { id: conv.id },
        data: { lastMessageAt: hoursAgo(createdConversations.length - i) },
      })
    )
  );

  console.log(`  ✓ ${createdConversations.length} conversations, ${totalMessages} messages`);

  // ─────────────────────────────────────────────
  // NOTIFICATIONS (50 for ghost + pablo)
  // ─────────────────────────────────────────────

  const notifTypes = [
    "comment_on_post",
    "reply_to_comment",
    "post_removed",
    "comment_removed",
    "account_banned",
  ];

  const notifMessages = {
    comment_on_post: (username: string, title: string) => `${username} commented on your post "${title}"`,
    reply_to_comment: (username: string) => `${username} replied to your comment`,
    post_removed: (_: string, title: string) => `Your post "${title}" was removed by a moderator`,
    comment_removed: () => "Your comment was removed by a moderator",
    account_banned: () => "Your account has been temporarily suspended",
  };

  const notifTargets = [ghost.id, pablo.id, sniper.id, speedster.id];
  const notifData: {
    userId: string;
    type: string;
    message: string;
    read: boolean;
    relatedId: string | null;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < 50; i++) {
    const userId = notifTargets[i % notifTargets.length];
    const type = notifTypes[i % notifTypes.length];
    const post = createdPosts[i % createdPosts.length];
    const commenter = allUsers[(i + 3) % allUsers.length];

    let message = "";
    if (type === "comment_on_post") message = notifMessages.comment_on_post(commenter.username, post.title.slice(0, 40));
    else if (type === "reply_to_comment") message = notifMessages.reply_to_comment(commenter.username);
    else if (type === "post_removed") message = notifMessages.post_removed("", post.title.slice(0, 40));
    else if (type === "comment_removed") message = notifMessages.comment_removed();
    else message = notifMessages.account_banned();

    notifData.push({
      userId,
      type,
      message,
      read: i % 3 !== 0,
      relatedId: post.id,
      createdAt: hoursAgo(50 - i),
    });
  }

  await prisma.notification.createMany({ data: notifData });

  console.log(`  ✓ ${notifData.length} notifications`);

  // ─────────────────────────────────────────────
  // AUDIT LOG (65 entries)
  // ─────────────────────────────────────────────

  const auditActions = [
    "POST_REMOVED",
    "POST_RESTORED",
    "POST_PINNED",
    "POST_UNPINNED",
    "POST_LOCKED",
    "POST_UNLOCKED",
    "COMMENT_REMOVED",
    "COMMENT_RESTORED",
    "LISTING_REMOVED",
    "LISTING_RESTORED",
    "EVENT_CANCELLED",
    "USER_BANNED",
    "USER_UNBANNED",
    "USER_ROLE_CHANGED",
    "REPORT_DISMISSED",
    "REPORT_RESOLVED",
  ] as const;

  const auditTargetTypes = ["POST", "COMMENT", "LISTING", "USER", "EVENT", "GROUP"] as const;

  const auditData: {
    actorId: string;
    action: (typeof auditActions)[number];
    targetType: (typeof auditTargetTypes)[number];
    targetId: string;
    reason: string | null;
    public: boolean;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < 65; i++) {
    const action = auditActions[i % auditActions.length];
    let targetType: (typeof auditTargetTypes)[number];
    let targetId: string;

    if (action.startsWith("POST")) {
      targetType = "POST";
      targetId = createdPosts[i % createdPosts.length].id;
    } else if (action.startsWith("COMMENT")) {
      targetType = "COMMENT";
      targetId = createdComments[i % createdComments.length].id;
    } else if (action.startsWith("LISTING")) {
      targetType = "LISTING";
      targetId = createdListings[i % createdListings.length].id;
    } else if (action.startsWith("EVENT")) {
      targetType = "EVENT";
      targetId = createdEvents[i % createdEvents.length].id;
    } else if (action === "USER_BANNED" || action === "USER_UNBANNED" || action === "USER_ROLE_CHANGED") {
      targetType = "USER";
      targetId = allUsers[i % allUsers.length].id;
    } else {
      targetType = "POST";
      targetId = createdPosts[i % createdPosts.length].id;
    }

    auditData.push({
      actorId: mod.id,
      action,
      targetType,
      targetId,
      reason: i % 4 === 0 ? null : `Audit action: ${action.toLowerCase().replace(/_/g, " ")}`,
      public: i % 5 !== 0,
      createdAt: hoursAgo(65 - i),
    });
  }

  await prisma.auditLogEntry.createMany({ data: auditData });

  console.log(`  ✓ ${auditData.length} audit log entries`);

  // ─────────────────────────────────────────────
  // REPORTS (45)
  // ─────────────────────────────────────────────

  const reportCategories = [
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

  const reportStatuses = ["OPEN", "RESOLVED_ACTIONED", "RESOLVED_DISMISSED"] as const;
  const reportTargetTypes = ["POST", "COMMENT", "LISTING", "USER"] as const;

  const reporters = [ghost, pablo, sniper, speedster, techie, operator, newbie];

  const reportData: {
    reporterId: string;
    targetType: (typeof reportTargetTypes)[number];
    targetId: string;
    category: (typeof reportCategories)[number];
    reason: string | null;
    status: (typeof reportStatuses)[number];
    resolvedById: string | null;
    resolvedAt: Date | null;
    resolutionNote: string | null;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < 45; i++) {
    const targetType = reportTargetTypes[i % reportTargetTypes.length];
    let targetId: string;

    if (targetType === "POST") targetId = createdPosts[i % createdPosts.length].id;
    else if (targetType === "COMMENT") targetId = createdComments[i % createdComments.length].id;
    else if (targetType === "LISTING") targetId = createdListings[i % createdListings.length].id;
    else targetId = allUsers[i % allUsers.length].id;

    const status = reportStatuses[i % reportStatuses.length];
    const isResolved = status !== "OPEN";

    reportData.push({
      reporterId: reporters[i % reporters.length].id,
      targetType,
      targetId,
      category: reportCategories[i % reportCategories.length],
      reason: i % 3 === 0 ? null : `Report reason for item ${i + 1}`,
      status,
      resolvedById: isResolved ? mod.id : null,
      resolvedAt: isResolved ? hoursAgo(45 - i - 10) : null,
      resolutionNote: isResolved ? `Resolved: ${status === "RESOLVED_ACTIONED" ? "action taken" : "dismissed, no violation found"}` : null,
      createdAt: hoursAgo(45 - i),
    });
  }

  await prisma.report.createMany({ data: reportData });

  console.log(`  ✓ ${reportData.length} reports`);

  // ─────────────────────────────────────────────
  // DONE
  // ─────────────────────────────────────────────

  console.log("\nSeed complete.");
  console.log("Summary:");
  console.log(`  Users:          ${allUsers.length}`);
  console.log(`  Groups:         3`);
  console.log(`  Posts:          ${createdPosts.length}`);
  console.log(`  Comments:       ${commentData.length + 3}`);
  console.log(`  Post votes:     ${uniqueVotes.length}`);
  console.log(`  Comment votes:  ${uniqueCommentVotes.length}`);
  console.log(`  Listings:       ${createdListings.length}`);
  console.log(`  Events:         ${createdEvents.length}`);
  console.log(`  Conversations:  ${createdConversations.length}`);
  console.log(`  Messages:       ${totalMessages}`);
  console.log(`  Notifications:  ${notifData.length}`);
  console.log(`  Audit entries:  ${auditData.length}`);
  console.log(`  Reports:        ${reportData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
