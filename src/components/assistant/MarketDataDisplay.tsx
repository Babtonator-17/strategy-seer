
import React from 'react';
import { BarChart4, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  onRefresh?: () => void;
  collapsed?: boolean;
  toggleCollapsed?: () => void;
}

const MarketDataDisplay: React.FC<MarketDataDisplayProps> = ({ 
  marketData, 
  isLoading, 
  onRefresh,
  collapsed = false,
  toggleCollapsed
}) => {
  if (!marketData) {
    return isLoading ? (
      <div className="bg-muted p-2 rounded-md mb-3 text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading market data...</span>
        </div>
      </div>
    ) : null;
  }
  
  // Get the most recent timestamp for display
  const getLatestUpdate = () => {
    const timestamps = [
      marketData.commodities?.[0]?.timestamp,
      marketData.news?.[0]?.timestamp,
    ].filter(Boolean);
    
    if (timestamps.length === 0) return null;
    
    const latestTimestamp = new Date(Math.max(...timestamps.map(t => new Date(t as string).getTime())));
    return formatDistanceToNow(latestTimestamp, { addSuffix: true });
  };
  
  const latestUpdate = getLatestUpdate();
  
  return (
    <div className="bg-muted p-2 rounded-md mb-3 text-xs">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleCollapsed}>
          <BarChart4 className="h-4 w-4 text-primary" />
          <span className="font-medium">Market Data</span>
          {toggleCollapsed && (
            <span className="text-xs text-muted-foreground">
              {collapsed ? '(click to expand)' : '(click to collapse)'}
            </span>
          )}
        </div>
        {isLoading ? (
          <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex items-center gap-2">
            {latestUpdate && (
              <span className="text-muted-foreground text-[10px]">Updated {latestUpdate}</span>
            )}
            {onRefresh && (
              <RefreshCw 
                className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
      )}
    </div>
  );
};

export default MarketDataDisplay;
