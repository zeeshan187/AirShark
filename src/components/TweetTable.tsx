import React, { useState } from 'react';
import { Tweet } from '../types';
import TweetRow from './TweetRow';
import TweetDetail from './TweetDetail';

interface TweetTableProps {
  tweets: Tweet[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreTweets: boolean;
}

const TweetTable: React.FC<TweetTableProps> = ({
  tweets,
  isLoading,
  isLoadingMore,
  hasMoreTweets,
}) => {
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);
  const [highlightedTweetId, setHighlightedTweetId] = useState<string | null>(null);
  
  const handleTweetClick = (tweetId: string) => {
    setExpandedTweetId(prevId => prevId === tweetId ? null : tweetId);
    setHighlightedTweetId(tweetId);
    
    // Remove highlight after a delay
    setTimeout(() => {
      setHighlightedTweetId(null);
    }, 3000);
  };
  
  // Format current time for last updated display
  const lastUpdated = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  return (
    <div className="w-full rounded-lg overflow-hidden glass-panel animate-fade-in">
      <div className="px-3 py-3 sm:px-4 sm:py-4 bg-solana-purple/20 border-b border-solana-purple/10">
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold">Latest Solana Airdrops</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-solana-purple text-white text-xs font-medium rounded-full">LIVE</span>
            <p className="text-xs sm:text-sm text-muted-foreground">Tracking the most recent airdrop announcements in the Solana ecosystem</p>
          </div>
        </div>
      </div>
      
      <div className="p-1 sm:p-2">
        {isLoading && tweets.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-solana-purple border-t-transparent rounded-full"></div>
          </div>
        ) : tweets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>No tweets match your current filters</p>
            <button 
              className="mt-4 px-4 py-2 bg-solana-purple text-white rounded-md text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {/* Table Headers - Responsive grid with hidden columns on mobile */}
            <div className="grid grid-cols-[auto,1fr,auto] sm:grid-cols-[auto,auto,1fr,auto,auto] md:grid-cols-[auto,auto,1fr,auto,auto,auto] gap-2 sm:gap-4 px-2 sm:px-4 py-2 bg-muted/40 text-xs font-medium sticky top-0 z-10">
              <div className="flex items-center justify-center w-14 sm:w-12">
                <span>Profile</span>
              </div>
              <div className="hidden sm:flex items-center justify-center w-16">
                <span>Token</span>
              </div>
              <div>Tweet</div>
              <div className="text-center sm:text-right mr-0 sm:mr-2 hidden sm:block">Date</div>
              <div className="text-center hidden md:block">Metrics</div>
              <div className="text-center">Actions</div>
            </div>
            
            {/* Tweets - Now in a scrollable container with fixed height and mobile optimizations */}
            <div className="divide-y divide-border/20 max-h-[600px] sm:max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-solana-purple/40 scrollbar-track-transparent">
              {tweets.map(tweet => (
                <React.Fragment key={tweet.id}>
                  <TweetRow 
                    tweet={tweet} 
                    onClick={() => handleTweetClick(tweet.id)}
                    isExpanded={expandedTweetId === tweet.id}
                    isHighlighted={highlightedTweetId === tweet.id}
                  />
                  <TweetDetail
                    tweet={tweet}
                    isVisible={expandedTweetId === tweet.id}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center mt-2 sm:mt-4 mb-1 sm:mb-2">
            <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-solana-purple border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Last updated */}
        <div className="text-center text-xs text-muted-foreground mt-1 sm:mt-2">
          Data automatically updates in background
        </div>
      </div>
    </div>
  );
};

export default TweetTable;
