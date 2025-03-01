import { Tweet, FilterOptions } from "../types";

/**
 * Filters tweets based on filter options
 */
export const filterTweets = (tweets: Tweet[], filters: FilterOptions): Tweet[] => {
  // First, create a map to track the best tweet for each token
  const tokenMap = new Map<string, Tweet>();
  
  // Process tweets to find the best one for each token (except null tokens)
  tweets.forEach(tweet => {
    // Skip processing if the tweet would be filtered out anyway
    // Filter by scam status
    if ((filters.showScamTweets && !filters.showNonScamTweets && !tweet.isScam) ||
        (!filters.showScamTweets && filters.showNonScamTweets && tweet.isScam) ||
        (!filters.showScamTweets && !filters.showNonScamTweets)) {
      return;
    }
    
    // Filter by verification status
    if ((filters.showVerified && !filters.showNonVerified && !tweet.author.verified) ||
        (!filters.showVerified && filters.showNonVerified && tweet.author.verified) ||
        (!filters.showVerified && !filters.showNonVerified)) {
      return;
    }
    
    // Filter by unknown tokens
    if (!filters.showUnknownTokens && (tweet.token === null || tweet.token === "")) {
      return;
    }
    
    // Filter by token
    if (filters.tokenFilter && filters.tokenFilter.trim() !== "") {
      const tokenFilter = filters.tokenFilter.trim().toUpperCase();
      if (!tweet.token || !tweet.token.includes(tokenFilter)) {
        return;
      }
    }
    
    // Filter by date
    if (filters.dateFilter && filters.dateFilter.trim() !== "") {
      const dateFilter = new Date(filters.dateFilter);
      const tweetDate = new Date(tweet.timestamp);
      
      // Compare just the dates (ignoring time)
      if (
        dateFilter.getFullYear() !== tweetDate.getFullYear() ||
        dateFilter.getMonth() !== tweetDate.getMonth() ||
        dateFilter.getDate() !== tweetDate.getDate()
      ) {
        return;
      }
    }
    
    // If we get here, the tweet passes all filters
    
    // For null tokens (displayed as "Unknown"), we want to keep all of them
    if (tweet.token === null || tweet.token === "") {
      return; // These will be handled in the final filter
    }
    
    // For non-null tokens, keep the best tweet for each token
    // (best = most recent or with most engagement)
    const existingTweet = tokenMap.get(tweet.token);
    
    if (!existingTweet) {
      // First tweet with this token, add it to the map
      tokenMap.set(tweet.token, tweet);
    } else {
      // Compare with existing tweet based on sort criteria
      let shouldReplace = false;
      
      switch (filters.sortBy) {
        case "mostLikes":
          shouldReplace = tweet.metrics.likes > existingTweet.metrics.likes;
          break;
        case "mostRetweets":
          shouldReplace = tweet.metrics.retweets > existingTweet.metrics.retweets;
          break;
        case "mostViews":
          shouldReplace = tweet.metrics.views > existingTweet.metrics.views;
          break;
        case "mostRecent":
        default:
          shouldReplace = new Date(tweet.timestamp).getTime() > new Date(existingTweet.timestamp).getTime();
          break;
      }
      
      if (shouldReplace) {
        tokenMap.set(tweet.token, tweet);
      }
    }
  });
  
  // Now filter the tweets, keeping all that pass the filters
  // For non-null tokens, only keep the best one for each token
  return tweets.filter(tweet => {
    // Filter by scam status
    if (filters.showScamTweets && !filters.showNonScamTweets) {
      if (!tweet.isScam) return false;
    } else if (!filters.showScamTweets && filters.showNonScamTweets) {
      if (tweet.isScam) return false;
    } else if (!filters.showScamTweets && !filters.showNonScamTweets) {
      return false;
    }
    
    // Filter by verification status
    if (filters.showVerified && !filters.showNonVerified) {
      if (!tweet.author.verified) return false;
    } else if (!filters.showVerified && filters.showNonVerified) {
      if (tweet.author.verified) return false;
    } else if (!filters.showVerified && !filters.showNonVerified) {
      return false;
    }
    
    // Filter by unknown tokens
    if (!filters.showUnknownTokens && (tweet.token === null || tweet.token === "")) {
      return false;
    }
    
    // Filter by token
    if (filters.tokenFilter && filters.tokenFilter.trim() !== "") {
      const tokenFilter = filters.tokenFilter.trim().toUpperCase();
      if (!tweet.token || !tweet.token.includes(tokenFilter)) {
        return false;
      }
    }
    
    // Filter by date
    if (filters.dateFilter && filters.dateFilter.trim() !== "") {
      const dateFilter = new Date(filters.dateFilter);
      const tweetDate = new Date(tweet.timestamp);
      
      // Compare just the dates (ignoring time)
      if (
        dateFilter.getFullYear() !== tweetDate.getFullYear() ||
        dateFilter.getMonth() !== tweetDate.getMonth() ||
        dateFilter.getDate() !== tweetDate.getDate()
      ) {
        return false;
      }
    }
    
    // For null tokens (displayed as "Unknown"), keep all of them
    if (tweet.token === null || tweet.token === "") {
      return true;
    }
    
    // For non-null tokens, only keep the best tweet for each token
    const bestTweetForToken = tokenMap.get(tweet.token);
    return tweet.id === bestTweetForToken?.id;
  });
};

/**
 * Sorts tweets based on sort option
 */
export const sortTweets = (tweets: Tweet[], sortBy: FilterOptions["sortBy"]): Tweet[] => {
  return [...tweets].sort((a, b) => {
    switch (sortBy) {
      case "mostLikes":
        return b.metrics.likes - a.metrics.likes;
      case "mostRetweets":
        return b.metrics.retweets - a.metrics.retweets;
      case "mostViews":
        return b.metrics.views - a.metrics.views;
      case "mostRecent":
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });
};

/**
 * Merge and deduplicate tweets by ID
 */
export const mergeAndDedupeTweets = (tweets: Tweet[]): Tweet[] => {
  const tweetMap = new Map<string, Tweet>();
  
  // Add to map, newer tweets override older ones with the same ID
  tweets.forEach(tweet => {
    tweetMap.set(tweet.id, tweet);
  });
  
  // Convert back to array and sort by timestamp (newest first)
  return Array.from(tweetMap.values()).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};
