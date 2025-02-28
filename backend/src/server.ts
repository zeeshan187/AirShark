import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AxiosError } from 'axios';
import type { AddressInfo } from 'net';

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

dotenv.config();

const app = express();
const startPort = Number(process.env.PORT) || 3002;

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

// Store for tracking the best tweet per token
const tokenTweets = new Map<string, {
  tweet: any,
  timestamp: Date,
  score: number
}>();

// Store normalized tweet text to prevent duplicates with different IDs
const normalizedTweetTexts = new Set<string>();

// Normalize tweet text for duplicate detection
function normalizeTweetText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Check if tweet is a duplicate
function isDuplicateTweet(tweet: any): boolean {
  const normalizedText = normalizeTweetText(tweet.text);
  if (normalizedTweetTexts.has(normalizedText)) {
    console.log('Duplicate tweet detected:', tweet.text.substring(0, 50));
    return true;
  }
  return false;
}

// Track last search time and whether initial search is done
let lastSearchTime = 0;
let hasCompletedInitialSearch = false;
let currentQueryIndex = 0;

// Clean up old tweets (older than 30 days)
const cleanupOldTweets = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  for (const [token, data] of tokenTweets.entries()) {
    if (data.timestamp < thirtyDaysAgo) {
      tokenTweets.delete(token);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldTweets, 60 * 60 * 1000);

// Enable CORS for the frontend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is a localhost URL with any port
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
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
  
  // First try to find a token with $ prefix - must start with a letter
  const dollarTokenMatch = text.match(/\$([A-Z][A-Z0-9]{1,9})/i);
  if (dollarTokenMatch) {
    const token = dollarTokenMatch[1].toUpperCase();
    // Skip if token is SOL (case insensitive)
    if (token.toUpperCase() === 'SOL') return null;
    return token;
  }
  
  // Look for common Solana token patterns
  const tokenKeywords = ['TOKEN', 'AIRDROP', 'PRESALE'];
  for (const keyword of tokenKeywords) {
    const regex = new RegExp(`\\b([A-Z][A-Z0-9]{1,9})\\s+${keyword}\\b`, 'i');
    const match = text.match(regex);
    if (match) {
      const token = match[1].toUpperCase();
      // Skip if token is SOL (case insensitive)
      if (token === 'SOL') return null;
      return token;
    }
  }
  
  return null;
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

    // Ensure profile picture URL is properly formatted
    let profilePicture = tweet.author.profilePicture || tweet.author.profile_image_url;
    if (profilePicture) {
        // Replace 'normal' size with 'bigger' for better quality
        profilePicture = profilePicture.replace('_normal.', '_bigger.');
    } else {
        profilePicture = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
    }
    
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

    console.log(`Found ${response.data.tweets.length} tweets from API`);
    let newTweetsFound = 0;
    
    for (const tweet of response.data.tweets) {
      if (isTweetTooOld(tweet.created_at)) {
        console.log('Skipped tweet: too old');
        continue;
      }

      const token = extractToken(tweet.text);
      if (!token) {
        console.log('Skipped tweet: no token found');
        continue;
      }

      const transformedTweet = transformTweet(tweet, query);

      // Check if we already have a tweet for this token
      const existingTweet = tokenTweets.get(token);
      if (existingTweet) {
        // Only replace if the new tweet has a higher score
        console.log(`Replacing tweet for token ${token} with higher score`);
        tokenTweets.set(token, {
          tweet: transformedTweet,
          timestamp: new Date(),
          score: 0
        });
        newTweetsFound++;
      } else {
        // First tweet we've seen for this token
        console.log(`Added first tweet for token ${token}`);
        tokenTweets.set(token, {
          tweet: transformedTweet,
          timestamp: new Date(),
          score: 0
        });
        newTweetsFound++;
      }
    }

    console.log(`Added/Updated ${newTweetsFound} tweets`);
    return newTweetsFound;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return 0;
  }
}

// Update the /api/tweets endpoint
app.get('/api/tweets', async (req, res) => {
  try {
    cleanupOldTweets();
    
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;

    // Initial search - do all queries
    if (!hasCompletedInitialSearch) {
      console.log('Performing initial search across all queries...');
      let totalNewTweets = 0;
      
      for (const query of searchQueries) {
        const newTweetsFound = await fetchTweetsWithQuery(query);
        if (typeof newTweetsFound === 'number') {
          totalNewTweets += newTweetsFound;
        }
      }

      hasCompletedInitialSearch = true;
      lastSearchTime = now;
      
      // Get all tweets from storage, sorted by score
      const allTweets = Array.from(tokenTweets.values())
        .sort((a, b) => b.score - a.score)
        .map(data => data.tweet);

      res.json({
        tweets: allTweets,
        has_next_page: false,
        next_cursor: '',
        new_tweets_found: totalNewTweets
      });
      return;
    }

    // For subsequent requests, only search if 10 minutes have passed
    if (now - lastSearchTime >= TEN_MINUTES) {
      console.log(`Performing search with query: ${searchQueries[currentQueryIndex]}`);
      const newTweetsFound = await fetchTweetsWithQuery(searchQueries[currentQueryIndex]);
      
      // Move to next query for next time
      currentQueryIndex = (currentQueryIndex + 1) % searchQueries.length;
      lastSearchTime = now;

      // Get all tweets from storage, sorted by score
      const allTweets = Array.from(tokenTweets.values())
        .sort((a, b) => b.score - a.score)
        .map(data => data.tweet);

      res.json({
        tweets: allTweets,
        has_next_page: false,
        next_cursor: '',
        new_tweets_found: newTweetsFound
      });
      return;
    }

    // If less than 10 minutes have passed, just return current tweets without searching
    console.log('Returning cached tweets (less than 10 minutes since last search)');
    const allTweets = Array.from(tokenTweets.values())
      .sort((a, b) => b.score - a.score)
      .map(data => data.tweet);

    res.json({
      tweets: allTweets,
      has_next_page: false,
      next_cursor: '',
      new_tweets_found: 0
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

// Function to find an available port
async function findAvailablePort(startingPort: number): Promise<number> {
  const { createServer } = await import('net');
  
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startingPort, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      // Port is in use, try the next one
      resolve(findAvailablePort(startingPort + 1));
    });
  });
}

// Start server with automatic port selection
async function startServer() {
  try {
    const port = await findAvailablePort(startPort);
    const { writeFile } = await import('fs/promises');
    const { join } = await import('path');
    
    app.listen(port, async () => {
      console.log(`Backend server running at http://localhost:${port}`);
      // Write the port to a file in the project directory
      const portFilePath = join(__dirname, '../../../.port');
      await writeFile(portFilePath, port.toString());
      console.log(`Port number written to ${portFilePath}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 