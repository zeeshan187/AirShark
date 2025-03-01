import React from 'react';
import { FilterOptions } from '../types';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  isVisible: boolean;
  filters: FilterOptions;
  onToggleFilters: () => void;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  tweetCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  isVisible,
  filters,
  onToggleFilters,
  onFilterChange,
  onResetFilters,
  tweetCount,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onFilterChange({ [name]: checked });
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    onFilterChange({ sortBy: value as FilterOptions["sortBy"] });
  };

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium flex items-center gap-2">
          <h2>Recent Tweets</h2>
          <span className="text-sm text-muted-foreground">
            Showing {tweetCount} tweets about airdrops
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFilters}
            className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 flex items-center gap-2 transition-colors"
          >
            {isVisible ? 'Hide Filters' : 'Show Filters'}
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg mb-4 animate-fade-in">
          <div>
            <h3 className="font-medium mb-2">Token</h3>
            <input
              type="text"
              name="tokenFilter"
              placeholder="Filter by token name"
              value={filters.tokenFilter}
              onChange={handleTextInputChange}
              className="w-full p-2 rounded-md bg-muted border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            
            <h3 className="font-medium mt-4 mb-2">Date</h3>
            <input
              type="date"
              name="dateFilter"
              value={filters.dateFilter}
              onChange={handleTextInputChange}
              className="w-full p-2 rounded-md bg-muted border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Tweet Types</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showScamTweets"
                  checked={filters.showScamTweets}
                  onChange={handleCheckboxChange}
                  className="rounded text-primary"
                />
                <span>Scam Tweets</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showNonScamTweets"
                  checked={filters.showNonScamTweets}
                  onChange={handleCheckboxChange}
                  className="rounded text-primary"
                />
                <span>Non-Scam Tweets</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showVerified"
                  checked={filters.showVerified}
                  onChange={handleCheckboxChange}
                  className="rounded text-primary"
                />
                <span>Verified</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showNonVerified"
                  checked={filters.showNonVerified}
                  onChange={handleCheckboxChange}
                  className="rounded text-primary"
                />
                <span>Non-Verified</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showUnknownTokens"
                  checked={filters.showUnknownTokens}
                  onChange={handleCheckboxChange}
                  className="rounded text-primary"
                />
                <span>Unknown Tokens</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={handleSelectChange}
              className="w-full p-2 rounded-md bg-muted border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="mostRecent">Most Recent</option>
              <option value="mostLikes">Most Likes</option>
              <option value="mostRetweets">Most Retweets</option>
              <option value="mostViews">Most Views</option>
            </select>
            
            <button
              onClick={onResetFilters}
              className="w-full mt-4 px-4 py-2 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
