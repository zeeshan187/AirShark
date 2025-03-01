import React from 'react';
import { Tweet } from '../types';
import TweetTable from './TweetTable';
import TweetLoadingIndicator from './TweetLoadingIndicator';
import TweetFilters from './TweetFilters';
import Roadmap from './Roadmap';

interface TweetsContentProps {
  tweets: Tweet[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreTweets: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

const TweetsContent: React.FC<TweetsContentProps> = ({
  tweets,
  isLoading,
  isLoadingMore,
  hasMoreTweets,
  loadMoreRef
}) => {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      {tweets.length > 0 ? (
        <>
          <TweetFilters tweets={tweets}>
            {(filteredTweets) => (
              <TweetTable
                tweets={filteredTweets}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMoreTweets={hasMoreTweets}
              />
            )}
          </TweetFilters>
          
          {/* Roadmap section */}
          <Roadmap />
        </>
      ) : (
        <div className="w-full rounded-lg overflow-hidden glass-panel animate-fade-in p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Airdrops Found</h2>
          <p className="text-muted-foreground">
            We couldn't find any airdrop data right now. Please check back later.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="px-4 py-2 bg-solana-purple/10 rounded-full border border-solana-purple/20 text-sm text-solana-purple">
              Data refreshes automatically every 10 minutes
            </div>
          </div>
        </div>
      )}
      
      <TweetLoadingIndicator 
        loadMoreRef={loadMoreRef}
        isLoadingMore={isLoadingMore}
        hasMoreTweets={hasMoreTweets}
      />
    </main>
  );
};

export default TweetsContent;
