import React from 'react';
import { Tweet } from '../types';
import { Heart, RefreshCw, MessageCircle, Eye, Bookmark, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TweetRowProps {
  tweet: Tweet;
  onClick: () => void;
  isExpanded: boolean;
  isHighlighted: boolean;
}

const TweetRow: React.FC<TweetRowProps> = ({ tweet, onClick, isExpanded, isHighlighted }) => {
  // Parse the date for relative time display
  const tweetDate = new Date(tweet.timestamp);
  const relativeTime = formatDistanceToNow(tweetDate, { addSuffix: true });
  
  return (
    <div 
      className={`group border-b border-border/30 transition-all duration-300 ${
        isHighlighted ? 'bg-muted/50' : 'hover:bg-muted/40'
      } ${isExpanded ? 'bg-muted/50' : ''} odd:bg-background even:bg-muted/20`}
    >
      <div 
        className="grid grid-cols-[auto,1fr,auto] sm:grid-cols-[auto,auto,1fr,auto,auto] md:grid-cols-[auto,auto,1fr,auto,auto,auto] gap-2 sm:gap-4 p-2 sm:p-4 cursor-pointer" 
        onClick={onClick}
      >
        {/* Profile Image (Mobile and Desktop) */}
        <div className="flex items-center justify-center">
          {/* Mobile: Show larger profile image */}
          <div className="sm:hidden w-14 h-14 rounded-full overflow-hidden border-2 border-solana-purple/30">
            <img 
              src={tweet.author.profilePicture} 
              alt={tweet.author.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Desktop: Show profile image */}
          <div className="hidden sm:flex w-12 h-12 rounded-full overflow-hidden border-2 border-solana-purple/30">
            <img 
              src={tweet.author.profilePicture} 
              alt={tweet.author.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Token Column (Desktop only) */}
        <div className="hidden sm:flex items-center justify-center">
          {tweet.token ? (
            <div className="w-16 h-12 rounded-md bg-muted/80 flex items-center justify-center font-bold text-sm text-solana-purple border border-solana-purple/30">
              ${tweet.token}
            </div>
          ) : (
            <div className="w-16 h-12 rounded-md bg-muted/80 flex items-center justify-center text-muted-foreground text-xs text-center border border-muted-foreground/30">
              $Unknown
            </div>
          )}
        </div>
        
        {/* Tweet content */}
        <div className="flex flex-col min-w-0">
          {/* Mobile view: Show token name prominently */}
          <div className="sm:hidden flex items-center mb-1">
            <span className="font-bold text-base text-solana-purple">${tweet.token || 'Unknown'}</span>
            {tweet.isScam && (
              <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
                <AlertTriangle className="w-3 h-3 mr-0.5" />
                <span>Scam</span>
              </span>
            )}
          </div>
          
          {/* Author info - simplified for mobile */}
          <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
            <span className="font-medium truncate text-sm sm:text-base">{tweet.author.name}</span>
            {tweet.author.verified && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-solana-teal flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
              </svg>
            )}
            <span className="text-muted-foreground text-xs sm:text-sm truncate hidden xs:inline">@{tweet.author.username}</span>
            {/* Scam warning - desktop only */}
            {tweet.isScam && (
              <span className="hidden sm:inline-flex items-center px-1 sm:px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Possible Scam</span>
                <span className="sm:hidden">Scam</span>
              </span>
            )}
          </div>
          
          <p className="text-xs sm:text-sm line-clamp-2">{tweet.text}</p>
          
          {tweet.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tweet.hashtags.slice(0, 3).map((hashtag, index) => (
                <span key={index} className="text-xs text-solana-purple">#{hashtag}</span>
              ))}
              {tweet.hashtags.length > 3 && (
                <span className="text-xs text-solana-purple">+{tweet.hashtags.length - 3} more</span>
              )}
            </div>
          )}
          
          {/* Mobile-only date display */}
          <div className="text-xs text-muted-foreground mt-1 sm:hidden">
            {tweet.date}
          </div>
        </div>
        
        {/* Date - Hidden on mobile */}
        <div className="text-right text-sm text-muted-foreground flex-col items-end justify-center mr-2 hidden sm:flex">
          <div>{tweet.date}</div>
          <div className="text-xs">{tweet.time}</div>
        </div>
        
        {/* Metrics - Hidden on small screens */}
        <div className="items-center gap-4 hidden md:flex">
          <div className="flex flex-col items-center">
            <div className="flex items-center text-pink-500">
              <Heart className="w-4 h-4" />
              <span className="ml-1 text-xs">{tweet.metrics.likes}</span>
            </div>
            <div className="flex items-center text-green-500">
              <RefreshCw className="w-4 h-4" />
              <span className="ml-1 text-xs">{tweet.metrics.retweets}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center text-blue-500">
              <Eye className="w-4 h-4" />
              <span className="ml-1 text-xs">{tweet.metrics.views}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span className="ml-1 text-xs">{tweet.metrics.replies}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center">
          <div className="flex space-x-1">
            <button className="p-1 sm:p-1.5 rounded-full hover:bg-muted/80 hover:scale-110 transition-all touch-manipulation" aria-label="View tweet details">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <a 
              href={tweet.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 sm:p-1.5 rounded-full hover:bg-muted/80 hover:scale-110 transition-all touch-manipulation"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open on Twitter"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            <button className="p-1 sm:p-1.5 rounded-full hover:bg-muted/80 hover:scale-110 transition-all touch-manipulation" aria-label="Expand/Collapse">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Expanded details will be handled by TweetDetail component */}
    </div>
  );
};

export default TweetRow;
