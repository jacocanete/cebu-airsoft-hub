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

// Auth / Session

export type Role = "USER" | "MODERATOR" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  username: string;
  role: Role;
};

export type Session = {
  user: SessionUser;
  session: { id: string };
};

// User (public profile shape)

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
    id: string;
    username: string;
    name: string;
  };
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | 0;
  _count: { replies: number };
  replies?: Comment[];
  createdAt: string;
  editedAt?: string | null;
  // Populated only on newly-created/updated comments (mutation response + socket broadcast).
  // Tells the client which replies cache contains this comment's parent so
  // targeted cache invalidation is possible without guessing or cache walking.
  parentCommentId?: string | null;
  parent?: { parentCommentId: string | null } | null;
} & SoftDeleteFields;

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type PollData = {
  id: string;
  postId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  multiSelect: boolean;
  status: "open" | "closed";
  expiresAt?: string | null;
  /** Option IDs the current user has voted on. Empty array for unauthenticated users. */
  userVotes: string[];
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
  rsvps: Array<{ userId: string; status: RSVPStatus; user: { id: string; username: string; name: string } }>;
  userRsvp: RSVPStatus | null;
  createdAt: string;
};

// RSVPs

export type RSVPStatus = "GOING" | "MAYBE" | "CANCELLED";

// Posts — list and detail shapes returned by the API

// Soft-delete fields present on Post and Comment API responses
export type SoftDeleteFields = {
  deletedAt: string | null;
  deletedByAuthor: boolean;
  deletionReason: string | null;
  deletedBy: { username: string } | null;
};

export type PostListItem = Pick<
  Post,
  "id" | "title" | "category" | "tags" | "pinned" | "createdAt"
> &
  SoftDeleteFields & {
    locked: boolean;
    editedAt: string | null;
    excerpt: string;
    author: { id: string; username: string; name: string };
    upvotes: number;
    downvotes: number;
    commentCount: number;
    userVote: 1 | -1 | 0;
  };

export type PostsPage = {
  items: PostListItem[];
  nextCursor: string | null;
};

export type PostDetail = Post &
  SoftDeleteFields & {
    locked: boolean;
    editedAt: string | null;
    content: string;
    votes: Array<{ value: number; userId: string }>;
    _count: { comments: number };
    poll?: {
      id: string;
      postId: string;
      question: string;
      multiSelect: boolean;
      expiresAt?: string | null;
      userVotes: string[];
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
  role: Role;
  createdAt: string;
  memberships: Array<{ group: { name: string; slug: string } }>;
  _count: { posts: number; listings: number; rsvps: number };
  bans: ActiveBan[];
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

// Notifications

export type NotificationType =
  | "comment_on_post"
  | "reply_to_comment"
  | "post_removed"
  | "comment_removed"
  | "account_banned";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
};

export type NotificationsPage = {
  notifications: Notification[];
  nextCursor: string | null;
  unreadCount: number;
};

// Bans & mod notes

export type Ban = {
  id: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
  liftedAt: string | null;
  bannedBy: { username: string };
  liftedBy: { username: string } | null;
};

export type ActiveBan = {
  reason: string;
  expiresAt: string | null;
  createdAt: string;
};

export type ModNote = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string };
};

// Moderation

export type ModerationTarget = "POST" | "COMMENT" | "LISTING" | "USER" | "EVENT" | "GROUP";

export type ReportCategory =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "NSFW"
  | "MISINFORMATION"
  | "OFF_TOPIC"
  | "CHEATING_ACCUSATION_WITHOUT_PROOF"
  | "DOXXING"
  | "OTHER";

export type ReportStatus = "OPEN" | "RESOLVED_ACTIONED" | "RESOLVED_DISMISSED";

export type AuditAction =
  | "POST_REMOVED"
  | "POST_RESTORED"
  | "POST_PINNED"
  | "POST_UNPINNED"
  | "POST_LOCKED"
  | "POST_UNLOCKED"
  | "COMMENT_REMOVED"
  | "COMMENT_RESTORED"
  | "LISTING_REMOVED"
  | "LISTING_RESTORED"
  | "EVENT_CANCELLED"
  | "GROUP_REMOVED"
  | "USER_BANNED"
  | "USER_UNBANNED"
  | "USER_ROLE_CHANGED"
  | "REPORT_DISMISSED"
  | "REPORT_RESOLVED";

export type Report = {
  id: string;
  targetType: ModerationTarget;
  targetId: string;
  category: ReportCategory;
  reason: string | null;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  reporter: { id: string; username: string; name: string };
  resolvedBy: { id: string; username: string } | null;
};

export type AuditLogEntry = {
  id: string;
  action: AuditAction;
  targetType: ModerationTarget;
  targetId: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  public: boolean;
  createdAt: string;
  actor: { id: string; username: string; name: string };
};

// Search result shapes — lean projections returned by the search endpoints

export type EventListItem = {
  id: string;
  title: string;
  description?: string;
  gameSite: string;
  gameType: string;
  locationName: string;
  date: string;
  status: EventStatus;
  organizer: { id: string; username: string; name: string };
  _count: { rsvps: number };
  createdAt: string;
};

export type GroupListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  _count: { members: number };
  createdAt: string;
};

export type UserListItem = {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  _count: { posts: number; listings: number };
};

// Messaging

export type ConversationContext = "POST" | "LISTING" | "EVENT" | "GROUP";

export type MessageEmbed = {
  type: "post" | "listing" | "event" | "group";
  title: string;
  description: string;
  image?: string;
  url: string;
};

export type MessageParticipant = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: MessageParticipant;
  content: string;
  embed: MessageEmbed | null;
  readAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export type ConversationListItem = {
  id: string;
  subject: string;
  contextType: ConversationContext | null;
  contextId: string | null;
  participant: MessageParticipant;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    readAt: string | null;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
};

export type ConversationDetail = {
  id: string;
  subject: string;
  contextType: ConversationContext | null;
  contextId: string | null;
  participant: MessageParticipant;
  lastMessageAt: string | null;
};

export type ConversationsPage = {
  conversations: ConversationListItem[];
  nextCursor: string | null;
};

export type MessagesPage = {
  messages: Message[];
  nextCursor: string | null;
};

export type BlockedUser = {
  id: string;
  createdAt: string;
  blocked: MessageParticipant;
};
