import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { action, symbol, interval, coins, query, symbols } = requestBody;
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let responseData = null;
    
    // Handle different actions
    switch (action) {
      case 'market-news':
        responseData = await fetchMarketNews(symbol);
        break;
      case 'technical-analysis':
        responseData = await fetchTechnicalAnalysis(symbol, interval);
        break;
      case 'crypto-market':
        responseData = await fetchCryptoMarket(coins);
        break;
      case 'commodity-prices':
        responseData = await fetchCommodityPrices();
        break;
      case 'stock-quote':
        responseData = await fetchStockQuote(symbol);
        break;
      case 'batch-quotes':
        responseData = await fetchBatchQuotes(symbols);
        break;
      case 'twitter-sentiment':
        responseData = await fetchTwitterSentiment(query);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in trading-apis function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Mock implementation of market news API
async function fetchMarketNews(symbol?: string) {
  // In a real implementation, this would fetch from an actual API
  console.log(`Fetching market news for symbol: ${symbol || 'all'}`);
  
  const mockNews = [
    {
      title: 'Bitcoin Surges Past $40,000 as Institutional Interest Grows',
      summary: 'Bitcoin has surged past $40,000 as institutional investors continue to show interest in cryptocurrency as an inflation hedge.',
      url: 'https://example.com/news/1',
      source: 'Crypto Finance News',
      timestamp: new Date().toISOString(),
      sentiment: 0.75,
      instruments: ['BTCUSD', 'CRYPTO']
    },
    {
      title: 'EUR/USD Falls After ECB Comments on Interest Rate Outlook',
      summary: 'The EUR/USD pair fell after ECB officials signaled a cautious approach to future rate hikes, contrasting with the Fed\'s hawkish stance.',
      url: 'https://example.com/news/2',
      source: 'FX Daily',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      sentiment: -0.3,
      instruments: ['EURUSD', 'FOREX']
    },
    {
      title: 'Gold Rises on Geopolitical Tensions and Inflation Concerns',
      summary: 'Gold prices have risen due to ongoing geopolitical tensions and concerns about persistent inflation in major economies.',
      url: 'https://example.com/news/3',
      source: 'Commodities Insight',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      sentiment: 0.5,
      instruments: ['XAUUSD', 'GOLD', 'COMMODITIES']
    },
    {
      title: 'Oil Prices Stabilize After Recent Volatility',
      summary: 'Crude oil prices have stabilized following a period of significant volatility, as traders assess supply constraints and demand forecasts.',
      url: 'https://example.com/news/4',
      source: 'Energy Markets Today',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      sentiment: 0.1,
      instruments: ['USOIL', 'OIL', 'COMMODITIES']
    },
  ];
  
  if (symbol) {
    return mockNews.filter(news => 
      news.instruments.some(instrument => 
        instrument.toUpperCase() === symbol.toUpperCase()
      )
    );
  }
  
  return mockNews;
}

// Mock implementation of technical analysis API
async function fetchTechnicalAnalysis(symbol: string, interval: string = 'daily') {
  console.log(`Fetching technical analysis for ${symbol} with interval ${interval}`);
  
  return {
    symbol,
    interval,
    sma: 36750.50,
    ema: 36800.25,
    rsi: 58.5,
    macd: 125.5,
    macdSignal: 100.25,
    macdHist: 25.25,
    bbUpper: 37500.75,
    bbMiddle: 36750.50,
    bbLower: 36000.25,
    lastUpdated: new Date().toISOString()
  };
}

// Mock implementation of crypto market API
// Updated to handle both string and array input for coins
async function fetchCryptoMarket(coins?: string | string[]) {
  console.log(`Fetching crypto market data for coins: ${coins || 'top'}`);
  
  const mockCryptoData = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      image: 'https://example.com/bitcoin.png',
      current_price: 36500.75,
      market_cap: 710500000000,
      market_cap_rank: 1,
      price_change_percentage_24h: 2.5,
      price_change_percentage_7d_in_currency: 5.2
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://example.com/ethereum.png',
      current_price: 2365.50,
      market_cap: 280500000000,
      market_cap_rank: 2,
      price_change_percentage_24h: 1.8,
      price_change_percentage_7d_in_currency: 3.5
    },
    {
      id: 'ripple',
      symbol: 'XRP',
      name: 'Ripple',
      image: 'https://example.com/ripple.png',
      current_price: 0.58,
      market_cap: 32500000000,
      market_cap_rank: 5,
      price_change_percentage_24h: -0.8,
      price_change_percentage_7d_in_currency: 1.2
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      image: 'https://example.com/solana.png',
      current_price: 112.25,
      market_cap: 48500000000,
      market_cap_rank: 4,
      price_change_percentage_24h: 3.2,
      price_change_percentage_7d_in_currency: 8.7
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      image: 'https://example.com/cardano.png',
      current_price: 0.48,
      market_cap: 17200000000,
      market_cap_rank: 8,
      price_change_percentage_24h: 0.5,
      price_change_percentage_7d_in_currency: -1.2
    }
  ];
  
  if (coins) {
    // Handle both string and array formats
    const coinList = typeof coins === 'string' ? coins.toLowerCase().split(',') : coins.map(c => c.toLowerCase());
    return mockCryptoData.filter(crypto => 
      coinList.includes(crypto.id) || coinList.includes(crypto.symbol.toLowerCase())
    );
  }
  
  return mockCryptoData;
}

// Mock implementation of commodity prices API
async function fetchCommodityPrices() {
  console.log('Fetching commodity prices');
  
  return [
    {
      symbol: 'XAUUSD',
      name: 'Gold',
      price: 1982.30,
      unit: 'USD/oz',
      timestamp: new Date().toISOString()
    },
    {
      symbol: 'XAGUSD',
      name: 'Silver',
      price: 23.65,
      unit: 'USD/oz',
      timestamp: new Date().toISOString()
    },
    {
      symbol: 'USOIL',
      name: 'Crude Oil',
      price: 78.25,
      unit: 'USD/barrel',
      timestamp: new Date().toISOString()
    },
    {
      symbol: 'NATGAS',
      name: 'Natural Gas',
      price: 2.42,
      unit: 'USD/MMBtu',
      timestamp: new Date().toISOString()
    },
    {
      symbol: 'COPPER',
      name: 'Copper',
      price: 3.85,
      unit: 'USD/lb',
      timestamp: new Date().toISOString()
    }
  ];
}

// Mock implementation of stock quote API
async function fetchStockQuote(symbol: string) {
  console.log(`Fetching stock quote for ${symbol}`);
  
  return {
    symbol,
    price: 150.75,
    change: 2.5,
    changePercent: 1.68,
    volume: 25000000,
    marketCap: 2500000000000,
    peRatio: 28.5,
    timestamp: new Date().toISOString()
  };
}

// Mock implementation of batch quotes API
async function fetchBatchQuotes(symbols: string[]) {
  console.log(`Fetching batch quotes for symbols: ${symbols.join(', ')}`);
  
  return symbols.map(symbol => ({
    symbol,
    price: 100 + Math.random() * 200,
    change: (Math.random() * 10) - 5,
    changePercent: (Math.random() * 5) - 2.5,
    volume: Math.floor(Math.random() * 50000000),
    timestamp: new Date().toISOString()
  }));
}

// Mock implementation of Twitter sentiment API
async function fetchTwitterSentiment(query: string) {
  console.log(`Fetching Twitter sentiment for query: ${query}`);
  
  return {
    query,
    sentiment: Math.random() * 2 - 1, // Range from -1 to 1
    postCount: Math.floor(Math.random() * 10000),
    positiveCount: Math.floor(Math.random() * 5000),
    negativeCount: Math.floor(Math.random() * 5000),
    neutralCount: Math.floor(Math.random() * 5000),
    topHashtags: ['#trading', '#crypto', '#forex', '#stocks'],
    topMentions: ['@trader', '@investor', '@analyst', '@market'],
    timestamp: new Date().toISOString()
  };
}
