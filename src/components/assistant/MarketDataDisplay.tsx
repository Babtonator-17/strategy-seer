
import React from 'react';
import { BarChart4 } from 'lucide-react';

interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
}

interface CommodityData {
  symbol: string;
  name: string;
  price: number;
  unit: string;
  timestamp: string;
}

interface MarketNewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
  sentiment: number | null;
  instruments: string[];
}

interface MarketDataDisplayProps {
  marketData: {
    crypto?: CryptoMarketData[];
    commodities?: CommodityData[];
    news?: MarketNewsItem[];
  } | null;
  isLoading: boolean;
}

const MarketDataDisplay: React.FC<MarketDataDisplayProps> = ({ marketData, isLoading }) => {
  if (!marketData || isLoading) return null;
  
  return (
    <div className="bg-muted p-2 rounded-md mb-3 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <BarChart4 className="h-4 w-4 text-primary" />
        <span className="font-medium">Market Data</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {marketData.crypto && marketData.crypto.length > 0 && (
          <div>
            <span className="text-muted-foreground">BTC:</span> ${marketData.crypto[0].current_price.toLocaleString()}
            <span className={marketData.crypto[0].price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>
              {' '}{marketData.crypto[0].price_change_percentage_24h > 0 ? '↑' : '↓'}{Math.abs(marketData.crypto[0].price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        )}
        {marketData.commodities && marketData.commodities.length > 0 && (
          <div className="truncate">
            <span className="text-muted-foreground">{marketData.commodities[0].name}:</span> ${marketData.commodities[0].price.toLocaleString()}
          </div>
        )}
        {marketData.news && marketData.news.length > 0 && (
          <div className="truncate">
            <span className="text-muted-foreground">Latest:</span> {marketData.news[0].title.substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketDataDisplay;
