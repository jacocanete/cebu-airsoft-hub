const MOCK_USERS = {
  ghost_reaper: {
    username: "ghost_reaper",
    name: "Ghost",
    team: "Detachment Reaper"
  },
  tac_pablo: {
    username: "tac_pablo",
    name: "Pablo T.",
    team: "Detachment Reaper"
  },
  sniprcebu: {
    username: "sniprcebu",
    name: "Sgt. Lim",
    team: "Cebu Sniper Corps"
  },
  cebu_operatr: {
    username: "cebu_operatr",
    name: "Marko",
    team: void 0
  },
  bb_wizard: {
    username: "bb_wizard",
    name: "BB Wizard",
    team: void 0
  },
  nightcrawlr: {
    username: "nightcrawlr",
    name: "Night",
    team: "Alpha Phantom Unit"
  }
};
const MOCK_PROFILE = {
  name: "Ghost Reaper",
  username: "ghost_reaper",
  bio: "MilSim player based in Cebu. Squad leader at Detachment Reaper. Running a Krytac + TM Hi-Capa combo. Let's play.",
  playStyle: "MilSim / Assault",
  team: "Detachment Reaper",
  joinedAt: "March 2024",
  gamesAttended: 28,
  listingCount: 5,
  postCount: 14
};
const MOCK_POSTS = [
  {
    id: "p0",
    title: "Welcome to Detachment Reaper — Community Rules & Guidelines",
    category: "News",
    author: MOCK_USERS.ghost_reaper,
    upvotes: 312,
    commentCount: 14,
    createdAt: "3d ago",
    tags: ["rules", "announcement"],
    pinned: true
  },
  {
    id: "p1",
    title: "Upcoming Game Schedule — April 2026",
    category: "News",
    author: MOCK_USERS.tac_pablo,
    upvotes: 98,
    commentCount: 27,
    createdAt: "1d ago",
    tags: ["schedule", "events"],
    pinned: true
  },
  {
    id: "1",
    title: "Best game sites in Cebu right now? Looking for CQB venues",
    category: "General",
    author: MOCK_USERS.ghost_reaper,
    upvotes: 47,
    commentCount: 23,
    createdAt: "2h ago",
    tags: ["CQB", "venues"],
    pinned: false
  },
  {
    id: "2",
    title: "Review: Krytac Trident MK2 after 6 months of abuse — still ripping",
    category: "Gear Reviews",
    author: MOCK_USERS.tac_pablo,
    upvotes: 91,
    commentCount: 41,
    createdAt: "5h ago",
    tags: ["Krytac", "AEG", "review"],
    pinned: false
  },
  {
    id: "3",
    title: "WTS: Tokyo Marui Hi-Capa 5.1 with full upgrade — ₱7,500",
    category: "Buy/Sell",
    author: MOCK_USERS.cebu_operatr,
    upvotes: 12,
    commentCount: 8,
    createdAt: "8h ago",
    tags: ["WTS", "pistol", "GBB"],
    pinned: false
  },
  {
    id: "4",
    title: "How to actually clean your hop-up — a proper guide for beginners",
    category: "Tips & Tactics",
    author: MOCK_USERS.sniprcebu,
    upvotes: 134,
    commentCount: 67,
    createdAt: "1d ago",
    tags: ["maintenance", "hop-up", "beginner"],
    pinned: false
  },
  {
    id: "5",
    title: "Me when the opposing team has a sniper and I only have a pistol",
    category: "Memes",
    author: MOCK_USERS.bb_wizard,
    upvotes: 203,
    commentCount: 19,
    createdAt: "1d ago",
    tags: ["meme"],
    pinned: false
  },
  {
    id: "6",
    title: "New ASTM field regulations — what you need to know before your next game",
    category: "News",
    author: MOCK_USERS.ghost_reaper,
    upvotes: 88,
    commentCount: 34,
    createdAt: "2d ago",
    tags: ["regulations", "safety"],
    pinned: false
  }
];
const MOCK_POST_DETAIL = {
  title: "How to actually clean your hop-up — a proper guide for beginners",
  category: "Tips & Tactics",
  tags: ["maintenance", "hop-up", "beginner"],
  author: { ...MOCK_USERS.sniprcebu },
  upvotes: 134,
  commentCount: 67,
  viewCount: 1204,
  createdAt: "1 day ago",
  pinned: false,
  content: `## Why your hop-up matters

If you've been wondering why your BBs arc left, drop early, or curve in weird directions — **the hop-up is usually the culprit**. Most new players either ignore it completely or over-adjust it and wonder why their range got worse.

This guide covers the basics for AEG and GBB pistols.

---

## What is a hop-up?

The hop-up is a mechanism that applies backspin to the BB as it leaves the barrel. This backspin creates the **Magnus effect** — the same physics that makes a curveball curve — except we're using it to keep the BB flying straight and level for longer.

> A properly tuned hop-up can add 10–20 meters of effective range on a stock gun.

---

## Tools you'll need

- Cleaning rod (the one that came with your gun or a dedicated one)
- Silicone oil — **not WD-40**, never WD-40
- A few paper towels or a lens cloth
- Your hex key set (for field stripping depending on platform)

---

## Step-by-step: Cleaning the hop-up bucking

1. **Field strip your gun** to access the hop-up unit
2. Remove the inner barrel + hop-up unit from the outer barrel
3. Remove the bucking (the rubber sleeve around the barrel entry)
4. Inspect the bucking for tears, warping, or dirt buildup
5. Clean with a dry cloth first — remove loose debris
6. Apply a **tiny** amount of silicone oil to the bucking and nub
7. Reassemble and test

\`\`\`
Pro tip: hold the bucking up to a light source to check for micro-tears.
Even a tiny crack will cause inconsistent backspin.
\`\`\`

---

## Common mistakes

| Mistake | Why it's bad |
|---|---|
| Using WD-40 | Degrades rubber, destroys bucking |
| Over-tightening hop-up | BBs curve sharply upward |
| Under-tightening | No effective range, drops immediately |
| Never cleaning the barrel | Dirt buildup causes wobble and inconsistency |
| Wrong weight BBs | Heavy BBs need more hop, light ones need less |

---

## How to dial in the adjustment

After cleaning, you want to **zero the hop-up** from scratch:

1. Turn the adjustment to minimum (no hop)
2. Fire 3 BBs and watch the trajectory — they should drop quickly
3. Increase hop in small increments (1 click at a time)
4. Stop when the BB flies level for the first 20–30 meters
5. Fine-tune from there based on BB weight

That's it. Clean bucking + proper adjustment = consistent, flat trajectory.

*Any questions, drop them in the comments. Happy to help.*`
};
const MOCK_COMMENTS = [
  {
    id: "c1",
    author: MOCK_USERS.ghost_reaper,
    content: "Finally someone wrote this up properly. I see guys at the field still using WD-40 on their buckings and wondering why their accuracy is trash after 3 games.",
    upvotes: 47,
    createdAt: "22h ago",
    replies: [
      {
        id: "c1a",
        author: MOCK_USERS.sniprcebu,
        content: "It's the most common mistake I see. WD-40 eats rubber compounds fast. Silicone only.",
        upvotes: 29,
        createdAt: "21h ago",
        replies: [
          {
            id: "c1a1",
            author: MOCK_USERS.bb_wizard,
            content: "Can confirm. Destroyed two buckings before someone told me. Now I keep a small bottle of silicone oil in my kit bag.",
            upvotes: 11,
            createdAt: "20h ago",
            replies: []
          }
        ]
      },
      {
        id: "c1b",
        author: MOCK_USERS.tac_pablo,
        content: "The WD-40 thing is basically a rite of passage lol. Everyone does it once.",
        upvotes: 18,
        createdAt: "19h ago",
        replies: []
      }
    ]
  },
  {
    id: "c2",
    author: MOCK_USERS.cebu_operatr,
    content: "What about flat hop and R-hop mods? Worth doing for a stock gun or should I get the basics down first?",
    upvotes: 14,
    createdAt: "20h ago",
    replies: [
      {
        id: "c2a",
        author: MOCK_USERS.sniprcebu,
        content: "Get the basics down first. A clean stock bucking properly adjusted will outperform a badly installed flat hop. Flat hop is a significant upgrade but only if your fundamentals are right.",
        upvotes: 22,
        createdAt: "19h ago",
        replies: []
      }
    ]
  },
  {
    id: "c3",
    author: MOCK_USERS.nightcrawlr,
    content: "The table showing common mistakes is gold. Bookmarking this for the new guys in our unit.",
    upvotes: 9,
    createdAt: "18h ago",
    replies: []
  },
  {
    id: "c4",
    author: MOCK_USERS.bb_wizard,
    content: "Question: do you need to clean the hop-up every time you do a barrel clean, or only when you notice inconsistency?",
    upvotes: 6,
    createdAt: "15h ago",
    replies: [
      {
        id: "c4a",
        author: MOCK_USERS.sniprcebu,
        content: "I do a full clean every ~2000 rounds or whenever I notice my groupings opening up. The barrel you can clean more often since it's quick.",
        upvotes: 8,
        createdAt: "14h ago",
        replies: []
      }
    ]
  }
];
const MOCK_POLL = {
  question: "What BB weight do you use for outdoor field games?",
  options: [
    { id: "1", text: "0.20g", votes: 8 },
    { id: "2", text: "0.25g", votes: 31 },
    { id: "3", text: "0.28g", votes: 19 },
    { id: "4", text: "0.30g+", votes: 12 }
  ],
  totalVotes: 70,
  multiSelect: false,
  status: "open",
  expiresAt: "Apr 10"
};
const MOCK_LISTINGS = [
  {
    id: "1",
    title: "Tokyo Marui MWS GBBR — Full stock, 2 mags",
    price: 22e3,
    condition: "Like New",
    category: "Rifles",
    seller: MOCK_USERS.tac_pablo,
    status: "Available",
    createdAt: "3h ago"
  },
  {
    id: "2",
    title: "WE Hi-Capa 5.1 Dragon + 4 mags + holster",
    price: 8500,
    condition: "Used",
    category: "Pistols",
    seller: MOCK_USERS.ghost_reaper,
    status: "Available",
    createdAt: "6h ago"
  },
  {
    id: "3",
    title: "Emerson G3 Combat Uniform Set — Size M",
    price: 2800,
    condition: "New",
    category: "Gear & Apparel",
    seller: MOCK_USERS.cebu_operatr,
    status: "Available",
    createdAt: "1d ago"
  },
  {
    id: "4",
    title: "Krytac Trident MK2 CRB — Upgraded internals",
    price: 18e3,
    condition: "Used",
    category: "Rifles",
    seller: MOCK_USERS.sniprcebu,
    status: "Reserved",
    createdAt: "1d ago"
  },
  {
    id: "5",
    title: "G&P M4 RIS Stock — Airsoft only",
    price: 1200,
    condition: "Used",
    category: "Parts",
    seller: MOCK_USERS.bb_wizard,
    status: "Available",
    createdAt: "2d ago"
  },
  {
    id: "6",
    title: "BLS 0.20g BBs — 5000 rounds, unopened",
    price: 350,
    condition: "New",
    category: "Ammo & BBs",
    seller: MOCK_USERS.tac_pablo,
    status: "Available",
    createdAt: "2d ago"
  }
];
const MOCK_EVENTS = [
  {
    id: "1",
    title: "Operation Blackout — Night MilSim",
    gameType: "MilSim",
    gameSite: "Cebu Tactical Arena",
    locationName: "Mandaue City, Cebu",
    date: "Apr 12, 2026",
    time: "6:00 PM",
    entranceFee: 350,
    playerCap: 60,
    rsvpCount: 38,
    organizer: MOCK_USERS.ghost_reaper,
    groupName: "Detachment Reaper",
    status: "Upcoming"
  },
  {
    id: "2",
    title: "Saturday CQB Skirmish — Open to all",
    gameType: "CQB",
    gameSite: "Urban Zone Cebu",
    locationName: "Cebu City",
    date: "Apr 15, 2026",
    time: "8:00 AM",
    entranceFee: 200,
    playerCap: 30,
    rsvpCount: 21,
    organizer: MOCK_USERS.tac_pablo,
    groupName: void 0,
    status: "Upcoming"
  },
  {
    id: "3",
    title: "Speedsoft Open — Best of 5 rounds",
    gameType: "Speedsoft",
    gameSite: "SpeedField PH Cebu",
    locationName: "Lapu-Lapu City, Cebu",
    date: "Apr 19, 2026",
    time: "9:00 AM",
    entranceFee: 150,
    playerCap: void 0,
    rsvpCount: 14,
    organizer: MOCK_USERS.bb_wizard,
    groupName: void 0,
    status: "Upcoming"
  },
  {
    id: "4",
    title: "Outdoor Field Day — Bring your sniper builds",
    gameType: "Open Field",
    gameSite: "Foresta Airsoft Park",
    locationName: "Talisay City, Cebu",
    date: "Apr 26, 2026",
    time: "7:00 AM",
    entranceFee: 400,
    playerCap: 80,
    rsvpCount: 52,
    organizer: MOCK_USERS.sniprcebu,
    groupName: "Cebu Sniper Corps",
    status: "Upcoming"
  }
];
const MOCK_EVENT_DETAIL = {
  ...MOCK_EVENTS[0],
  description: "Full night milsim operation. Bring your NV-compatible loadout, IR lasers, and suppressors if you have them. This is a structured game with mission objectives — not a skirmish. Briefing starts at 5:30 PM sharp. Do not be late.",
  participants: [
    { id: "1", ...MOCK_USERS.ghost_reaper },
    { id: "2", ...MOCK_USERS.tac_pablo },
    { id: "3", ...MOCK_USERS.sniprcebu },
    { id: "4", ...MOCK_USERS.cebu_operatr },
    { id: "5", ...MOCK_USERS.bb_wizard },
    { id: "6", ...MOCK_USERS.nightcrawlr }
  ]
};
const MOCK_GROUPS = [
  {
    id: "1",
    name: "Detachment Reaper",
    slug: "detachment-reaper",
    description: "Cebu-based milsim unit. Discipline, teamwork, and fun. Est. 2019.",
    memberCount: 42,
    gameCount: 28
  },
  {
    id: "2",
    name: "Cebu Sniper Corps",
    slug: "cebu-sniper-corps",
    description: "Dedicated to long-range precision shooting and patience. Bolt actions only.",
    memberCount: 18,
    gameCount: 15
  },
  {
    id: "3",
    name: "Urban Strike Cebu",
    slug: "urban-strike-cebu",
    description: "CQB and speedsoft players. Fast, aggressive, and always in the thick of it.",
    memberCount: 31,
    gameCount: 22
  },
  {
    id: "4",
    name: "Alpha Phantom Unit",
    slug: "alpha-phantom-unit",
    description: "Night game specialists. We live in the dark.",
    memberCount: 24,
    gameCount: 11
  },
  {
    id: "5",
    name: "Lapu-Lapu Airsoft Club",
    slug: "lapulapu-airsoft-club",
    description: "The biggest airsoft community in Mactan Island. Open to all skill levels.",
    memberCount: 87,
    gameCount: 45
  },
  {
    id: "6",
    name: "Mandaue Milsim Group",
    slug: "mandaue-milsim",
    description: "Tactical players from Mandaue. Reg games every other weekend.",
    memberCount: 29,
    gameCount: 19
  }
];
export {
  MOCK_LISTINGS as M,
  MOCK_GROUPS as a,
  MOCK_POSTS as b,
  MOCK_EVENTS as c,
  MOCK_PROFILE as d,
  MOCK_POST_DETAIL as e,
  MOCK_POLL as f,
  MOCK_COMMENTS as g,
  MOCK_EVENT_DETAIL as h
};
