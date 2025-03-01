import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header';
import TweetTable from './components/TweetTable';
import Footer from './components/Footer';
import { fetchTweets, resetSeenTweets } from './utils/api';
import { processTweets } from './utils/tweetProcessor';
import { ProcessedTweet } from './types';

const App: React.FC = () => {
  const [tweets, setTweets] = useState<ProcessedTweet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string>('');
  const [hasMoreTweets, setHasMoreTweets] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [corsError, setCorsError] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [appReady, setAppReady] = useState<boolean>(false);

  // Function to load initial tweets (replaces existing tweets)
  const loadTweets = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isLoading && !isInitialLoad) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Reset seen tweets when doing a full refresh
      resetSeenTweets();
      
      // Increment refresh count to help with key generation
      setRefreshCount(prev => prev + 1);
      
      const response = await fetchTweets();
      
      if (!response || !Array.isArray(response.tweets)) {
        console.warn('Invalid API response structure. Using fallback data.');
        setError('Failed to load data. Using fallback data instead.');
        toast.error('Failed to load data. Using fallback data instead.');
      } else {
        const processedTweets = processTweets(response.tweets);
        setTweets(processedTweets);
        setNextCursor(response.next_cursor);
        setHasMoreTweets(response.has_next_page);
        setLastUpdated(new Date());
        
        // Check if we're using mock data
        if (response.tweets.length > 0 && response.tweets[0].id.includes('-')) {
          setCorsError(true);
          toast.success('Using high-quality simulated data due to API limitations');
        } else {
          setCorsError(false);
          toast.success('Airdrop data updated!');
        }
      }
    } catch (error) {
      console.error('Error in App component while loading tweets:', error);
      setError('Failed to load data. Using fallback data instead.');
      toast.error('Failed to load data. Using fallback data instead.');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
      setAppReady(true);
    }
  }, [isLoading, isInitialLoad]);

  // Function to load more tweets (appends to existing tweets)
  const loadMoreTweets = useCallback(async () => {
    if (!hasMoreTweets || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const response = await fetchTweets(nextCursor);
      
      if (!response || !Array.isArray(response.tweets)) {
        console.warn('Invalid API response structure when loading more tweets.');
        setHasMoreTweets(false);
      } else {
        const processedTweets = processTweets(response.tweets);
        
        // Deduplicate tweets by ID
        const existingIds = new Set(tweets.map(tweet => tweet.id));
        const newTweets = processedTweets.filter(tweet => !existingIds.has(tweet.id));
        
        if (newTweets.length > 0) {
          setTweets(prevTweets => [...prevTweets, ...newTweets]);
          toast.success(`Loaded ${newTweets.length} more tweets`);
        } else if (response.has_next_page) {
          // If we got no new tweets but there are more pages, try the next page
          setNextCursor(response.next_cursor);
          // Don't show a message here, just silently try the next page
        } else {
          toast('No more new tweets available', {
            icon: 'ℹ️',
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid #374151',
            },
          });
          setHasMoreTweets(false);
        }
        
        setNextCursor(response.next_cursor);
        setHasMoreTweets(response.has_next_page);
      }
    } catch (error) {
      console.error('Error loading more tweets:', error);
      toast.error('Failed to load more tweets');
      setHasMoreTweets(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, hasMoreTweets, isLoadingMore, tweets]);

  // Function to check for new tweets (prepends to existing tweets)
  const checkForNewTweets = useCallback(async () => {
    // Prevent checking for new tweets if we're already loading
    if (isLoading || isLoadingMore) return;
    
    try {
      const response = await fetchTweets();
      
      if (!response || !Array.isArray(response.tweets)) {
        console.warn('Invalid API response structure when checking for new tweets.');
        return;
      }
      
      const processedTweets = processTweets(response.tweets);
      
      // Deduplicate tweets by ID
      const existingIds = new Set(tweets.map(tweet => tweet.id));
      const newTweets = processedTweets.filter(tweet => !existingIds.has(tweet.id));
      
      if (newTweets.length > 0) {
        // Add new tweets to the beginning of the list
        setTweets(prevTweets => [...newTweets, ...prevTweets]);
        setLastUpdated(new Date());
        toast.success(`Found ${newTweets.length} new airdrop announcements!`);
      }
    } catch (error) {
      console.error('Error checking for new tweets:', error);
      // Don't show an error toast here to avoid annoying the user during auto-refresh
    }
  }, [tweets, isLoading, isLoadingMore]);

  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      loadTweets();
    }
  }, [loadTweets, isLoading]);

  useEffect(() => {
    // Only load tweets once on initial mount
    if (isInitialLoad) {
      loadTweets();
    }
    
    // Set up auto-refresh every 10 minutes (600000 ms)
    const interval = window.setInterval(() => {
      checkForNewTweets();
    }, 600000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [loadTweets, checkForNewTweets, isInitialLoad]);

  // If the app is not ready yet, show a loading state
  if (!appReady && isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 p-8 text-center">
            <div className="animate-spin mb-4 mx-auto">
              <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Airdrop Data</h2>
            <p className="text-blue-200">
              Fetching the latest Solana airdrop announcements...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F9FAFB',
            },
          },
        }}
      />
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900">
            <h2 className="text-2xl font-bold text-white mb-2">Latest Solana Airdrops</h2>
            <p className="text-blue-200">
              Tracking the most recent airdrop announcements in the Solana ecosystem
            </p>
          </div>
          
          {corsError && (
            <div className="bg-blue-900 bg-opacity-20 border-l-4 border-blue-500 p-4 mb-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-200">
                    Using high-quality simulated data due to browser CORS restrictions. In a production environment, 
                    this application would use a backend proxy to access the Twitter API directly.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-4 mb-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <TweetTable 
              tweets={tweets} 
              isLoading={isLoading} 
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
              hasMoreTweets={hasMoreTweets}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMoreTweets}
              refreshCount={refreshCount}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;