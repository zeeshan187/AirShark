import { format, parseISO } from 'date-fns';
import { Tweet, ProcessedTweet } from '../types';

export const processTweets = (tweets: Tweet[]): ProcessedTweet[] => {
  return tweets.map(tweet => {
    try {
      // Handle undefined or invalid dates
      const date = tweet.createdAt ? parseISO(tweet.createdAt) : new Date();
      
      // Extract token from tweet text
      const tokenMatch = tweet.text.match(/\$([A-Za-z0-9]+)/);
      const token = tokenMatch ? tokenMatch[1] : extractTokenFromText(tweet.text);
      
      // Extract potential release date
      const expectedRelease = extractReleaseDate(tweet.text);
      
      // Extract hashtags from entities if available
      const hashtags = tweet.entities?.hashtags?.map(tag => `#${tag.text}`) || [];
      
      // Extract mentions from entities if available
      const mentions = tweet.entities?.user_mentions?.map(mention => `@${mention.screen_name}`) || [];

      // Calculate quality indicators
      const text = tweet.text.toLowerCase();
      const qualityIndicators = {
        hasDate: !!text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/),
        hasTime: !!text.match(/\d{1,2}:\d{2}/),
        hasLink: text.includes('https://'),
        isVerified: tweet.author.isBlueVerified,
        hasToken: !!tokenMatch,
        scamScore: calculateScamScore(text)
      };
      
      return {
        id: tweet.id,
        url: tweet.url,
        text: tweet.text,
        date: format(date, 'MMM dd, yyyy'),
        time: format(date, 'HH:mm'),
        token: token,
        expectedRelease: expectedRelease,
        author: {
          userName: tweet.author.userName,
          name: tweet.author.name,
          profilePicture: tweet.author.profilePicture || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
          isBlueVerified: tweet.author.isBlueVerified,
          followers: tweet.author.followers,
          following: tweet.author.following
        },
        metrics: {
          likes: tweet.metrics?.likes || 0,
          retweets: tweet.metrics?.retweets || 0,
          views: tweet.metrics?.views || 0,
          replies: tweet.metrics?.replies || 0,
          quotes: tweet.metrics?.quotes || 0,
          bookmarks: tweet.metrics?.bookmarks || 0,
        },
        hashtags: hashtags,
        mentions: mentions,
        isReply: tweet.isReply || false,
        isRetweet: !!tweet.retweeted_tweet,
        isQuote: !!tweet.quoted_tweet,
        source: tweet.source,
        searchQuery: tweet.searchQuery || '',
        qualityIndicators
      };
    } catch (error) {
      console.error('Error processing tweet:', error);
      const now = new Date();
      return {
        id: tweet.id || 'unknown',
        url: tweet.url || '#',
        text: tweet.text || 'Error processing tweet',
        date: format(now, 'MMM dd, yyyy'),
        time: format(now, 'HH:mm'),
        token: 'UNKNOWN',
        expectedRelease: 'Not specified',
        author: {
          userName: tweet.author?.userName || 'unknown',
          name: tweet.author?.name || 'Unknown User',
          profilePicture: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
          isBlueVerified: false,
          followers: 0,
          following: 0
        },
        metrics: {
          likes: 0,
          retweets: 0,
          views: 0,
          replies: 0,
          quotes: 0,
          bookmarks: 0,
        },
        hashtags: [],
        mentions: [],
        isReply: false,
        isRetweet: false,
        isQuote: false,
        searchQuery: '',
        qualityIndicators: {
          hasDate: false,
          hasTime: false,
          hasLink: false,
          isVerified: false,
          hasToken: false,
          scamScore: 0
        }
      };
    }
  });
};

const extractTokenFromText = (text: string): string => {
  // Skip if text contains monetary values with k/K, m/M suffixes
  if (text.match(/\$\d+[kmKM]/i)) return '';
  
  // Skip if text contains plain monetary values
  if (text.match(/\$\d+([,\.]\d+)?/)) return '';
  
  // First try to find a token with $ prefix - must start with a letter
  const dollarTokenMatch = text.match(/\$([A-Z][A-Z0-9]{1,9})/i);
  if (dollarTokenMatch) {
    const token = dollarTokenMatch[1].toUpperCase();
    // Skip if token is SOL (case insensitive)
    if (token === 'SOL') return '';
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
      if (token === 'SOL') return '';
      return token;
    }
  }
  
  return '';
};

const extractReleaseDate = (text: string): string => {
  // Look for date patterns in the text
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\w+ \d{1,2},? \d{4})|(\d{1,2} \w+ \d{4})/i;
  const match = text.match(datePattern);
  
  if (match) {
    return match[0];
  }
  
  // Look for "snapshot" mentions which often indicate upcoming events
  if (text.toLowerCase().includes('snapshot')) {
    const words = text.split(/\s+/);
    const snapshotIndex = words.findIndex(word => 
      word.toLowerCase().includes('snapshot')
    );
    
    if (snapshotIndex !== -1 && snapshotIndex < words.length - 3) {
      // Try to extract date-like information after "snapshot"
      const potentialDate = words.slice(snapshotIndex, snapshotIndex + 6).join(' ');
      const dateMatch = potentialDate.match(datePattern);
      if (dateMatch) {
        return dateMatch[0];
      }
    }
  }
  
  // Look for common date-related phrases
  const dateKeywords = ['launching', 'release', 'available', 'claim', 'distribution'];
  for (const keyword of dateKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      const words = text.split(/\s+/);
      const keywordIndex = words.findIndex(word => 
        word.toLowerCase().includes(keyword)
      );
      
      if (keywordIndex !== -1 && keywordIndex < words.length - 3) {
        // Try to extract date-like information after the keyword
        const potentialDate = words.slice(keywordIndex, keywordIndex + 6).join(' ');
        const dateMatch = potentialDate.match(datePattern);
        if (dateMatch) {
          return dateMatch[0];
        }
      }
    }
  }
  
  // If we find a future month name, use that as a hint
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const currentMonth = new Date().getMonth();
  const futureMonths = months.slice(currentMonth).concat(months.slice(0, currentMonth));
  
  for (const month of futureMonths) {
    if (text.toLowerCase().includes(month)) {
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${new Date().getFullYear()}`;
    }
  }
  
  return 'Not specified';
};

// Calculate scam likelihood score (0-100, higher means more likely to be a scam)
function calculateScamScore(text: string): number {
  let score = 0;
  
  // Common scam indicators
  const scamPhrases = [
    'send',
    'dm',
    'wallet',
    'connect',
    'claim now',
    'limited time',
    'hurry',
    'first come',
    'private message',
    'message me',
    'connect wallet',
    'verify wallet'
  ];
  
  // Check for scam phrases
  scamPhrases.forEach(phrase => {
    if (text.includes(phrase)) {
      score += 10;
    }
  });
  
  // Check for urgency indicators
  if (text.includes('!')) score += text.split('!').length * 2;
  if (text.match(/\d+x/i)) score += 10; // Promises of multiplication
  if (text.match(/\d+%/)) score += 5; // Percentage promises
  
  // Check for excessive capitalization
  const words = text.split(' ');
  const capsWords = words.filter(word => word === word.toUpperCase() && word.length > 2);
  if (capsWords.length / words.length > 0.5) score += 15;
  
  return Math.min(100, score);
}