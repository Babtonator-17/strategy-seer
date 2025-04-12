
import { useState, useEffect } from 'react';
import { 
  fetchMarketNews, 
  fetchTechnicalAnalysis, 
  fetchCryptoMarketData, 
  fetchCommodityPrices 
} from '@/services/marketApiService';

interface CommandButton {
  text: string;
  command: string;
}

interface UseMarketDataResult {
  marketData: any;
  isLoadingMarketData: boolean;
  refreshMarketData: () => Promise<void>;
  updateSuggestedCommands: (commands: CommandButton[], response: string) => CommandButton[];
}

export const useMarketData = (
  setSuggestedCommands: React.Dispatch<React.SetStateAction<CommandButton[]>>
): UseMarketDataResult => {
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  const fetchInitialMarketData = async () => {
    setIsLoadingMarketData(true);
    try {
      const [cryptoData, commodityData, newsData] = await Promise.all([
        // Using string array format for fetchCryptoMarketData
        fetchCryptoMarketData(['bitcoin', 'ethereum', 'ripple', 'solana', 'cardano']),
        fetchCommodityPrices(),
        fetchMarketNews(undefined, 5)
      ]);
      
      setMarketData({
        crypto: cryptoData,
        commodities: commodityData,
        news: newsData
      });
      
      const newCommands: CommandButton[] = [];
      
      if (cryptoData && cryptoData.length > 0) {
        const topCrypto = cryptoData[0];
        newCommands.push({
          text: `${topCrypto.name} Analysis`,
          command: `Analyze ${topCrypto.symbol} price trend`
        });
      }
      
      if (commodityData && commodityData.length > 0) {
        const topCommodity = commodityData[0];
        newCommands.push({
          text: `${topCommodity.name} Market`,
          command: `What's happening with ${topCommodity.name.toLowerCase()} prices?`
        });
      }
      
      if (newsData && newsData.length > 0) {
        newsData.slice(0, 2).forEach(item => {
          if (item.instruments && item.instruments.length > 0) {
            newCommands.push({
              text: `${item.instruments[0]} News`,
              command: `Tell me about ${item.instruments[0]} based on this news: ${item.title}`
            });
          }
        });
      }
      
      if (newCommands.length > 0) {
        setSuggestedCommands(prevCommands => {
          const originalCommands = prevCommands.slice(0, 2);
          return [...originalCommands, ...newCommands.slice(0, 4)];
        });
      }
    } catch (error) {
      console.error('Error fetching initial market data:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  useEffect(() => {
    fetchInitialMarketData();
  }, []);

  const updateSuggestedCommands = (commands: CommandButton[], response: string): CommandButton[] => {
    const lowerResponse = response.toLowerCase();
    let updatedCommands = [...commands];
    
    if (lowerResponse.includes('position') || lowerResponse.includes('trade')) {
      updatedCommands = [
        { text: "Close Position", command: "Close my EURUSD position" },
        { text: "Modify Stop Loss", command: "Set stop loss for BTCUSD" },
        { text: "Show All Positions", command: "Show all my positions" },
        { text: "Trading History", command: "Show my recent trades" }
      ];
    } else if (lowerResponse.includes('analysis') || lowerResponse.includes('chart')) {
      updatedCommands = [
        { text: "BTC Analysis", command: "Analyze BTCUSD on 4h timeframe" },
        { text: "EUR/USD Support", command: "Support and resistance for EURUSD" },
        { text: "Market Sentiment", command: "What's the market sentiment?" },
        { text: "Technical Indicators", command: "Explain MACD indicator" }
      ];
    } else if (lowerResponse.includes('account') || lowerResponse.includes('balance')) {
      updatedCommands = [
        { text: "Account Summary", command: "Show my account summary" },
        { text: "Profit/Loss", command: "What's my total P&L today?" },
        { text: "Margin Level", command: "What's my margin level?" },
        { text: "Trading Limits", command: "Explain my trading limits" }
      ];
    } else if (lowerResponse.includes('commodity') || lowerResponse.includes('commodities')) {
      updatedCommands = [
        { text: "Gold Analysis", command: "Analyze gold price trends" },
        { text: "Oil Markets", command: "How is oil performing today?" },
        { text: "Best Commodities", command: "What are the best-performing commodities now?" },
        { text: "Commodity News", command: "Latest commodity market news" }
      ];
    } else if (lowerResponse.includes('news') || lowerResponse.includes('market')) {
      updatedCommands = [
        { text: "Market News", command: "Get the latest market news" },
        { text: "Crypto News", command: "Bitcoin news today" },
        { text: "Forex Updates", command: "Latest forex market updates" },
        { text: "Economic Calendar", command: "Important economic events today" }
      ];
    } else if (lowerResponse.includes('crypto') || lowerResponse.includes('bitcoin') || lowerResponse.includes('ethereum')) {
      updatedCommands = [
        { text: "BTC Price", command: "Current Bitcoin price" },
        { text: "ETH Analysis", command: "Ethereum price analysis" },
        { text: "Top Cryptos", command: "Show top performing cryptocurrencies" },
        { text: "Crypto Market", command: "Overall crypto market sentiment" }
      ];
    }
    
    return updatedCommands;
  };

  return {
    marketData,
    isLoadingMarketData,
    refreshMarketData: fetchInitialMarketData,
    updateSuggestedCommands
  };
};
