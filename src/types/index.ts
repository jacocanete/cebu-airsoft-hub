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

// Groups

export type Group = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  memberCount: number;
  createdAt: string;
};
