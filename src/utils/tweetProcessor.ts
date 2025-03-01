import { Tweet, TwitterTweet } from "../types";
import { format, parseISO } from 'date-fns';
import { SEARCH_QUERIES } from "./apiConfig";

/**
 * Extract token name from tweet text
 */
export const extractTokenFromText = (text: string): string | null => {
  // Look for token symbols like $SOL, $BONK, etc.
  const tokenRegex = /\$([A-Z0-9]{2,10})/g;
  const matches = [...text.matchAll(tokenRegex)];
  
  if (matches.length > 0) {
    // Filter out common non-token symbols like $100, $10K, etc.
    const filteredMatches = matches.filter(match => {
      const token = match[1];
      return !/^\d+K?$/.test(token); // Filter out numbers like 10K
    });
    
    if (filteredMatches.length > 0) {
      return filteredMatches[0][1]; // Return the first token found
    }
  }
  
  return null;
};

/**
 * Extracts hashtags from tweet text
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#([A-Za-z0-9_]+)/g;
  const matches = text.matchAll(hashtagRegex);
  const hashtags: string[] = [];
  for (const match of matches) {
    if (match[1]) {
      hashtags.push(match[1]);
    }
  }
  return hashtags;
};

/**
 * Detect if a tweet is likely a scam
 */
export const detectScam = (text: string): boolean => {
  // Common scam indicators in airdrop tweets
  const scamIndicators = [
    /send.*receive/i,
    /send.*get/i,
    /deposit.*withdraw/i,
    /connect.*wallet.*claim/i,
    /connect.*wallet.*receive/i,
    /validate.*wallet/i,
    /urgent/i,
    /last chance/i,
    /only \d+ spots left/i,
    /limited time/i,
    /giveaway.*first \d+/i,
    /dm to claim/i,
    /dm me to/i,
    /message me/i,
    /click my bio/i,
    /click the link/i,
    /hurry up/i,
    /don't miss out/i
  ];
  
  // Check for presence of scam indicators
  for (const indicator of scamIndicators) {
    if (indicator.test(text)) {
      return true;
    }
  }
  
  // Check for too many emojis (often a sign of scam)
  const emojiCount = (text.match(/[\u{1F300}-\u{1F6FF}]/gu) || []).length;
  if (emojiCount > 10) {
    return true;
  }
  
  return false;
};

/**
 * Attempts to extract a potential release date from text
 */
export const extractReleaseDate = (text: string): string | undefined => {
  // Look for patterns like "TGE in Q2, 2025" or "Launching Q3 2024"
  const quarterPattern = /(TGE|launch|releasing|airdrop|token).*(Q[1-4]).*?(20\d{2})/i;
  const datePattern = /(TGE|launch|releasing|airdrop|token).*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).*?(20\d{2})/i;
  
  let match = text.match(quarterPattern);
  if (match && match[2] && match[3]) {
    return `${match[2]} ${match[3]}`;
  }
  
  match = text.match(datePattern);
  if (match && match[2] && match[3]) {
    return `${match[2]} ${match[3]}`;
  }
  
  return undefined;
};

/**
 * Verify that a tweet contains the required search terms
 * This ensures tweets match our specific search criteria
 */
export const containsSearchTerms = (text: string): boolean => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check if the tweet contains at least one of our search queries
  for (const query of SEARCH_QUERIES) {
    // Extract the terms from the query format "(term1 term2)"
    const match = query.match(/\(([^)]+)\)/);
    if (!match || !match[1]) continue;
    
    // Split the terms and check if ALL terms are present in the tweet
    const terms = match[1].toLowerCase().split(' ');
    const allTermsPresent = terms.every(term => lowerText.includes(term));
    
    if (allTermsPresent) {
      return true;
    }
  }
  
  return false;
};

/**
 * Process raw tweets into our standardized format
 */
export const processTweets = (rawTweets: any[]): Tweet[] => {
  return rawTweets.map(tweet => {
    // Extract token from text if not provided
    let token = tweet.token || extractTokenFromText(tweet.text);
    
    // Standardize null/empty tokens to null (will be displayed as "Unknown")
    if (!token || token.trim() === '') {
      token = null;
    }
    
    // Extract hashtags if not provided
    const hashtags = tweet.hashtags || extractHashtags(tweet.text);
    
    // Detect if tweet is a scam if not already classified
    const isScam = tweet.isScam !== undefined 
      ? tweet.isScam 
      : detectScam(tweet.text);
      
    // Ensure HTTPS for profile pictures
    let profilePicture = tweet.author.profilePicture || "https://secure.gravatar.com/avatar/00000000000000000000000000000000";
    if (profilePicture.startsWith('http:')) {
      profilePicture = profilePicture.replace('http:', 'https:');
    }
    
    return {
      id: tweet.id,
      url: tweet.url,
      text: tweet.text,
      date: tweet.date,
      time: tweet.time,
      timestamp: tweet.timestamp,
      author: {
        username: tweet.author.username,
        name: tweet.author.name || tweet.author.username,
        profilePicture,
        verified: !!tweet.author.verified,
        followers: tweet.author.followers || 0,
        following: tweet.author.following || 0
      },
      metrics: {
        likes: tweet.metrics.likes || 0,
        retweets: tweet.metrics.retweets || 0,
        views: tweet.metrics.views || 0,
        replies: tweet.metrics.replies || 0,
        quotes: tweet.metrics.quotes || 0,
        bookmarks: tweet.metrics.bookmarks || 0
      },
      token,
      isScam,
      hashtags,
      expectedReleaseDate: tweet.expectedReleaseDate
    };
  });
};

/**
 * Process tweets from Twitter API
 */
export const processTwitterTweets = (twitterTweets: TwitterTweet[]): Tweet[] => {
  // Filter out tweets older than one week for new discoveries
  // This only applies to newly fetched tweets, not ones already in storage
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return twitterTweets
    .filter(tweet => {
      // Parse the Twitter date format
      const tweetDate = new Date(tweet.createdAt);
      
      // First, check if the tweet contains our required search terms
      if (!containsSearchTerms(tweet.text)) {
        return false;
      }
      
      // Then, keep tweets newer than one week
      return tweetDate >= oneWeekAgo;
    })
    .map(tweet => {
      // Parse the Twitter date format (Sat Mar 01 15:28:21 +0000 2025)
      const dateObj = new Date(tweet.createdAt);
      const date = format(dateObj, 'MMM d, yyyy');
      const time = format(dateObj, 'h:mm a');
      
      // Extract token from text if not provided
      let token = extractTokenFromText(tweet.text);
      
      // Standardize null/empty tokens to null (will be displayed as "Unknown")
      if (!token || token.trim() === '') {
        token = null;
      }
      
      // Extract hashtags
      let hashtags: string[] = extractHashtags(tweet.text);
      
      // If we have entities with hashtags, use those instead
      if (tweet.entities && tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {
        hashtags = tweet.entities.hashtags.map((tag: any) => tag.text);
      }
      
      // Detect if tweet is a scam
      const isScam = detectScam(tweet.text);
      
      // Extract potential release date
      const expectedReleaseDate = extractReleaseDate(tweet.text);
      
      // Ensure HTTPS for profile pictures
      let profilePicture = tweet.author.profilePicture || "https://secure.gravatar.com/avatar/00000000000000000000000000000000";
      if (profilePicture.startsWith('http:')) {
        profilePicture = profilePicture.replace('http:', 'https:');
      }
      
      return {
        id: tweet.id,
        url: tweet.url,
        text: tweet.text,
        date,
        time,
        timestamp: dateObj.toISOString(),
        author: {
          username: tweet.author.userName,
          name: tweet.author.name || tweet.author.userName,
          profilePicture,
          verified: tweet.author.isVerified || tweet.author.isBlueVerified || false,
          followers: tweet.author.followers || 0,
          following: tweet.author.following || 0
        },
        metrics: {
          likes: tweet.likeCount || 0,
          retweets: tweet.retweetCount || 0,
          views: tweet.viewCount || 0,
          replies: tweet.replyCount || 0,
          quotes: tweet.quoteCount || 0,
          bookmarks: tweet.bookmarkCount || 0
        },
        token,
        isScam,
        hashtags,
        expectedReleaseDate
      };
    });
};
