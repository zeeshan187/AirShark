import { Tweet, ApiResponse, FilterOptions, TwitterApiResponse, TwitterTweet } from "../types";
import { processTweets, processTwitterTweets } from "./tweetProcessor";
import { TWITTER_API_KEY, SEARCH_QUERIES, STORAGE_KEY_LAST_FETCH, STORAGE_KEY_TWEETS } from "./apiConfig";
import { loadTweetsFromStorage, saveTweetsToStorage, getNextQueryIndex } from "./storageUtils";
import { canMakeApiCall, recordApiCall } from "./rateLimitUtils";
import { filterTweets, sortTweets, mergeAndDedupeTweets } from "./tweetFilterUtils";
import { mockTweets, generateMoreMockTweets } from "./mockData"; // Import mock data

// Cache for Twitter API responses to prevent excessive requests
let twitterCache: {
  tweets: TwitterTweet[];
  nextCursor: string | null;
  timestamp: number;
} | null = null;

// Define API URLs - Use our proxy instead of direct Twitter API
const TWITTER_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? import.meta.env.VITE_PROXY_URL || "https://your-railway-app.up.railway.app/api/twitter/tweet/advanced_search"
  : "http://localhost:3002/api/twitter/tweet/advanced_search";

// For mock pagination purposes
let mockCursorIndex = 0;
const MOCK_TWEETS_PER_PAGE = 10;
const MOCK_MAX_PAGES = 5;
const mockAllTweets = [...mockTweets, ...generateMoreMockTweets(40)]; // Generate 50 total mock tweets

/**
 * Simulates fetching tweets from Twitter API using mock data
 * This is a temporary solution until the real API is available
 */
const fetchMockTweets = async (cursor?: string): Promise<ApiResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('Using mock data instead of real API');
  
  if (cursor) {
    // Parse the cursor to get the page index
    mockCursorIndex = parseInt(cursor, 10);
  } else {
    // Reset to first page for new requests
    mockCursorIndex = 0;
  }
  
  // Calculate the slice of tweets to return
  const startIndex = mockCursorIndex * MOCK_TWEETS_PER_PAGE;
  const endIndex = startIndex + MOCK_TWEETS_PER_PAGE;
  const tweets = mockAllTweets.slice(startIndex, endIndex);
  
  // Determine if there are more pages
  const hasNextPage = mockCursorIndex < MOCK_MAX_PAGES - 1 && endIndex < mockAllTweets.length;
  const nextCursor = hasNextPage ? String(mockCursorIndex + 1) : null;
  
  console.log(`Mock data: Showing tweets ${startIndex}-${endIndex}, has next page: ${hasNextPage}`);
  
  return {
    tweets,
    nextCursor,
    hasMoreTweets: hasNextPage
  };
};

/**
 * Fetches tweets from Twitter API with query rotation
 * Now using our proxy server to avoid CORS issues
 */
export const fetchRealTweets = async (cursor?: string): Promise<ApiResponse> => {
  try {
    // Only clear stored tweets on initial load if we're not using a cursor
    // This ensures we keep tweets within the 30-day retention window
    if (!cursor) {
      console.log('Initial load - getting fresh data while preserving existing tweets');
      // We don't remove stored tweets here anymore
      // Instead, we'll merge new tweets with existing ones that are still within the retention window
      localStorage.removeItem(STORAGE_KEY_LAST_FETCH);
      twitterCache = null;
    }
    
    // Load stored tweets (will be filtered for 30-day retention in loadTweetsFromStorage)
    const storedTweets = loadTweetsFromStorage();
    
    // Get the next search query to use
    const queryIndex = cursor ? 0 : getNextQueryIndex(); // Only rotate on initial load
    const searchQuery = SEARCH_QUERIES[queryIndex];
    
    // Construct the URL for the Twitter API via our proxy
    // Twitter advanced search syntax:
    // - Using exact format: (airdrop solana) - parentheses ensure AND operation
    // - This format matches exactly what works directly with the Twitter API
    // - Both terms must be present in the tweet in this exact format
    let apiUrl = `${TWITTER_API_BASE_URL}?query=${encodeURIComponent(searchQuery)}&queryType=Latest`;
    
    // Add cursor parameter if provided
    if (cursor) {
      apiUrl += `&cursor=${cursor}`;
    }
    
    console.log(`Fetching from Twitter API via proxy with query: "${searchQuery}" (encoded: ${encodeURIComponent(searchQuery)})`);
    recordApiCall(); // Record this API call for rate limiting
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 
        'X-API-Key': TWITTER_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Add longer timeout
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!response.ok) {
      const status = response.status;
      if (status === 401) {
        throw new Error("Authentication failed: Invalid API key");
      } else if (status === 403) {
        throw new Error("Access denied: Insufficient permissions");
      } else if (status === 429) {
        throw new Error("Rate limit exceeded");
      } else if (status >= 500) {
        throw new Error(`Server error: ${status}`);
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('Twitter API response:', data);
    
    // Check if we have tweets array in the response
    if (!data.tweets || !Array.isArray(data.tweets)) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid API response format');
    }
    
    // Process the tweets - this will filter out tweets older than 1 week
    const processedTweets = processTwitterTweets(data.tweets);
    
    // Merge with existing tweets, avoiding duplicates
    const existingIds = new Set(storedTweets.map(t => t.id));
    const uniqueNewTweets = processedTweets.filter(t => !existingIds.has(t.id));
    const mergedTweets = [...storedTweets, ...uniqueNewTweets];
    
    // Save the merged tweets to local storage
    saveTweetsToStorage(mergedTweets);
    
    // Update last fetch time
    localStorage.setItem(STORAGE_KEY_LAST_FETCH, Date.now().toString());
    
    // For the API response, we return only the new tweets if using a cursor
    // Otherwise, we return all merged tweets
    return {
      tweets: cursor ? processedTweets : mergedTweets,
      nextCursor: data.has_next_page ? data.next_cursor : null,
      hasMoreTweets: !!data.has_next_page
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Return empty result instead of using mock data
    return {
      tweets: [],
      nextCursor: null,
      hasMoreTweets: false
    };
  }
};

/**
 * Main fetchTweets function 
 * Always uses the Twitter API via our proxy
 */
export const fetchTweets = async (
  cursor?: string,
  limit: number = 20
): Promise<ApiResponse> => {
  return await fetchRealTweets(cursor);
};

// Re-export the filter and sort functions for convenience
export { filterTweets, sortTweets };
