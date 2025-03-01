import React from 'react';

interface HeaderProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
  currentQuery: string;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated, isLoading, onRefresh, currentQuery }) => {
  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    // For times within the last 24 hours, show time
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // For older times, show date and time
    return lastUpdated.toLocaleDateString() + ' ' + lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="w-full flex justify-center">
      <header className="w-full max-w-[1280px] py-4 px-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 relative">
              <img 
                src="/lovable-uploads/3a89fc00-09c8-4f7e-92ca-423878d0d5ea.png" 
                alt="AirShark Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AirShark</h1>
              <p className="text-sm text-muted-foreground">Solana airdrop tracker</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Last updated indicator - hidden on mobile */}
          <div className="hidden sm:block text-xs text-muted-foreground">
            Last updated: <span className="font-medium">{formatLastUpdated()}</span>
          </div>
          
          {/* Refresh button - hidden on mobile */}
          <button 
            onClick={onRefresh} 
            disabled={isLoading}
            className="hidden sm:flex items-center justify-center rounded-md bg-background p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            aria-label="Refresh data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* Mobile-only refresh icon */}
          <button 
            onClick={onRefresh} 
            disabled={isLoading}
            className="sm:hidden flex items-center justify-center rounded-md bg-background p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            aria-label="Refresh data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
