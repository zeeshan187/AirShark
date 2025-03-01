import { Tweet } from "../types";
import { STORAGE_KEY_TWEETS, STORAGE_KEY_QUERY_INDEX, SEARCH_QUERIES } from "./apiConfig";

// Load tweets from local storage
export const loadTweetsFromStorage = (): Tweet[] => {
  try {
    const storedTweets = localStorage.getItem(STORAGE_KEY_TWEETS);
    if (storedTweets) {
      const tweets = JSON.parse(storedTweets);
      
      // Filter out tweets older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return tweets.filter((tweet: Tweet) => {
        const tweetDate = new Date(tweet.timestamp);
        return tweetDate >= thirtyDaysAgo;
      });
    }
  } catch (error) {
    console.error("Error loading tweets from storage:", error);
  }
  return [];
};

// Save tweets to local storage
export const saveTweetsToStorage = (tweets: Tweet[]) => {
  try {
    // Only store up to 100 tweets to prevent localStorage bloat
    const tweetsToStore = [...tweets].slice(0, 100);
    localStorage.setItem(STORAGE_KEY_TWEETS, JSON.stringify(tweetsToStore));
  } catch (error) {
    console.error("Error saving tweets to storage:", error);
  }
};

// Get the next query index and save it to local storage
export const getNextQueryIndex = (): number => {
  try {
    const storedIndex = localStorage.getItem(STORAGE_KEY_QUERY_INDEX);
    let index = storedIndex ? parseInt(storedIndex, 10) : 0;
    
    // Rotate to the next query
    index = (index + 1) % SEARCH_QUERIES.length;
    
    // Save the new index
    localStorage.setItem(STORAGE_KEY_QUERY_INDEX, index.toString());
    
    return index;
  } catch (error) {
    console.error("Error managing query rotation:", error);
    return 0;
  }
};

// Get the current search query being used
export const getCurrentSearchQuery = (): string => {
  try {
    const storedIndex = localStorage.getItem(STORAGE_KEY_QUERY_INDEX);
    const index = storedIndex ? parseInt(storedIndex, 10) : 0;
    return SEARCH_QUERIES[index % SEARCH_QUERIES.length];
  } catch (error) {
    console.error("Error getting current search query:", error);
    return SEARCH_QUERIES[0];
  }
};
