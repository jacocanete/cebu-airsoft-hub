// Shared types used across the frontend.

// Re-export constant-derived types so all types are importable from @/types
import type {
  ForumCategory as _ForumCategory,
  MarketplaceCategory as _MarketplaceCategory,
  Condition as _Condition,
  GameType as _GameType,
} from "@/lib/constants";

export type ForumCategory = _ForumCategory;
export type MarketplaceCategory = _MarketplaceCategory;
export type Condition = _Condition;
export type GameType = _GameType;

// Auth / User

export type User = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  gearList?: string;
  playStyle?: string;
  teamBadge?: GroupBadge;
  createdAt: string;
};

export type GroupBadge = {
  name: string;
  color: string; // tailwind color class e.g. "bg-olive-600"
};

// Forum

export type Post = {
  id: string;
  title: string;
  content: string;
  category: ForumCategory;
  tags: string[];
  author: User;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  pinned: boolean;
  createdAt: string;
};

export type Comment = {
  id: string;
  content: string;
  author: {
    username: string;
    name: string;
    team?: string;
  };
  upvotes: number;
  replies?: Comment[];
  createdAt: string;
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type PollData = {
  question: string;
  options: PollOption[];
  totalVotes: number;
  multiSelect: boolean;
  status: "open" | "closed";
  expiresAt?: string;
};

export type PollDraftOption = Omit<PollOption, "votes">;

export type PollDraft = {
  question: string;
  options: PollDraftOption[];
  multiSelect: boolean;
  expiryHours: number | null;
};

// Marketplace

export type ListingStatus = "Available" | "Reserved" | "Sold";

export type MarketplaceListing = {
  id: string;
  seller: User;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  category: string;
  images: string[];
  status: ListingStatus;
  createdAt: string;
};

// Events

export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export type GameEvent = {
  id: string;
  organizer: User;
  groupName?: string;
  title: string;
  description?: string;
  gameSite: string;
  gameType: GameType;
  date: string;
  time?: string;
  entranceFee?: number;
  lat: number;
  lng: number;
  locationName: string;
  playerCap?: number;
  rules?: string;
  status: EventStatus;
  rsvpCount: number;
  rsvps: User[];
  createdAt: string;
};

// RSVPs

export type RSVPStatus = "GOING" | "MAYBE" | "CANCELLED";

// Posts — list and detail shapes returned by the API

export type PostListItem = Pick<
  Post,
  "id" | "title" | "category" | "tags" | "pinned" | "createdAt"
> & {
  author: { id: string; username: string; name: string };
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote: 1 | -1 | 0;
};

export type PostDetail = Post & {
  content: string;
  votes: Array<{ value: number; userId: string }>;
  _count: { comments: number };
  poll?: {
    question: string;
    multiSelect: boolean;
    expiresAt?: string;
    options: Array<{
      id: string;
      text: string;
      _count?: { votes: number };
      votes?: number;
    }>;
  };
};

// Users

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  gearList?: string;
  playStyle?: string;
  createdAt: string;
  memberships: Array<{ group: { name: string; slug: string } }>;
  _count: { posts: number; listings: number; rsvps: number };
};

export type UserPost = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  createdAt: string;
  _count: { comments: number; votes: number };
};

// Groups

export type Group = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  memberCount: number;
  gameCount?: number;
  createdAt: string;
};
