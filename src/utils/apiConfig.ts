// Twitter API key - Obfuscated to reduce script kiddie copying from dev tools
export const TWITTER_API_KEY = (() => {
  // This is a placeholder API key - you need to replace it with a valid one
  // Get your API key from https://twitterapi.io/
  const segments = ["e80b3", "fe69a", "dc422", "fad7d", "c3671", "47b3f97"];
  return segments.join('');
})();

// Rate limiting
export const MAX_CALLS_PER_HOUR = 6; // Maximum 6 calls per hour (one every 10 minutes)

// Query rotation - different search queries to get a variety of airdrop tweets
// Using the exact format provided to ensure proper AND filtering with parentheses
export const SEARCH_QUERIES = [
  "(airdrop solana)",  // Main query - finds tweets with BOTH terms
  "(airdrop sol)",     // Alternative using SOL abbreviation
  "(token solana airdrop)",  // More specific for token airdrops
  "(giveaway solana)",  // Alternative term for airdrops
  "(drop solana)"      // Another variation
];

// Local storage keys
export const STORAGE_KEY_TWEETS = "airshark_tweets";
export const STORAGE_KEY_LAST_FETCH = "airshark_last_fetch";
export const STORAGE_KEY_QUERY_INDEX = "airshark_query_index";

// Cache expiration time (30 days in milliseconds)
export const CACHE_EXPIRATION = 30 * 24 * 60 * 60 * 1000;
