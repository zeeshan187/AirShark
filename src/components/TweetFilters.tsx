import React, { useState } from 'react';
import { FilterOptions } from '../types';
import FilterBar from './FilterBar';
import { filterTweets, sortTweets } from '../utils/tweetFilterUtils';
import { Tweet } from '../types';

interface TweetFiltersProps {
  tweets: Tweet[];
  children: (filteredTweets: Tweet[]) => React.ReactNode;
}

const TweetFilters: React.FC<TweetFiltersProps> = ({ tweets, children }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    showScamTweets: true,
    showNonScamTweets: true,
    showVerified: true,
    showNonVerified: true,
    showUnknownTokens: false,
    tokenFilter: '',
    dateFilter: '',
    sortBy: 'mostRecent',
  });
  
  // Apply filters and sorting
  const filteredTweets = sortTweets(filterTweets(tweets, filters), filters.sortBy);
  
  const handleFilterChange = (partialFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...partialFilters }));
  };
  
  const resetFilters = () => {
    setFilters({
      showScamTweets: true,
      showNonScamTweets: true,
      showVerified: true,
      showNonVerified: true,
      showUnknownTokens: false,
      tokenFilter: '',
      dateFilter: '',
      sortBy: 'mostRecent',
    });
  };
  
  return (
    <div className="w-full">
      <FilterBar 
        isVisible={showFilters}
        filters={filters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        tweetCount={filteredTweets.length}
      />
      
      {children(filteredTweets)}
    </div>
  );
};

export default TweetFilters;
