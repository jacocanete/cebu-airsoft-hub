# Detachment Reaper — Cebu Airsoft Community Platform

A niche social platform for the Cebu airsoft community. Three core pillars: **Discussion**, **Marketplace**, and **Matchmaking/Events**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (self-hosted VPS) |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js v5) |
| UI | Tailwind CSS + shadcn/ui |
| File Storage | Cloudflare R2 (S3-compatible) |
| Maps | Google Maps JavaScript API |
| Hosting | Self-hosted VPS |

---

## Feature List

### 1. User Accounts & Profiles
- Registration / Login (email + password, Google OAuth)
- Customizable profile: avatar, cover photo, bio, gear list, play style, team affiliation
- Profile badges: team badges, event participation count, marketplace reputation
- Activity history: posts, RSVPs, listings
- Settings page: edit profile, change password, notification preferences

### 2. Groups / Teams
- Groups can register on the site (name, slug, logo, description, banner)
- Group profile page with member list and roster
- Group roles: Owner, Admin, Member
- Group badges that render on member profiles throughout the site
- Group admins can manage members and group info

### 3. Discussion Forum (Reddit-style)
- Create posts with title, body (rich text), category, and tags
- Categories: General Discussion, Gear Reviews, Tips & Tactics, Buy/Sell Questions, Memes, News
- Upvote / downvote system
- Threaded comments (nested replies)
- Sort by: New, Top, Hot
- Filter by category
- Post flair / tags
- Search posts

### 4. Marketplace
- Users create a "shop" attached to their profile (shop name, description, banner)
- Product listings:
  - Multiple photos (upload to Cloudflare R2)
  - Title, description, price, condition (New / Like New / Used / For Parts)
  - Category: Rifles, Pistols, SMGs, Shotguns, Gear & Apparel, Accessories, Parts, Ammo & BBs, Other
  - Status: Available / Reserved / Sold
- Browse with filters: category, condition, price range, location
- Search listings
- Single listing page with image gallery, seller info, and "Message Seller" button
- User shop view on their profile (all their listings)
- Seller reviews: buyers can leave a rating + comment after a deal

### 5. Game Matchmaking / Events
- Create a game/event post:
  - Title and description
  - Game site name
  - Date and time
  - Location: Google Maps place picker (lat/lng stored, map embed on event page)
  - Entrance fee (or "Free")
  - Game type: MilSim, CQB, Speedsoft, Open Field, Night Game, etc.
  - Player cap (optional)
  - Rules / notes
  - Organizing group (optional link to a registered group)
- Events list page: upcoming games, sortable by date, filterable by game type
- Single event page:
  - Full details + embedded Google Map
  - **RSVP button** (requires account)
  - Live participant list showing names, avatars, team badges
  - Player count: "23 / 40 going"
- Event status: Upcoming / Ongoing / Completed / Cancelled
- Organizer can cancel or mark event as completed

---

## Phase Plan

### Phase 1 — Foundation (current focus: frontend)
- [x] Project scaffold (Next.js, Tailwind, shadcn/ui)
- [ ] Route structure (all pages as stubs)
- [ ] Global layout + navbar + footer
- [ ] Landing page
- [ ] Auth pages (login, register) — UI only for now
- [ ] User profile page — UI only
- [ ] Settings page — UI only

### Phase 2 — Discussion Forum UI
- [ ] Feed page (post cards, sort/filter controls)
- [ ] Single post page (post body, comment thread)
- [ ] Create post form

### Phase 3 — Marketplace UI
- [ ] Marketplace browse page (listing cards, filters sidebar)
- [ ] Single listing page (image gallery, seller card)
- [ ] Create listing form
- [ ] User shop view

### Phase 4 — Events UI
- [ ] Events list page (event cards, calendar toggle)
- [ ] Single event page (map embed, RSVP section, participant list)
- [ ] Create event form (Google Maps place picker)

### Phase 5 — Groups UI
- [ ] Groups browse page
- [ ] Group profile page
- [ ] Create group form

### Phase 6 — Backend: Database & API
- [ ] Prisma schema (see below)
- [ ] PostgreSQL setup
- [ ] NextAuth.js (email/password + Google)
- [ ] API routes / Server Actions for all features

### Phase 7 — Polish & Deploy
- [ ] Global search
- [ ] Notifications system
- [ ] Admin/mod tools
- [ ] Mobile responsiveness pass
- [ ] SEO (metadata, sitemap, OG images)
- [ ] VPS deploy (PM2 + Nginx + Let's Encrypt)

---

## Database Schema (Prisma — for Phase 6)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  name          String
  username      String   @unique
  bio           String?
  avatar        String?  // R2 URL
  coverPhoto    String?  // R2 URL
  gearList      String?
  playStyle     String?
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  posts         Post[]
  comments      Comment[]
  votes         Vote[]
  listings      MarketplaceListing[]
  rsvps         RSVP[]
  memberships   GroupMembership[]
  eventsCreated GameEvent[]
  reviewsGiven  SellerReview[] @relation("ReviewerRelation")
  reviewsReceived SellerReview[] @relation("SellerRelation")
  accounts      Account[]
  sessions      Session[]
  notifications Notification[]
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

model Account {
  // NextAuth.js required fields
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Group {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  logo        String?  // R2 URL
  banner      String?  // R2 URL
  createdAt   DateTime @default(now())

  members     GroupMembership[]
  events      GameEvent[]
}

model GroupMembership {
  userId    String
  groupId   String
  role      GroupRole @default(MEMBER)
  joinedAt  DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  group     Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  @@id([userId, groupId])
}

enum GroupRole {
  MEMBER
  ADMIN
  OWNER
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  category  String
  tags      String[]
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  comments  Comment[]
  votes     Vote[]
}

model Comment {
  id              String    @id @default(cuid())
  content         String
  postId          String
  authorId        String
  parentCommentId String?
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent          Comment?  @relation("CommentReplies", fields: [parentCommentId], references: [id])
  replies         Comment[] @relation("CommentReplies")
  createdAt       DateTime  @default(now())
}

model Vote {
  userId String
  postId String
  value  Int     // +1 or -1
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@id([userId, postId])
}

model MarketplaceListing {
  id          String          @id @default(cuid())
  sellerId    String
  title       String
  description String
  price       Decimal
  condition   ItemCondition
  category    String
  images      String[]        // R2 URLs
  status      ListingStatus   @default(AVAILABLE)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  seller      User            @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  reviews     SellerReview[]
}

enum ItemCondition {
  NEW
  LIKE_NEW
  USED
  FOR_PARTS
}

enum ListingStatus {
  AVAILABLE
  RESERVED
  SOLD
}

model SellerReview {
  id         String             @id @default(cuid())
  sellerId   String
  reviewerId String
  listingId  String?
  rating     Int                // 1–5
  comment    String?
  createdAt  DateTime           @default(now())
  seller     User               @relation("SellerRelation", fields: [sellerId], references: [id], onDelete: Cascade)
  reviewer   User               @relation("ReviewerRelation", fields: [reviewerId], references: [id], onDelete: Cascade)
  listing    MarketplaceListing? @relation(fields: [listingId], references: [id])
}

model GameEvent {
  id           String      @id @default(cuid())
  organizerId  String
  groupId      String?
  title        String
  description  String?
  gameSite     String
  gameType     String
  date         DateTime
  entranceFee  Decimal?    // null = free
  lat          Float
  lng          Float
  locationName String
  playerCap    Int?
  rules        String?
  status       EventStatus @default(UPCOMING)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  organizer    User        @relation(fields: [organizerId], references: [id], onDelete: Cascade)
  group        Group?      @relation(fields: [groupId], references: [id])
  rsvps        RSVP[]
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

model RSVP {
  userId    String
  eventId   String
  status    RSVPStatus @default(GOING)
  createdAt DateTime   @default(now())
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     GameEvent  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  @@id([userId, eventId])
}

enum RSVPStatus {
  GOING
  MAYBE
  CANCELLED
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  message   String
  read      Boolean  @default(false)
  relatedId String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## URL Structure

```
/                          Landing page
/feed                      Discussion forum feed
/feed/[id]                 Single post + comments
/feed/new                  Create post
/marketplace               Browse listings
/marketplace/[id]          Single listing
/marketplace/new           Create listing
/events                    Upcoming games
/events/[id]               Single event + RSVP
/events/new                Create event
/profile/[username]        User profile
/groups                    Browse groups
/groups/[slug]             Group profile
/settings                  User settings
/login                     Login
/register                  Register
```

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          ← navbar + footer wrapper
│   │   ├── page.tsx            ← landing page
│   │   ├── feed/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── marketplace/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   ├── groups/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx              ← root layout (fonts, html/body)
│   └── globals.css
├── components/
│   ├── ui/                     ← shadcn/ui primitives
│   ├── layout/                 ← Navbar, Footer, Sidebar
│   ├── feed/                   ← PostCard, CommentThread, VoteButtons
│   ├── marketplace/            ← ListingCard, ImageGallery, SellerCard
│   ├── events/                 ← EventCard, RSVPButton, ParticipantList, MapEmbed
│   ├── profile/                ← ProfileHeader, ActivityFeed, ShopPreview
│   └── groups/                 ← GroupCard, MemberList, GroupBadge
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── r2.ts
│   └── maps.ts
└── types/
    └── index.ts
```
