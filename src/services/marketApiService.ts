
import { supabase } from '@/integrations/supabase/client';

// Data caching configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
const dataCache: Record<string, { data: any; timestamp: number }> = {};

// Interface for technical analysis data
export interface TechnicalAnalysisData {
  symbol: string;
  interval: string;
  price?: number;
  sma: number | null;
  ema: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  bbUpper: number | null;
  bbMiddle: number | null;
  bbLower: number | null;
  lastUpdated: string;
}

// Interface for market news
export interface MarketNewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
  sentiment: number | null;
  instruments: string[];
}

// Interface for crypto data
export interface CryptoMarketData {
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

// Interface for commodity data
export interface CommodityData {
  symbol: string;
  name: string;
  price: number;
  unit: string;
  timestamp: string;
}

// Utility function to check if data cache is valid
const isCacheValid = (cacheKey: string): boolean => {
  if (!dataCache[cacheKey]) return false;
  
  const now = Date.now();
  const { timestamp } = dataCache[cacheKey];
  
  return now - timestamp < CACHE_DURATION;
};

// Fetch market news - accepts both string and string[] types
export const fetchMarketNews = async (symbol?: string | string[], limit?: number): Promise<MarketNewsItem[]> => {
  const cacheKey = `news_${symbol ? (Array.isArray(symbol) ? symbol.join(',') : symbol) : 'all'}_${limit || 'all'}`;
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    // If symbol is an array, take first element or undefined
    const symbolParam = Array.isArray(symbol) ? symbol[0] : symbol;
    
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'market-news', symbol: symbolParam },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Apply limit if provided
    const result = limit && data.length > limit ? data.slice(0, limit) : data;
    
    // Cache the result
    dataCache[cacheKey] = { data: result, timestamp: Date.now() };
    
    return result;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
};

// Fetch technical analysis for a symbol
export const fetchTechnicalAnalysis = async (symbol: string, interval: string = 'daily'): Promise<TechnicalAnalysisData | null> => {
  const cacheKey = `ta_${symbol}_${interval}`;
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'technical-analysis', symbol, interval },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Cache the result
    dataCache[cacheKey] = { data, timestamp: Date.now() };
    
    return data;
  } catch (error) {
    console.error(`Error fetching technical analysis for ${symbol}:`, error);
    return null;
  }
};

// Fetch crypto market data - accepts both string and string[] types
export const fetchCryptoMarketData = async (coins?: string | string[]): Promise<CryptoMarketData[]> => {
  const cacheKey = `crypto_${coins ? (Array.isArray(coins) ? coins.join(',') : coins) : 'all'}`;
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    // Convert string array to comma-separated format if it's an array
    let coinsParam = coins;
    
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'crypto-market', coins: coinsParam },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Cache the result
    dataCache[cacheKey] = { data, timestamp: Date.now() };
    
    return data;
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    return [];
  }
};

// Fetch commodity prices
export const fetchCommodityPrices = async (): Promise<CommodityData[]> => {
  const cacheKey = 'commodities';
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'commodity-prices' },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Cache the result
    dataCache[cacheKey] = { data, timestamp: Date.now() };
    
    return data;
  } catch (error) {
    console.error('Error fetching commodity prices:', error);
    return [];
  }
};

// Fetch stock quote
export const fetchStockQuote = async (symbol: string) => {
  const cacheKey = `stock_${symbol}`;
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'stock-quote', symbol },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Cache the result
    dataCache[cacheKey] = { data, timestamp: Date.now() };
    
    return data;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
};

// Fetch batch quotes for multiple symbols
export const fetchBatchQuotes = async (symbols: string[]) => {
  const cacheKey = `batch_${symbols.join(',')}`;
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'batch-quotes', symbols },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Cache the result
    dataCache[cacheKey] = { data, timestamp: Date.now() };
    
    return data;
  } catch (error) {
    console.error('Error fetching batch quotes:', error);
    return [];
  }
};

// Fetch Twitter sentiment for a query
export const fetchTwitterSentiment = async (query: string) => {
  const cacheKey = `twitter_${query}`;
  
  if (isCacheValid(cacheKey)) {
    return dataCache[cacheKey].data;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { action: 'twitter-sentiment', query },
      method: 'POST'
    });
    
    if (error) throw new Error(error.message);
    
    // Cache the result
    dataCache[cacheKey] = { data, timestamp: Date.now() };
    
    return data;
  } catch (error) {
    console.error(`Error fetching Twitter sentiment for "${query}":`, error);
    return null;
  }
};

// Clear all data cache
export const clearMarketDataCache = () => {
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
};
