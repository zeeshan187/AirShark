export interface Author {
  username: string;
  name: string;
  profilePicture: string;
  verified: boolean;
  followers: number;
  following: number;
}

export interface Metrics {
  likes: number;
  retweets: number;
  views: number;
  replies: number;
  quotes: number;
  bookmarks: number;
}

export interface Tweet {
  id: string;
  url: string;
  text: string;
  date: string;
  time: string;
  timestamp: string; // ISO date string for sorting
  author: Author;
  metrics: Metrics;
  token: string | null;
  isScam: boolean;
  hashtags: string[];
  expectedReleaseDate?: string;
}

export interface ApiResponse {
  tweets: Tweet[];
  nextCursor: string | null;
  hasMoreTweets: boolean;
}

export type SortOption = "mostRecent" | "mostLikes" | "mostRetweets" | "mostViews";

export interface FilterOptions {
  showScamTweets: boolean;
  showNonScamTweets: boolean;
  showVerified: boolean;
  showNonVerified: boolean;
  showUnknownTokens: boolean;
  tokenFilter: string;
  dateFilter: string;
  sortBy: SortOption;
}

export interface TwitterApiResponse {
  data: TwitterTweet[];
  meta: {
    has_next_page: boolean;
    next_cursor: string;
  };
}

export interface TwitterTweet {
  type: string;
  id: string;
  url: string;
  twitterUrl?: string;
  text: string;
  source: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  createdAt: string;
  lang: string;
  bookmarkCount: number;
  isReply: boolean;
  inReplyToId: string | null;
  conversationId: string;
  inReplyToUserId: string | null;
  inReplyToUsername: string | null;
  author: TwitterAuthor;
  extendedEntities?: any;
  card?: any;
  place?: any;
  entities?: {
    hashtags?: Array<{text: string}>;
    urls?: Array<any>;
    mentions?: Array<any>;
  };
  quoted_tweet?: any;
  retweeted_tweet?: any;
}

export interface TwitterAuthor {
  type: string;
  userName: string;
  url: string;
  twitterUrl?: string;
  id: string;
  name: string;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  profilePicture: string;
  coverPicture?: string;
  description?: string;
  location?: string;
  followers: number;
  following: number;
  status?: string;
  canDm?: boolean;
  canMediaTag?: boolean;
  createdAt: string;
  entities?: any;
  fastFollowersCount?: number;
  favouritesCount?: number;
  hasCustomTimelines?: boolean;
  isTranslator?: boolean;
  mediaCount?: number;
  statusesCount?: number;
  withheldInCountries?: string[];
  affiliatesHighlightedLabel?: any;
  possiblySensitive?: boolean;
  pinnedTweetIds?: string[];
  profile_bio?: any;
  isAutomated?: boolean;
  automatedBy?: any;
}
