import axios from 'axios';
import { TweetResponse, Tweet } from '../types';

// Store for tracking seen tweet IDs to prevent duplicates
const seenTweetIds = new Set<string>();

// Track the last API call time to prevent too frequent calls
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 30 * 1000; // 30 seconds minimum between API calls

// Clean up old tweets after 30 days
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const API_BASE_URL = 'http://localhost:3002/api';

export const fetchTweets = async (cursor: string = ''): Promise<TweetResponse> => {
  // Implement rate limiting to prevent too many API calls
  const now = Date.now();
  if (now - lastApiCallTime < MIN_API_CALL_INTERVAL) {
    console.log('Rate limiting API calls, waiting...');
    await new Promise(resolve => setTimeout(resolve, MIN_API_CALL_INTERVAL - (now - lastApiCallTime)));
  }
  
  lastApiCallTime = now;
  
  try {
    // Make the API call through our backend proxy
    const response = await axios.get(`${API_BASE_URL}/tweets`, {
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
    
    // Filter out any tweets we've already seen
    const newTweets = response.data.tweets.filter((tweet: Tweet) => !seenTweetIds.has(tweet.id));
    
    // Add new tweet IDs to our seen set
    newTweets.forEach((tweet: Tweet) => {
      seenTweetIds.add(tweet.id);
      // Schedule cleanup after 30 days
      setTimeout(() => {
        seenTweetIds.delete(tweet.id);
      }, THIRTY_DAYS);
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

// Reset the seen tweet IDs (useful for testing or when implementing a "clear all" feature)
export const resetSeenTweets = () => {
  seenTweetIds.clear();
};