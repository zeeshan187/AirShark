
import React from 'react';

interface TweetLoadingIndicatorProps {
  loadMoreRef: React.RefObject<HTMLDivElement>;
  isLoadingMore: boolean;
  hasMoreTweets: boolean;
}

const TweetLoadingIndicator: React.FC<TweetLoadingIndicatorProps> = ({ 
  loadMoreRef, 
  isLoadingMore, 
  hasMoreTweets 
}) => {
  return (
    <>
      {isLoadingMore && (
        <div className="flex justify-center mt-6 mb-4">
          <div className="animate-spin w-6 h-6 border-2 border-solana-purple border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Invisible loader element for intersection observer */}
      {hasMoreTweets && (
        <div 
          ref={loadMoreRef} 
          className="h-10 w-full opacity-0"
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default TweetLoadingIndicator;
