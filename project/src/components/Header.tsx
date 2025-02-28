import React from 'react';
import { Sparkles, Rocket } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 py-6 px-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Rocket className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Solana Airdrop Tracker</h1>
            <p className="text-indigo-300 text-sm">Stay updated with the latest Solana airdrops</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-indigo-800 bg-opacity-50 px-3 py-1 rounded-full border border-indigo-700">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-indigo-200 text-sm">Real-time Twitter data updated every 10 minutes</span>
        </div>
      </div>
    </header>
  );
};

export default Header;