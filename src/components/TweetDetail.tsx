import React from 'react';
import { Tweet } from '../types';
import { ExternalLink, Users, UserPlus, Heart, RefreshCw, Eye } from 'lucide-react';

interface TweetDetailProps {
  tweet: Tweet;
  isVisible: boolean;
}

const TweetDetail: React.FC<TweetDetailProps> = ({ tweet, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="p-2 sm:p-4 bg-muted/40 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in border-t border-border/50">
      {/* Token Information */}
      <div className="space-y-2 sm:space-y-3 glass-panel rounded-lg p-3 sm:p-4 bg-background/80 shadow-md hover:shadow-lg transition-shadow">
        <h3 className="font-medium text-xs sm:text-sm text-solana-teal mb-2 sm:mb-4">Token Information</h3>
        
        <div className="grid grid-cols-[80px,1fr] sm:grid-cols-[100px,1fr] gap-1 sm:gap-2 text-xs sm:text-sm">
          <div className="text-muted-foreground">Token</div>
          <div className="font-medium">{tweet.token || 'Unknown'}</div>
          
          {tweet.expectedReleaseDate && (
            <>
              <div className="text-muted-foreground">Expected Release</div>
              <div>{tweet.expectedReleaseDate}</div>
            </>
          )}
          
          <div className="text-muted-foreground">Source</div>
          <div>Twitter</div>
          
          {tweet.hashtags.length > 0 && (
            <>
              <div className="text-muted-foreground">Hashtags</div>
              <div className="flex flex-wrap gap-1">
                {tweet.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-xs bg-solana-purple/20 text-solana-purple px-1.5 sm:px-2 py-0.5 rounded">
                    #{hashtag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Account Information */}
      <div className="space-y-2 sm:space-y-3 glass-panel rounded-lg p-3 sm:p-4 bg-background/80 shadow-md hover:shadow-lg transition-shadow">
        <h3 className="font-medium text-xs sm:text-sm text-solana-teal mb-2 sm:mb-4">Account Information</h3>
        
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <img 
            src={tweet.author.profilePicture} 
            alt={tweet.author.name} 
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover"
          />
          <div>
            <div className="font-medium flex items-center gap-1 text-sm sm:text-base">
              {tweet.author.name}
              {tweet.author.verified && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-solana-teal" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
              )}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">@{tweet.author.username}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <div className="text-muted-foreground">Followers</div>
            <div className="font-medium">{tweet.author.followers.toLocaleString()}</div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <div className="text-muted-foreground">Following</div>
            <div className="font-medium">{tweet.author.following.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {/* Full Tweet */}
      <div className="space-y-2 sm:space-y-3 glass-panel rounded-lg p-3 sm:p-4 bg-background/80 shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
        <h3 className="font-medium text-xs sm:text-sm text-solana-teal mb-2 sm:mb-4">Full Tweet</h3>
        
        <p className="text-xs sm:text-sm whitespace-pre-wrap">{tweet.text}</p>
        
        <div className="text-xs text-muted-foreground mt-2 sm:mt-4">
          {tweet.date} • {tweet.time}
        </div>
        
        {/* Tweet metrics for mobile - shown here since they're hidden in the row */}
        <div className="flex items-center justify-between mt-2 sm:mt-3 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-pink-500">
              <Heart className="w-3.5 h-3.5" />
              <span className="ml-1 text-xs">{tweet.metrics.likes}</span>
            </div>
            <div className="flex items-center text-green-500">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="ml-1 text-xs">{tweet.metrics.retweets}</span>
            </div>
            <div className="flex items-center text-blue-500">
              <Eye className="w-3.5 h-3.5" />
              <span className="ml-1 text-xs">{tweet.metrics.views}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4">
          <a 
            href={tweet.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs flex items-center gap-1 text-solana-purple hover:underline"
          >
            View on Twitter <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TweetDetail;
