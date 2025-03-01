
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent z-50">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          {/* Main shark logo */}
          <div className="w-40 h-40 flex items-center justify-center relative">
            <img 
              src="/lovable-uploads/3a89fc00-09c8-4f7e-92ca-423878d0d5ea.png" 
              alt="AirShark Logo" 
              className="w-full h-full object-contain animate-pulse-gentle"
            />
            <div className="absolute w-full h-full rounded-full animate-glow"></div>
          </div>
          
          {/* Star badge */}
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-solana-purple rounded-full flex items-center justify-center animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-white">AirShark</h1>
          <p className="text-solana-teal text-lg">Discover the latest opportunities in the Solana ecosystem</p>
        </div>
        
        <div className="relative mt-8">
          {/* Loading spinner */}
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-solana-purple animate-spin"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading airdrop data...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
