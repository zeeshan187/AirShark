import React, { useState, useMemo } from 'react';
import { ProcessedTweet } from '../types';
import { ExternalLink, Heart, RefreshCw, Eye, MessageCircle, Quote, Bookmark, Users, Hash, AtSign, Info, ChevronDown, AlertTriangle, ArrowUpDown, Search, Filter, Calendar } from 'lucide-react';

interface TweetTableProps {
  tweets: ProcessedTweet[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
  hasMoreTweets?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  refreshCount?: number;
}

type SortField = 'token' | 'date' | 'likes' | 'retweets' | 'views';
type SortDirection = 'asc' | 'desc';

interface Filters {
  token: string;
  dateFrom: string;
  dateTo: string;
  showScamOnly: boolean;
  showVerifiedOnly: boolean;
  minEngagement: number;
  searchText: string;
}

const TweetTable: React.FC<TweetTableProps> = ({ 
  tweets, 
  isLoading, 
  onRefresh,
  lastUpdated,
  hasMoreTweets = false,
  isLoadingMore = false,
  onLoadMore = () => {},
  refreshCount = 0
}) => {
  const [expandedTweet, setExpandedTweet] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    token: '',
    dateFrom: '',
    dateTo: '',
    showScamOnly: false,
    showVerifiedOnly: false,
    minEngagement: 0,
    searchText: ''
  });

  const toggleExpand = (id: string) => {
    setExpandedTweet(expandedTweet === id ? null : id);
  };

  const toggleDetails = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setShowDetails(showDetails === id ? null : id);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedTweets = useMemo(() => {
    // First apply filters
    let filtered = tweets.filter(tweet => {
      const matchesToken = filters.token ? 
        tweet.token.toLowerCase().includes(filters.token.toLowerCase()) : true;
      
      const tweetDate = new Date(`${tweet.date} ${tweet.time}`);
      const matchesDateFrom = filters.dateFrom ? 
        tweetDate >= new Date(filters.dateFrom) : true;
      const matchesDateTo = filters.dateTo ? 
        tweetDate <= new Date(filters.dateTo) : true;
      
      const matchesScam = filters.showScamOnly ? 
        tweet.qualityIndicators.scamScore > 30 : true;
      
      const matchesVerified = filters.showVerifiedOnly ? 
        tweet.author.isBlueVerified : true;
      
      const engagement = tweet.metrics.likes + tweet.metrics.retweets;
      const matchesEngagement = engagement >= filters.minEngagement;
      
      const matchesSearch = filters.searchText ? 
        tweet.text.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        tweet.author.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        tweet.author.userName.toLowerCase().includes(filters.searchText.toLowerCase()) :
        true;

      return matchesToken && matchesDateFrom && matchesDateTo &&
        matchesScam && matchesVerified && matchesEngagement && matchesSearch;
    });

    // Then sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'token':
          comparison = a.token.localeCompare(b.token);
          break;
        case 'date':
          comparison = new Date(`${b.date} ${b.time}`).getTime() - 
            new Date(`${a.date} ${a.time}`).getTime();
          break;
        case 'likes':
          comparison = b.metrics.likes - a.metrics.likes;
          break;
        case 'retweets':
          comparison = b.metrics.retweets - a.metrics.retweets;
          break;
        case 'views':
          comparison = (b.metrics.views || 0) - (a.metrics.views || 0);
          break;
      }
      return sortDirection === 'asc' ? -comparison : comparison;
    });
  }, [tweets, sortField, sortDirection, filters]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    return (
      <ArrowUpDown 
        size={14} 
        className={`ml-1 ${sortDirection === 'asc' ? 'text-green-400' : 'text-red-400'}`} 
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters(f => ({ ...f, searchText: e.target.value }))}
            placeholder="Search tweets..."
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Token Filter</label>
              <input
                type="text"
                value={filters.token}
                onChange={(e) => setFilters(f => ({ ...f, token: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
                placeholder="Filter by token..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  className="flex-1 px-2 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  className="flex-1 px-2 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Min Engagement</label>
              <input
                type="number"
                min="0"
                value={filters.minEngagement}
                onChange={(e) => setFilters(f => ({ ...f, minEngagement: Number(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showScamOnly}
                  onChange={(e) => setFilters(f => ({ ...f, showScamOnly: e.target.checked }))}
                  className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">Show Potential Scams</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showVerifiedOnly}
                  onChange={(e) => setFilters(f => ({ ...f, showVerifiedOnly: e.target.checked }))}
                  className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">Verified Only</span>
              </label>
            </div>

            <div>
              <button
                onClick={() => setFilters({
                  token: '',
                  dateFrom: '',
                  dateTo: '',
                  showScamOnly: false,
                  showVerifiedOnly: false,
                  minEngagement: 0,
                  searchText: ''
                })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 bg-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('token')}>
                Token {renderSortIcon('token')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tweet
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                Date {renderSortIcon('date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span>Metrics</span>
                  <div className="flex space-x-1">
                    <button onClick={() => handleSort('likes')} className="hover:bg-gray-700 p-1 rounded">
                      <Heart size={14} className={sortField === 'likes' ? 'text-red-400' : 'text-gray-400'} />
                    </button>
                    <button onClick={() => handleSort('retweets')} className="hover:bg-gray-700 p-1 rounded">
                      <RefreshCw size={14} className={sortField === 'retweets' ? 'text-green-400' : 'text-gray-400'} />
                    </button>
                    <button onClick={() => handleSort('views')} className="hover:bg-gray-700 p-1 rounded">
                      <Eye size={14} className={sortField === 'views' ? 'text-blue-400' : 'text-gray-400'} />
                    </button>
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {filteredAndSortedTweets.map((tweet) => (
              <tr 
                key={`${tweet.id}-${refreshCount}`}
                className={`hover:bg-gray-800 transition-colors ${expandedTweet === tweet.id ? 'bg-gray-800' : ''}`}
                onClick={() => toggleExpand(tweet.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">{tweet.token}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={tweet.author.profilePicture} 
                      alt={tweet.author.userName}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-white">{tweet.author.name}</span>
                        {tweet.author.isBlueVerified && (
                          <span className="text-blue-400">✓</span>
                        )}
                        <span className="text-sm text-gray-400">@{tweet.author.userName}</span>
                      </div>
                      <p className={`text-sm text-gray-300 ${expandedTweet === tweet.id ? '' : 'line-clamp-2'}`}>
                        {tweet.text}
                      </p>
                      {tweet.hashtags && tweet.hashtags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Hash size={14} className="text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {tweet.hashtags.map((tag, index) => (
                              <span key={index} className="text-xs text-blue-400">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {tweet.mentions && tweet.mentions.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <AtSign size={14} className="text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {tweet.mentions.map((mention, index) => (
                              <span key={index} className="text-xs text-blue-400">{mention}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{tweet.date}</div>
                  <div className="text-sm text-gray-400">{tweet.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1" title="Likes">
                      <Heart size={14} className="text-red-400" />
                      <span className="text-sm text-gray-300">{tweet.metrics.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="Retweets">
                      <RefreshCw size={14} className="text-green-400" />
                      <span className="text-sm text-gray-300">{tweet.metrics.retweets.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="Views">
                      <Eye size={14} className="text-blue-400" />
                      <span className="text-sm text-gray-300">{tweet.metrics.views?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="Replies">
                      <MessageCircle size={14} className="text-yellow-400" />
                      <span className="text-sm text-gray-300">{tweet.metrics.replies?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="Quotes">
                      <Quote size={14} className="text-purple-400" />
                      <span className="text-sm text-gray-300">{tweet.metrics.quotes?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="Bookmarks">
                      <Bookmark size={14} className="text-indigo-400" />
                      <span className="text-sm text-gray-300">{tweet.metrics.bookmarks?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <a 
                      href={tweet.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button 
                      onClick={(e) => toggleDetails(e, tweet.id)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Load More Button */}
        {!isLoading && filteredAndSortedTweets.length > 0 && hasMoreTweets && (
          <div className="flex justify-center p-4 border-t border-gray-700">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <ChevronDown size={16} />
              )}
              <span>{isLoadingMore ? 'Loading more...' : 'Load more tweets'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetTable;