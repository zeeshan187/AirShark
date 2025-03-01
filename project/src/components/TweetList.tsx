import React, { useEffect, useState } from 'react';
import { ProcessedTweet } from '../types';
import { fetchTweets } from '../utils/api';
import { processTweets } from '../utils/tweetProcessor';

const TweetList: React.FC = () => {
  const [tweets, setTweets] = useState<ProcessedTweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchNewTweets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTweets(nextCursor || '');
      
      // Process tweets before merging
      const processedNewTweets = processTweets(response.tweets);
      
      // Merge new tweets with existing ones, maintaining the limit of 20
      setTweets(prevTweets => {
        const combinedTweets = [...processedNewTweets, ...prevTweets];
        // Sort by date, newest first
        const sortedTweets = combinedTweets.sort((a, b) => 
          new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
        );
        // Limit to 20 tweets
        return sortedTweets.slice(0, 20);
      });
      
      setNextCursor(response.next_cursor);
    } catch (err) {
      setError('Failed to fetch tweets. Please try again later.');
      console.error('Error fetching tweets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNewTweets();
  }, []);

  // Set up polling every 5 minutes
  useEffect(() => {
    const pollInterval = setInterval(fetchNewTweets, 5 * 60 * 1000);
    return () => clearInterval(pollInterval);
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="tweet-list">
      {isLoading && tweets.length === 0 && (
        <div className="loading">Loading tweets...</div>
      )}
      
      {tweets.map(tweet => (
        <div key={tweet.id} className="tweet-card">
          <div className="tweet-header">
            <img 
              src={tweet.author.profilePicture} 
              alt={tweet.author.userName} 
              className="profile-image"
            />
            <div className="author-info">
              <span className="author-name">{tweet.author.name}</span>
              <span className="author-username">@{tweet.author.userName}</span>
            </div>
            <span className="tweet-date">
              {tweet.date} {tweet.time}
            </span>
          </div>
          <p className="tweet-text">{tweet.text}</p>
          <div className="tweet-metrics">
            <span>❤️ {tweet.metrics.likes}</span>
            <span>🔁 {tweet.metrics.retweets}</span>
            {tweet.metrics.replies && <span>💬 {tweet.metrics.replies}</span>}
          </div>
        </div>
      ))}
      
      {tweets.length === 0 && !isLoading && (
        <div className="no-tweets">No tweets found</div>
      )}
    </div>
  );
};

export default TweetList; 