
import { MAX_CALLS_PER_HOUR } from "./apiConfig";

// API call history for rate limiting
const API_CALL_HISTORY: number[] = [];

// Check if we can make an API call (rate limiting)
export const canMakeApiCall = (): boolean => {
  const now = Date.now();
  
  // Remove API calls older than 1 hour from history
  const oneHourAgo = now - (60 * 60 * 1000);
  while (API_CALL_HISTORY.length > 0 && API_CALL_HISTORY[0] < oneHourAgo) {
    API_CALL_HISTORY.shift();
  }
  
  // Check if we've made too many calls in the last hour
  return API_CALL_HISTORY.length < MAX_CALLS_PER_HOUR;
};

// Record an API call
export const recordApiCall = () => {
  API_CALL_HISTORY.push(Date.now());
};
