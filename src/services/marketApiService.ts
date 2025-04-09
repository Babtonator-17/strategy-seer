
import { supabase } from '@/integrations/supabase/client';

// Interface for technical analysis data
export interface TechnicalAnalysisData {
  symbol: string;
  interval: string;
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

// Fetch market news
export const fetchMarketNews = async (symbol?: string, limit?: number): Promise<MarketNewsItem[]> => {
  try {
    let url = `market-news`;
    if (symbol) {
      url += `?symbol=${encodeURIComponent(symbol)}`;
    }
    
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: null,
      method: 'GET',
      path: url
    });
    
    if (error) throw new Error(error.message);
    
    // Apply limit if provided
    if (limit && data.length > limit) {
      return data.slice(0, limit);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
};

// Fetch technical analysis for a symbol
export const fetchTechnicalAnalysis = async (symbol: string, interval: string = 'daily'): Promise<TechnicalAnalysisData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: null,
      method: 'GET',
      path: `technical-analysis?symbol=${encodeURIComponent(symbol)}&interval=${interval}`
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error(`Error fetching technical analysis for ${symbol}:`, error);
    return null;
  }
};

// Fetch crypto market data
export const fetchCryptoMarketData = async (coins?: string): Promise<CryptoMarketData[]> => {
  try {
    let url = `crypto-market`;
    if (coins) {
      url += `?coins=${encodeURIComponent(coins)}`;
    }
    
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: null,
      method: 'GET',
      path: url
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    return [];
  }
};

// Fetch commodity prices
export const fetchCommodityPrices = async (): Promise<CommodityData[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: null,
      method: 'GET',
      path: 'commodity-prices'
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching commodity prices:', error);
    return [];
  }
};

// Fetch stock quote
export const fetchStockQuote = async (symbol: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: null,
      method: 'GET',
      path: `stock-quote?symbol=${encodeURIComponent(symbol)}`
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
};

// Fetch batch quotes for multiple symbols
export const fetchBatchQuotes = async (symbols: string[]) => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: { symbols },
      method: 'POST',
      path: 'batch-quotes'
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching batch quotes:', error);
    return [];
  }
};

// Fetch Twitter sentiment for a query
export const fetchTwitterSentiment = async (query: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('trading-apis', {
      body: null,
      method: 'GET',
      path: `twitter-sentiment?query=${encodeURIComponent(query)}`
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error(`Error fetching Twitter sentiment for "${query}":`, error);
    return null;
  }
};
