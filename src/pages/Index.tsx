import React, { useRef } from 'react';
import { useTweets } from '../hooks/useTweets';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import ParticleBackground from '../components/ParticleBackground';
import TweetsContent from '../components/TweetsContent';

const Index = () => {
  const {
    tweets,
    isLoading,
    isLoadingMore,
    hasMoreTweets,
    loadMoreRef,
    lastFetchTime,
    refreshTweets,
    currentSearchQuery
  } = useTweets();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ParticleBackground />
      
      {isLoading && tweets.length === 0 ? (
        <LoadingScreen />
      ) : (
        <>
          <Header 
            lastUpdated={lastFetchTime} 
            isLoading={isLoading} 
            onRefresh={refreshTweets}
            currentQuery={currentSearchQuery}
          />
          
          <TweetsContent
            tweets={tweets}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMoreTweets={hasMoreTweets}
            loadMoreRef={loadMoreRef}
          />
          
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
