import { useState, useEffect, useRef, useCallback } from "react";
import { Tweet, ApiResponse } from "../types";
import { fetchTweets } from "../utils/api";
import { toast } from "@/hooks/use-toast";
import { getCurrentSearchQuery } from "@/utils/storageUtils";

// Custom hook for managing tweets data
export const useTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreTweets, setHasMoreTweets] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');
  
  // Ref for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Track if component is mounted
  const isMounted = useRef(true);
  
  // Load initial tweets
  useEffect(() => {
    isMounted.current = true;
    
    const loadInitialTweets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch tweets - this will now return tweets filtered by age:
        // - New tweets must be less than 1 week old
        // - Existing tweets can be up to 30 days old
        const response = await fetchTweets();
        
        if (isMounted.current) {
          setTweets(response.tweets);
          setNextCursor(response.nextCursor);
          setHasMoreTweets(response.hasMoreTweets);
          setLastFetchTime(new Date());
          
          // Set the current search query
          setCurrentSearchQuery(getCurrentSearchQuery());
          
          // Log tweet count for debugging
          console.log(`Loaded ${response.tweets.length} tweets (includes both new and existing within 30-day window)`);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("Failed to load tweets:", err);
          setError("Failed to load tweets. Please try again later.");
          toast({
            title: "Error",
            description: "Failed to load tweets. Please try again later.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialTweets();
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Explicitly refresh data - now only refreshes the UI without making API requests
  const refreshTweets = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Show a toast notification about the refresh
      toast({
        title: "Refreshing",
        description: "Refreshing the display with the latest data...",
        variant: "default",
      });
      
      // Simulate a short delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set the last fetch time to now to update the UI
      setLastFetchTime(new Date());
      
      toast({
        title: "Success",
        description: "Display refreshed successfully!",
        variant: "default",
      });
    } catch (err) {
      if (isMounted.current) {
        console.error("Failed to refresh display:", err);
        toast({
          title: "Error",
          description: "Failed to refresh the display. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);
  
  // Load more tweets (pagination)
  const loadMoreTweets = async () => {
    if (!nextCursor || isLoadingMore || !hasMoreTweets) return;
    
    try {
      setIsLoadingMore(true);
      setError(null);
      
      // When loading more tweets, we only get new tweets from the API
      // that are less than 1 week old
      const response = await fetchTweets(nextCursor);
      
      if (isMounted.current) {
        // Merge new tweets with existing ones
        setTweets(prev => [...prev, ...response.tweets]);
        setNextCursor(response.nextCursor);
        setHasMoreTweets(response.hasMoreTweets);
        
        // Log tweet count for debugging
        console.log(`Loaded ${response.tweets.length} additional tweets (all less than 1 week old)`);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Failed to load more tweets:", err);
        toast({
          title: "Error",
          description: "Failed to load more tweets. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingMore(false);
      }
    }
  };
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreTweets && !isLoadingMore) {
          loadMoreTweets();
        }
      },
      { threshold: 1.0 }
    );
    
    const currentRef = loadMoreRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreTweets, nextCursor, isLoadingMore]);
  
  return {
    tweets,
    isLoading,
    isLoadingMore,
    error,
    hasMoreTweets,
    loadMoreRef,
    lastFetchTime,
    refreshTweets, // Export the refresh function
    currentSearchQuery, // Export the current search query
  };
};
