export interface Tweet {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  metrics: {
    likes: number;
    retweets: number;
    views?: number;
    replies?: number;
    quotes?: number;
    bookmarks?: number;
  };
  likeCount?: number;
  retweetCount?: number;
  viewCount?: number;
  replyCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
  type?: string;
  source?: string;
  lang?: string;
  isReply?: boolean;
  inReplyToId?: string;
  conversationId?: string;
  inReplyToUserId?: string;
  inReplyToUsername?: string;
  author: {
    userName: string;
    name: string;
    profilePicture: string;
    isBlueVerified: boolean;
    id?: string;
    url?: string;
    description?: string;
    followers?: number;
    following?: number;
  };
  entities?: {
    hashtags?: Array<{
      indices: number[];
      text: string;
    }>;
    urls?: Array<{
      display_url: string;
      expanded_url: string;
      indices: number[];
      url: string;
    }>;
    user_mentions?: Array<{
      id_str: string;
      name: string;
      screen_name: string;
    }>;
  };
  quoted_tweet?: Tweet;
  retweeted_tweet?: Tweet;
  searchQuery: string;
}

export interface TweetResponse {
  tweets: Tweet[];
  has_next_page: boolean;
  next_cursor: string;
  new_tweets_found?: number;
}

export interface ProcessedTweet {
  id: string;
  url: string;
  text: string;
  date: string;
  time: string;
  token: string;
  expectedRelease: string;
  author: {
    userName: string;
    name: string;
    profilePicture: string;
    isBlueVerified: boolean;
    followers?: number;
    following?: number;
  };
  metrics: {
    likes: number;
    retweets: number;
    views?: number;
    replies?: number;
    quotes?: number;
    bookmarks?: number;
  };
  hashtags?: string[];
  mentions?: string[];
  isReply?: boolean;
  isRetweet?: boolean;
  isQuote?: boolean;
  source?: string;
  searchQuery: string;
  qualityIndicators?: {
    hasDate: boolean;
    hasTime: boolean;
    hasLink: boolean;
    isVerified: boolean;
    hasToken: boolean;
    scamScore: number;
  };
  scamIndicators?: {
    isScam: boolean;
    patterns: string[];
  };
}