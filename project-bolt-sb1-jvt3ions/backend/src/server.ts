import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AxiosError } from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define types for Twitter API response
interface TwitterAuthor {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  verified: boolean;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
  };
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
    verified: boolean;
    public_metrics?: {
      followers_count: number;
      following_count: number;
    };
  };
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    view_count?: number;
    bookmark_count?: number;
  };
  entities?: {
    hashtags?: Array<{ text: string }>;
    user_mentions?: Array<{ screen_name: string; name: string }>;
  };
  type: string;
  url: string;
  twitterUrl: string;
  viewCount?: number;
}

interface TwitterApiResponse {
  tweets: TwitterTweet[];
  meta: {
    next_token?: string;
    result_count: number;
  };
}

interface TweetScore {
  score: number;
  reasons: string[];
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Search queries to rotate through - more specific to airdrop variations
const searchQueries = [
  "(airdrop solana)", 
  "(airdrop sol)",
  "(air drop solana)",
  "(solana airdrop)",
  "(sol airdrop)",
  "(solana air drop)",
  "(airdrop $sol)",
  "(airdrop $solana)",
  "(solana token airdrop)",
  "(sol token airdrop)"
];

// In-memory storage for tweets with timestamps and scores
const tweetStorage = new Map<string, {
  tweet: any,
  timestamp: Date,
  searchQuery: string,
  score: TweetScore
}>();

// Scoring weights
const SCORE_WEIGHTS = {
  ACCOUNT_AGE_DAYS: 0.2,
  FOLLOWER_COUNT: 0.3,
  ENGAGEMENT_RATE: 0.2,
  VERIFIED: 0.15,
  TWEET_QUALITY: 0.15
};

let currentQueryIndex = 0;
let consecutiveEmptySearches = 0;

// Clean up old tweets (older than 30 days)
const cleanupOldTweets = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  for (const [id, data] of tweetStorage.entries()) {
    if (data.timestamp < thirtyDaysAgo) {
      tweetStorage.delete(id);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldTweets, 60 * 60 * 1000);

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default development port
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Check if tweet is too old (more than 3 days)
function isTweetTooOld(tweetDate: string): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(tweetDate) < threeDaysAgo;
}

// Extract token from tweet text
function extractToken(text: string): string | null {
  // Skip if text contains monetary values with k/K, m/M suffixes
  if (text.match(/\$\d+[kmKM]/i)) return null;
  
  // Skip if text contains plain monetary values
  if (text.match(/\$\d+([,\.]\d+)?/)) return null;
  
  // Look for token pattern with $ prefix - must be 2-10 letters/numbers, starting with a letter
  const tokenMatch = text.match(/\$([A-Z][A-Z0-9]{1,9})/i);
  if (tokenMatch) return tokenMatch[1].toUpperCase();

  // Look for token mentions with specific keywords
  const tokenKeywords = ['TOKEN', 'AIRDROP', 'PRESALE'];
  for (const keyword of tokenKeywords) {
    // Token must start with a letter and be 2-10 chars
    const regex = new RegExp(`\\b([A-Z][A-Z0-9]{1,9})\\s+${keyword}\\b`, 'i');
    const match = text.match(regex);
    if (match) return match[1].toUpperCase();
  }

  return null;
}

// Calculate tweet score based on various factors
function calculateTweetScore(tweet: any): TweetScore {
  const score: TweetScore = {
    score: 0,
    reasons: []
  };

  // 1. Account Age Score (0-100)
  const accountCreatedAt = new Date(tweet.author.created_at || Date.now());
  const accountAgeDays = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const accountAgeScore = Math.min(100, (accountAgeDays / 365) * 100);
  
  // 2. Follower Count Score (0-100)
  const followerCount = tweet.author.public_metrics?.followers_count || 0;
  const followerScore = Math.min(100, (followerCount / 10000) * 100);
  
  // 3. Engagement Rate Score (0-100)
  const totalEngagement = (tweet.public_metrics?.like_count || 0) +
                         (tweet.public_metrics?.retweet_count || 0) +
                         (tweet.public_metrics?.reply_count || 0);
  const engagementRate = followerCount > 0 ? (totalEngagement / followerCount) * 100 : 0;
  const engagementScore = Math.min(100, engagementRate * 20);
  
  // 4. Verified Account Score (0-100)
  const verifiedScore = tweet.author.verified ? 100 : 0;
  
  // 5. Tweet Quality Score (0-100)
  const tweetQualityScore = calculateTweetQualityScore(tweet);

  // Calculate weighted average
  score.score = (
    accountAgeScore * SCORE_WEIGHTS.ACCOUNT_AGE_DAYS +
    followerScore * SCORE_WEIGHTS.FOLLOWER_COUNT +
    engagementScore * SCORE_WEIGHTS.ENGAGEMENT_RATE +
    verifiedScore * SCORE_WEIGHTS.VERIFIED +
    tweetQualityScore * SCORE_WEIGHTS.TWEET_QUALITY
  );

  // Add reasons for the score
  if (accountAgeScore > 50) score.reasons.push('Established account');
  if (followerScore > 50) score.reasons.push('High follower count');
  if (engagementScore > 50) score.reasons.push('Good engagement');
  if (verifiedScore > 0) score.reasons.push('Verified account');
  if (tweetQualityScore > 50) score.reasons.push('High quality tweet');

  return score;
}

// Calculate tweet quality score based on content
function calculateTweetQualityScore(tweet: any): number {
  let score = 0;
  const text = tweet.text.toLowerCase();

  // Check for quality indicators
  if (text.includes('whitelist')) score += 10;
  if (text.includes('official')) score += 10;
  if (text.includes('verified')) score += 10;
  if (text.match(/\$[A-Za-z]+/)) score += 15; // Has token symbol
  if (text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) score += 15; // Has date
  if (text.match(/\d+:\d+/)) score += 10; // Has time
  if (text.includes('https://')) score += 10; // Has link

  return Math.max(0, Math.min(100, score));
}

// Improved filtering logic
function isQualityTweet(tweet: any): boolean {
    // Basic quality checks
    if (!tweet.text || !tweet.author) return false;

    // Account quality checks
    const accountAge = Date.now() - new Date(tweet.author.createdAt).getTime();
    const minAccountAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (accountAge < minAccountAgeMs) return false;

    // Engagement checks
    const hasMinEngagement = tweet.likeCount > 5 || tweet.retweetCount > 2;
    if (!hasMinEngagement) return false;

    return true;
}

// Check for suspicious patterns in tweet
function detectSuspiciousPatterns(text: string): { isScam: boolean; patterns: string[] } {
    const suspiciousPatterns = [
        { pattern: /send.*dm|dm.*me/i, description: 'Requests to send DMs' },
        { pattern: /connect.*wallet/i, description: 'Wallet connection request' },
        { pattern: /validate.*wallet|sync.*wallet/i, description: 'Wallet validation/sync request' },
        { pattern: /urgent|hurry|limited time/i, description: 'Urgency-based language' },
        { pattern: /claim.*now|last.*chance/i, description: 'Urgent claim messaging' },
        { pattern: /only.*\d+.*left/i, description: 'Artificial scarcity' },
        { pattern: /first.*\d+.*users/i, description: 'FOMO tactics' }
    ];
    
    const foundPatterns = suspiciousPatterns
        .filter(({ pattern }) => pattern.test(text))
        .map(({ description }) => description);
    
    return {
        isScam: foundPatterns.length > 0,
        patterns: foundPatterns
    };
}

// Transform tweet for response
function transformTweet(tweet: any, searchQuery: string) {
    // Extract metrics from both public_metrics and root level fields
    const metrics = {
        likes: tweet.likeCount || tweet.public_metrics?.like_count || 0,
        retweets: tweet.retweetCount || tweet.public_metrics?.retweet_count || 0,
        views: tweet.viewCount || tweet.public_metrics?.view_count || 0,
        replies: tweet.replyCount || tweet.public_metrics?.reply_count || 0,
        quotes: tweet.quoteCount || tweet.public_metrics?.quote_count || 0,
        bookmarks: tweet.bookmarkCount || tweet.public_metrics?.bookmark_count || 0
    };

    // Log raw metrics for debugging
    console.log('Raw tweet metrics:', {
        id: tweet.id,
        text: tweet.text.substring(0, 50),
        root_metrics: {
            likeCount: tweet.likeCount,
            retweetCount: tweet.retweetCount,
            viewCount: tweet.viewCount,
            replyCount: tweet.replyCount,
            quoteCount: tweet.quoteCount,
            bookmarkCount: tweet.bookmarkCount
        },
        public_metrics: tweet.public_metrics,
        final_metrics: metrics
    });

    // Ensure profile picture URL is properly formatted
    let profilePicture = tweet.author.profilePicture || tweet.author.profile_image_url;
    if (profilePicture) {
        // Replace 'normal' size with 'bigger' for better quality
        profilePicture = profilePicture.replace('_normal.', '_bigger.');
    } else {
        profilePicture = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
    }
    
    const score = calculateTweetScore(tweet);
    const suspiciousCheck = detectSuspiciousPatterns(tweet.text);
    
    return {
        id: tweet.id,
        url: `https://x.com/${tweet.author.userName || tweet.author.username}/status/${tweet.id}`,
        text: tweet.text,
        author: {
            name: tweet.author.name || 'Unknown',
            userName: tweet.author.userName || tweet.author.username,
            profilePicture: profilePicture,
            isBlueVerified: tweet.author.isBlueVerified || tweet.author.verified || false,
            followers: tweet.author.followers || tweet.author.public_metrics?.followers_count || 0,
            following: tweet.author.following || tweet.author.public_metrics?.following_count || 0
        },
        metrics: metrics,
        entities: tweet.entities || {},
        searchQuery: searchQuery,
        score: score.score,
        scoreReasons: score.reasons,
        scamIndicators: suspiciousCheck
    };
}

// Fetch tweets with the current search query
async function fetchTweetsWithQuery(query: string): Promise<number> {
  try {
    console.log(`Making request to Twitter API with query: ${query}`);
    
    const response = await axios.get('https://api.twitterapi.io/twitter/tweet/advanced_search', {
      headers: {
        'X-API-Key': 'e80b3fe69adc422fad7dc367147b3f97'
      },
      params: {
        query: query,
        queryType: 'Top',
        limit: 50
      }
    });
    
    if (!response.data?.tweets || !Array.isArray(response.data.tweets)) {
      console.log('No tweets found in response or invalid response format');
      return 0;
    }

    // Log the first tweet's structure for debugging
    if (response.data.tweets.length > 0) {
      console.log('First tweet structure:', JSON.stringify({
        id: response.data.tweets[0].id,
        text: response.data.tweets[0].text.substring(0, 50),
        public_metrics: response.data.tweets[0].public_metrics,
        metrics: {
          like_count: response.data.tweets[0].like_count,
          retweet_count: response.data.tweets[0].retweet_count,
          view_count: response.data.tweets[0].view_count,
          reply_count: response.data.tweets[0].reply_count,
          quote_count: response.data.tweets[0].quote_count
        }
      }, null, 2));
    }

    console.log(`Found ${response.data.tweets.length} tweets from API`);
    let newTweetsFound = 0;
    
    response.data.tweets.forEach((tweet: any) => {
      if (!isTweetTooOld(tweet.created_at) && !tweetStorage.has(tweet.id)) {
        const token = extractToken(tweet.text);
        if (token) {
          const transformedTweet = transformTweet(tweet, query);
          // Store all tweets with tokens, regardless of score
          tweetStorage.set(tweet.id, {
            tweet: transformedTweet,
            timestamp: new Date(),
            searchQuery: query,
            score: {
              score: transformedTweet.score,
              reasons: transformedTweet.scoreReasons
            }
          });
          newTweetsFound++;
          console.log(`Added tweet with score ${transformedTweet.score} and metrics:`, transformedTweet.metrics);
        } else {
          console.log(`Skipped tweet with no token: ${tweet.text.substring(0, 100)}...`);
        }
      } else {
        console.log(`Skipped tweet: too old or duplicate`);
      }
    });

    console.log(`Added ${newTweetsFound} new tweets to storage`);
    return newTweetsFound;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return 0;
  }
}

// Update the /api/tweets endpoint to sort by score
app.get('/api/tweets', async (req, res) => {
  try {
    cleanupOldTweets();
    
    if (consecutiveEmptySearches >= searchQueries.length) {
      consecutiveEmptySearches = 0;
      currentQueryIndex = 0;
    }

    let searchCount = 0;
    let totalNewTweets = 0;
    
    while (searchCount < 10) {
      const query = searchQueries[currentQueryIndex];
      const newTweetsFound = await fetchTweetsWithQuery(query);
      
      if (typeof newTweetsFound === 'number') {
        totalNewTweets += newTweetsFound;
      }
      
      currentQueryIndex = (currentQueryIndex + 1) % searchQueries.length;
      
      if (newTweetsFound === 0) {
        consecutiveEmptySearches++;
      } else {
        consecutiveEmptySearches = 0;
      }
      
      searchCount++;
      
      if (newTweetsFound === 0) {
        break;
      }
    }

    // Get all tweets from storage, sorted by score and date
    const allTweets = Array.from(tweetStorage.values())
      .sort((a, b) => {
        // First sort by score
        if (b.tweet.score !== a.tweet.score) {
          return b.tweet.score - a.tweet.score;
        }
        // Then by date if scores are equal
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .map(data => data.tweet);

    res.json({
      tweets: allTweets,
      has_next_page: false,
      next_cursor: '',
      new_tweets_found: totalNewTweets
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error in /api/tweets:', axiosError);
    res.status(500).json({ 
      error: 'Failed to fetch tweets',
      details: axiosError.message
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
}); 