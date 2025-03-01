
import { Tweet } from "../types";

// Generate a random number within a range
const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Creating mock tweet data with realistic content
export const mockTweets: Tweet[] = [
  {
    id: "1",
    url: "https://twitter.com/MockProject/status/1",
    text: "Excited to announce $MOCK token airdrop for all Solana users! Snapshot on Dec 15, 2025. #Solana #Airdrop",
    date: "Mar 01, 2025",
    time: "03:09",
    timestamp: "2025-03-01T03:09:00Z",
    author: {
      username: "MockProject",
      name: "Mock Project",
      profilePicture: "https://secure.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 15000,
      following: 200
    },
    metrics: {
      likes: 1200,
      retweets: 450,
      views: 25000,
      replies: 120,
      quotes: 30,
      bookmarks: 80
    },
    token: "MOCK",
    isScam: false,
    hashtags: ["Solana", "Airdrop"]
  },
  {
    id: "2",
    url: "https://twitter.com/DefiProtocol/status/2",
    text: "The $DEFI token airdrop is coming to Solana! All wallet holders with >0.1 SOL will be eligible. Claim starts Jan 10, 2026.",
    date: "Feb 28, 2025",
    time: "03:09",
    timestamp: "2025-02-28T03:09:00Z",
    author: {
      username: "DefiProtocol",
      name: "DeFi Protocol",
      profilePicture: "https://secure.gravatar.com/avatar/305e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 45000,
      following: 350
    },
    metrics: {
      likes: 850,
      retweets: 320,
      views: 18000,
      replies: 95,
      quotes: 25,
      bookmarks: 60
    },
    token: "DEFI",
    isScam: false,
    hashtags: []
  },
  {
    id: "3",
    url: "https://twitter.com/GameFiProject/status/3",
    text: "Announcing $GAME token! The future of gaming on Solana. Airdrop for all NFT holders. Connect wallet now to verify eligibility!",
    date: "Feb 27, 2025",
    time: "03:09",
    timestamp: "2025-02-27T03:09:00Z",
    author: {
      username: "GameFiProject",
      name: "GameFi Project",
      profilePicture: "https://secure.gravatar.com/avatar/405e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 25000,
      following: 150
    },
    metrics: {
      likes: 650,
      retweets: 280,
      views: 12000,
      replies: 75,
      quotes: 20,
      bookmarks: 40
    },
    token: "GAME",
    isScam: false,
    hashtags: []
  },
  {
    id: "4",
    url: "https://twitter.com/ScamAirdrop/status/4",
    text: "🔥 $SCAM AIRDROP ALERT! 🔥 Send 0.1 SOL to our wallet and get 100 $SCAM tokens! Limited time offer! DM for wallet address. #Solana #Free #Airdrop #Crypto",
    date: "Feb 26, 2025",
    time: "03:09",
    timestamp: "2025-02-26T03:09:00Z",
    author: {
      username: "ScamAirdrop",
      name: "Free Airdrops",
      profilePicture: "https://secure.gravatar.com/avatar/505e460b479e2e5b48aec07710c08d50",
      verified: false,
      followers: 2000,
      following: 5000
    },
    metrics: {
      likes: 250,
      retweets: 120,
      views: 5000,
      replies: 180,
      quotes: 15,
      bookmarks: 10
    },
    token: "SCAM",
    isScam: true,
    hashtags: ["Solana", "Free", "Airdrop", "Crypto"]
  },
  {
    id: "5",
    url: "https://twitter.com/SolanaFoundation/status/5",
    text: "Solana Foundation is excited to announce our new ecosystem growth initiative. Multiple airdrops coming from verified projects over the next 6 months. Stay tuned for more details! #Solana #Ecosystem",
    date: "Feb 25, 2025",
    time: "03:09",
    timestamp: "2025-02-25T03:09:00Z",
    author: {
      username: "SolanaFdn",
      name: "Solana Foundation",
      profilePicture: "https://secure.gravatar.com/avatar/605e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 950000,
      following: 500
    },
    metrics: {
      likes: 12500,
      retweets: 3800,
      views: 250000,
      replies: 1800,
      quotes: 450,
      bookmarks: 2200
    },
    token: "SOL",
    isScam: false,
    hashtags: ["Solana", "Ecosystem"]
  },
  {
    id: "6",
    url: "https://twitter.com/NFTProject/status/6",
    text: "The $NFT token airdrop is now live! All Solana NFT holders are eligible. Claim your tokens within the next 48 hours. #NFT #Solana #Airdrop",
    date: "Feb 24, 2025",
    time: "03:09",
    timestamp: "2025-02-24T03:09:00Z",
    author: {
      username: "NFTProject",
      name: "NFT Project",
      profilePicture: "https://secure.gravatar.com/avatar/705e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 78000,
      following: 320
    },
    metrics: {
      likes: 3400,
      retweets: 1200,
      views: 87000,
      replies: 450,
      quotes: 120,
      bookmarks: 350
    },
    token: "NFT",
    isScam: false,
    hashtags: ["NFT", "Solana", "Airdrop"]
  },
  {
    id: "7",
    url: "https://twitter.com/ScamBot9000/status/7",
    text: "⚠️ URGENT: $SOLANA AIRDROP CLOSES IN 2 HOURS! ⚠️ Send wallet address in DM to receive 500 $SOL tokens! HURRY!!! #LastChance #FreeAirdrop #SendFast",
    date: "Feb 23, 2025",
    time: "03:09",
    timestamp: "2025-02-23T03:09:00Z",
    author: {
      username: "ScamBot9000",
      name: "Solana Airdrops Official",
      profilePicture: "https://secure.gravatar.com/avatar/805e460b479e2e5b48aec07710c08d50",
      verified: false,
      followers: 1200,
      following: 8000
    },
    metrics: {
      likes: 180,
      retweets: 95,
      views: 2500,
      replies: 220,
      quotes: 5,
      bookmarks: 3
    },
    token: "SOL",
    isScam: true,
    hashtags: ["LastChance", "FreeAirdrop", "SendFast"]
  },
  {
    id: "8",
    url: "https://twitter.com/DEXProtocol/status/8",
    text: "Introducing $DEX - the next generation decentralized exchange on Solana. Airdrop for early users starts next week. Register now at our website. #Solana #DEX #DeFi",
    date: "Feb 22, 2025",
    time: "03:09",
    timestamp: "2025-02-22T03:09:00Z",
    author: {
      username: "DEXProtocol",
      name: "DEX Protocol",
      profilePicture: "https://secure.gravatar.com/avatar/905e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 56000,
      following: 250
    },
    metrics: {
      likes: 2800,
      retweets: 950,
      views: 67000,
      replies: 320,
      quotes: 85,
      bookmarks: 190
    },
    token: "DEX",
    isScam: false,
    hashtags: ["Solana", "DEX", "DeFi"]
  },
  {
    id: "9",
    url: "https://twitter.com/StablecoinProject/status/9",
    text: "Announcing $STABLE - the first algorithmic stablecoin with Solana airdrop rewards. All SOL holders with >1 SOL will receive tokens. Snapshot on Mar 15th. #Stablecoin #Solana",
    date: "Feb 21, 2025",
    time: "03:09",
    timestamp: "2025-02-21T03:09:00Z",
    author: {
      username: "StablecoinProject",
      name: "Stablecoin Project",
      profilePicture: "https://secure.gravatar.com/avatar/a05e460b479e2e5b48aec07710c08d50",
      verified: true,
      followers: 42000,
      following: 180
    },
    metrics: {
      likes: 1700,
      retweets: 580,
      views: 48000,
      replies: 260,
      quotes: 70,
      bookmarks: 130
    },
    token: "STABLE",
    isScam: false,
    hashtags: ["Stablecoin", "Solana"]
  },
  {
    id: "10",
    url: "https://twitter.com/PonziScheme/status/10",
    text: "🤑 GUARANTEED 100x RETURNS 🤑 $PONZI token launching on Solana with MASSIVE airdrop! Send 0.5 SOL to participate and get 1000 PONZI! Limited to first 100 participants! #GetRichQuick #Solana",
    date: "Feb 20, 2025",
    time: "03:09",
    timestamp: "2025-02-20T03:09:00Z",
    author: {
      username: "PonziScheme",
      name: "High Yield Investments",
      profilePicture: "https://secure.gravatar.com/avatar/b05e460b479e2e5b48aec07710c08d50",
      verified: false,
      followers: 3500,
      following: 7500
    },
    metrics: {
      likes: 420,
      retweets: 180,
      views: 9500,
      replies: 350,
      quotes: 25,
      bookmarks: 15
    },
    token: "PONZI",
    isScam: true,
    hashtags: ["GetRichQuick", "Solana"]
  }
];

// More tweets can be generated by combining elements randomly
export const generateMoreMockTweets = (count: number): Tweet[] => {
  const tokens = ["SOL", "DEFI", "GAME", "STABLE", "NFT", "DEX", "MEME", "FI", "PLAY", "META"];
  const hashtags = ["Solana", "Airdrop", "Crypto", "DeFi", "NFT", "FreeTokens", "SolanaSummer", "Web3"];
  const additionalTweets: Tweet[] = [];
  
  for (let i = 0; i < count; i++) {
    const isScam = Math.random() > 0.7;
    const tokenIndex = randomNum(0, tokens.length - 1);
    const token = tokens[tokenIndex];
    const verified = Math.random() > (isScam ? 0.9 : 0.3); // Scam accounts are less likely to be verified
    
    const selectedHashtags = [];
    const hashtagCount = randomNum(0, 3);
    for (let j = 0; j < hashtagCount; j++) {
      const hashtag = hashtags[randomNum(0, hashtags.length - 1)];
      if (!selectedHashtags.includes(hashtag)) {
        selectedHashtags.push(hashtag);
      }
    }
    
    let tweetText = "";
    
    if (isScam) {
      tweetText = `🔥 $${token} AIRDROP ALERT! 🔥 ${randomNum(100, 10000)} tokens for early participants! ${
        Math.random() > 0.5 ? "Send your wallet address in DM" : "Send " + (randomNum(1, 10) / 10).toFixed(1) + " SOL to participate"
      }! #${selectedHashtags.join(" #")}`;
    } else {
      tweetText = `Announcing $${token} token ${
        Math.random() > 0.5 ? "airdrop" : "launch"
      } on Solana! ${
        Math.random() > 0.5 ? "All wallet holders" : "Early supporters"
      } will receive tokens. ${
        Math.random() > 0.5 ? "Snapshot on " + new Date(Date.now() + randomNum(30, 365) * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Visit our website to learn more"
      }. #${selectedHashtags.join(" #")}`;
    }
    
    additionalTweets.push({
      id: `generated-${mockTweets.length + i + 1}`,
      url: `https://twitter.com/user${randomNum(1000, 9999)}/status/${randomNum(1000000, 9999999)}`,
      text: tweetText,
      date: new Date(Date.now() - randomNum(0, 30) * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: `${String(randomNum(0, 23)).padStart(2, '0')}:${String(randomNum(0, 59)).padStart(2, '0')}`,
      timestamp: new Date(Date.now() - randomNum(0, 30) * 86400000).toISOString(),
      author: {
        username: `${token.toLowerCase()}${isScam ? 'Official' + randomNum(100, 999) : 'Project'}`,
        name: `${token} ${isScam ? 'Airdrops' : 'Protocol'}`,
        profilePicture: `https://secure.gravatar.com/avatar/${randomNum(100000, 999999)}e460b479e2e5b48aec07710c08d50`,
        verified: verified,
        followers: isScam ? randomNum(500, 5000) : randomNum(5000, 100000),
        following: isScam ? randomNum(3000, 10000) : randomNum(100, 1000)
      },
      metrics: {
        likes: randomNum(50, 5000),
        retweets: randomNum(20, 2000),
        views: randomNum(1000, 100000),
        replies: randomNum(10, 500),
        quotes: randomNum(5, 100),
        bookmarks: randomNum(10, 500)
      },
      token: token,
      isScam: isScam,
      hashtags: selectedHashtags
    });
  }
  
  return additionalTweets;
};
