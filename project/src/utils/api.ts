import axios from 'axios';
import { TweetResponse, Tweet } from '../types';

// Store for tracking seen tweet IDs to prevent duplicates
const seenTweetIds = new Set<string>();

// Store for tracking normalized tweet texts to prevent duplicates with different IDs
const seenTweetTexts = new Set<string>();

// Track the last API call time to prevent too frequent calls
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 30 * 1000; // 30 seconds minimum between API calls

// Clean up old tweets after 30 days
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Default port if .port file is not found
const DEFAULT_PORT = 3002;

// Normalize tweet text for duplicate detection
function normalizeTweetText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Function to get the backend port
async function getBackendPort(): Promise<number> {
  try {
    const response = await fetch('/.port');
    if (!response.ok) {
      console.warn('Failed to read port file, using default port:', DEFAULT_PORT);
      return DEFAULT_PORT;
    }
    const port = await response.text();
    return parseInt(port, 10) || DEFAULT_PORT;
  } catch (error) {
    console.warn('Error reading port file, using default port:', error);
    return DEFAULT_PORT;
  }
}

// Get the API base URL
async function getApiBaseUrl(): Promise<string> {
  const port = await getBackendPort();
  return `http://localhost:${port}/api`;
}

export const fetchTweets = async (cursor: string = ''): Promise<TweetResponse> => {
  // Implement rate limiting to prevent too many API calls
  const now = Date.now();
  if (now - lastApiCallTime < MIN_API_CALL_INTERVAL) {
    console.log('Rate limiting API calls, waiting...');
    await new Promise(resolve => setTimeout(resolve, MIN_API_CALL_INTERVAL - (now - lastApiCallTime)));
  }
  
  lastApiCallTime = now;
  
  try {
    const baseUrl = await getApiBaseUrl();
    // Make the API call through our backend proxy
    const response = await axios.get(`${baseUrl}/tweets`, {
      params: { cursor }
    });
    
    // Check if we got a rate limit response
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers['retry-after'] || '300', 10) * 1000;
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return fetchTweets(cursor);
    }
    
    // Check if the response has the expected structure
    if (!response.data || !Array.isArray(response.data.tweets)) {
      throw new Error('Invalid API response structure');
    }
    
    // Filter out any tweets we've already seen (by ID or content)
    const newTweets = response.data.tweets.filter((tweet: Tweet) => {
      if (seenTweetIds.has(tweet.id)) {
        return false;
      }
      
      const normalizedText = normalizeTweetText(tweet.text);
      if (seenTweetTexts.has(normalizedText)) {
        return false;
      }
      
      // Add to both sets if it's a new tweet
      seenTweetIds.add(tweet.id);
      seenTweetTexts.add(normalizedText);
      
      // Schedule cleanup after 30 days
      setTimeout(() => {
        seenTweetIds.delete(tweet.id);
        seenTweetTexts.delete(normalizedText);
      }, THIRTY_DAYS);
      
      return true;
    });
    
    return {
      tweets: newTweets,
      has_next_page: response.data.has_next_page,
      next_cursor: response.data.next_cursor,
      new_tweets_found: response.data.new_tweets_found || 0
    };
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
};

// Reset the seen tweet IDs and texts (useful for testing or when implementing a "clear all" feature)
export const resetSeenTweets = () => {
  seenTweetIds.clear();
  seenTweetTexts.clear();
};