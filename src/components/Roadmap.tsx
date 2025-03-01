import React from 'react';
import { Rocket, Sparkles, Zap, Gem, Star, Lightbulb, Cpu, Layers, Compass } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'planned' | 'in-progress' | 'completed';
  quarter: 'Q2 2025' | 'Q3 2025' | 'Q4 2025' | 'Q1 2026';
}

const Roadmap: React.FC = () => {
  const roadmapItems: RoadmapItem[] = [
    {
      title: "Token Watchlist",
      description: "Create personalized watchlists for tokens you're interested in, with notifications for new airdrops.",
      icon: <Star className="h-6 w-6 text-yellow-400" />,
      status: 'in-progress',
      quarter: 'Q2 2025'
    },
    {
      title: "AI-Powered Scam Detection",
      description: "Enhanced scam detection using machine learning to identify suspicious airdrop patterns.",
      icon: <Cpu className="h-6 w-6 text-blue-500" />,
      status: 'planned',
      quarter: 'Q3 2025'
    },
    {
      title: "Token Analytics Dashboard",
      description: "Detailed analytics for each token, including historical data, sentiment analysis, and price predictions.",
      icon: <Layers className="h-6 w-6 text-purple-500" />,
      status: 'planned',
      quarter: 'Q3 2025'
    },
    {
      title: "Community Voting System",
      description: "Vote on the legitimacy and potential of airdrops, helping the community identify the best opportunities.",
      icon: <Compass className="h-6 w-6 text-green-500" />,
      status: 'planned',
      quarter: 'Q4 2025'
    },
    {
      title: "Mobile App Launch",
      description: "Native mobile applications for iOS and Android with push notifications for new airdrops.",
      icon: <Zap className="h-6 w-6 text-orange-500" />,
      status: 'planned',
      quarter: 'Q4 2025'
    },
    {
      title: "Token Integration API",
      description: "Public API for developers to integrate AirShark data into their own applications and services.",
      icon: <Gem className="h-6 w-6 text-indigo-500" />,
      status: 'planned',
      quarter: 'Q1 2026'
    },
  ];

  const getStatusColor = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'planned':
        return 'Planned';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden glass-panel animate-fade-in mt-8">
      <div className="px-4 py-6 bg-solana-purple/20 border-b border-solana-purple/10">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-solana-purple" />
          <h2 className="text-2xl font-bold">AirShark Roadmap</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Our vision for the future of AirShark - helping you discover the best Solana airdrops
        </p>
      </div>

      <div className="p-6 bg-gradient-to-br from-background to-background/80">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapItems.map((item, index) => (
            <div 
              key={index} 
              className="relative rounded-lg border border-border/30 bg-card p-5 hover:shadow-lg transition-all duration-300 hover:border-solana-purple/30 group"
            >
              <div className="absolute -top-3 -right-3 px-2 py-1 rounded-full text-xs font-medium text-white bg-solana-purple/80">
                {item.quarter}
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-muted/50 group-hover:bg-solana-purple/10 transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {item.description}
              </p>
              
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${getStatusColor(item.status)}`}></div>
                <span className="text-xs font-medium">{getStatusText(item.status)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-solana-purple/10 rounded-full border border-solana-purple/20">
            <Lightbulb className="h-4 w-4 text-solana-purple" />
            <span className="text-sm text-solana-purple">Have a feature suggestion? Let us know!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap; 