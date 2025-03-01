
import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-4 px-6 mt-auto border-t border-border/30 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
      <div>
        <p>© {currentYear} AirShark Airdrop. All rights reserved.</p>
        <p className="text-xs">Tracking Solana airdrops in real-time. Data is refreshed every 10 minutes to ensure you never miss an opportunity.</p>
      </div>
      
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-muted/20 transition-colors"
          aria-label="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-muted/20 transition-colors"
          aria-label="Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <div className="flex items-center space-x-2">
          <span>Made with</span>
          <span className="text-solana-purple">♥</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
