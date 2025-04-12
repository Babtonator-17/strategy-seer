
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

// Function to generate realistic market news with current timestamp
async function fetchMarketNews(symbol?: string) {
  console.log(`Fetching market news for symbol: ${symbol || 'all'}`);
  
  // Use current date for timestamps
  const now = new Date();
  
  // Create news with more realistic and current content
  const mockNews = [
    {
      title: 'Bitcoin Surges Past $67,000 as Institutional Interest Grows',
      summary: 'Bitcoin has surged past $67,000 as institutional investors continue to show interest in cryptocurrency as an inflation hedge.',
      url: 'https://example.com/news/1',
      source: 'Crypto Finance News',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      sentiment: 0.75,
      instruments: ['BTCUSD', 'CRYPTO']
    },
    {
      title: 'EUR/USD Falls After ECB Comments on Interest Rate Outlook',
      summary: 'The EUR/USD pair fell after ECB officials signaled a cautious approach to future rate hikes, contrasting with the Fed\'s hawkish stance.',
      url: 'https://example.com/news/2',
      source: 'FX Daily',
      timestamp: new Date(now.getTime() - 90 * 60000).toISOString(), // 90 minutes ago
      sentiment: -0.3,
      instruments: ['EURUSD', 'FOREX']
    },
    {
      title: 'Gold Rises on Geopolitical Tensions and Inflation Concerns',
      summary: 'Gold prices have risen due to ongoing geopolitical tensions and concerns about persistent inflation in major economies.',
      url: 'https://example.com/news/3',
      source: 'Commodities Insight',
      timestamp: new Date(now.getTime() - 120 * 60000).toISOString(), // 2 hours ago
      sentiment: 0.5,
      instruments: ['XAUUSD', 'GOLD', 'COMMODITIES']
    },
    {
      title: 'Oil Prices Stabilize After Recent Volatility',
      summary: 'Crude oil prices have stabilized following a period of significant volatility, as traders assess supply constraints and demand forecasts.',
      url: 'https://example.com/news/4',
      source: 'Energy Markets Today',
      timestamp: new Date(now.getTime() - 180 * 60000).toISOString(), // 3 hours ago
      sentiment: 0.1,
      instruments: ['USOIL', 'OIL', 'COMMODITIES']
    },
    {
      title: 'Ethereum Crosses $3,400 Ahead of Network Upgrade',
      summary: 'Ethereum has crossed the $3,400 mark as traders anticipate the upcoming network upgrade that promises improved scalability and lower fees.',
      url: 'https://example.com/news/5',
      source: 'Blockchain Times',
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago
      sentiment: 0.8,
      instruments: ['ETHUSD', 'CRYPTO']
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

// Generate realistic technical analysis with random variations
async function fetchTechnicalAnalysis(symbol: string, interval: string = 'daily') {
  console.log(`Fetching technical analysis for ${symbol} with interval ${interval}`);
  
  // Base prices for different symbols
  const basePrices: Record<string, number> = {
    'BTCUSD': 67500,
    'ETHUSD': 3450,
    'EURUSD': 1.08,
    'GBPUSD': 1.26,
    'USDJPY': 151.5,
    'XAUUSD': 2320,
    'USOIL': 82.35
  };
  
  // Default to Bitcoin if symbol not found
  const basePrice = basePrices[symbol] || 67500;
  
  // Add some randomness to make values look realistic and changing
  const randomFactor = 0.01; // 1% variation
  const randomMultiplier = 1 + (Math.random() * 2 - 1) * randomFactor;
  const price = basePrice * randomMultiplier;
  
  return {
    symbol,
    interval,
    price: price,
    sma: price * (1 - Math.random() * 0.005),
    ema: price * (1 - Math.random() * 0.003),
    rsi: 30 + Math.random() * 40, // 30-70 range
    macd: (Math.random() * 200 - 100) * (symbol === 'BTCUSD' ? 5 : 0.1),
    macdSignal: (Math.random() * 200 - 100) * (symbol === 'BTCUSD' ? 4.5 : 0.09),
    macdHist: (Math.random() * 50 - 25) * (symbol === 'BTCUSD' ? 0.5 : 0.01),
    bbUpper: price * (1 + Math.random() * 0.02),
    bbMiddle: price,
    bbLower: price * (1 - Math.random() * 0.02),
    lastUpdated: new Date().toISOString()
  };
}

// Generate crypto market data with realistic prices and variations
async function fetchCryptoMarket(coins?: string | string[]) {
  // Normalize input to a string or undefined
  const coinsString = typeof coins === 'string' 
    ? coins 
    : Array.isArray(coins) 
      ? coins.join(',') 
      : undefined;
      
  console.log(`Fetching crypto market data for coins: ${coinsString || 'top'}`);
  
  // Base data with current realistic prices
  const mockCryptoData = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      image: 'https://example.com/bitcoin.png',
      current_price: 67500 + Math.random() * 1000 - 500, // Small random variation
      market_cap: 1310500000000,
      market_cap_rank: 1,
      price_change_percentage_24h: Math.random() * 8 - 4, // -4% to +4%
      price_change_percentage_7d_in_currency: Math.random() * 12 - 6 // -6% to +6%
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://example.com/ethereum.png',
      current_price: 3450 + Math.random() * 100 - 50,
      market_cap: 425000000000,
      market_cap_rank: 2,
      price_change_percentage_24h: Math.random() * 10 - 5,
      price_change_percentage_7d_in_currency: Math.random() * 15 - 7.5
    },
    {
      id: 'ripple',
      symbol: 'XRP',
      name: 'Ripple',
      image: 'https://example.com/ripple.png',
      current_price: 0.52 + Math.random() * 0.04 - 0.02,
      market_cap: 32500000000,
      market_cap_rank: 5,
      price_change_percentage_24h: Math.random() * 12 - 6,
      price_change_percentage_7d_in_currency: Math.random() * 18 - 9
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      image: 'https://example.com/solana.png',
      current_price: 142.25 + Math.random() * 8 - 4,
      market_cap: 63500000000,
      market_cap_rank: 4,
      price_change_percentage_24h: Math.random() * 14 - 7,
      price_change_percentage_7d_in_currency: Math.random() * 20 - 10
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      image: 'https://example.com/cardano.png',
      current_price: 0.48 + Math.random() * 0.04 - 0.02,
      market_cap: 17200000000,
      market_cap_rank: 8,
      price_change_percentage_24h: Math.random() * 10 - 5,
      price_change_percentage_7d_in_currency: Math.random() * 16 - 8
    }
  ];
  
  if (coinsString) {
    // Handle both string and array formats
    const coinList = coinsString.toLowerCase().split(',');
    return mockCryptoData.filter(crypto => 
      coinList.includes(crypto.id) || coinList.includes(crypto.symbol.toLowerCase())
    );
  }
  
  return mockCryptoData;
}

// Generate commodity prices with current realistic values
async function fetchCommodityPrices() {
  console.log('Fetching commodity prices');
  
  // Use current timestamp
  const now = new Date().toISOString();
  
  // Add small random variations to prices
  const variationFactor = 0.01; // 1% variation
  
  return [
    {
      symbol: 'XAUUSD',
      name: 'Gold',
      price: 2320 * (1 + (Math.random() * 2 - 1) * variationFactor),
      unit: 'USD/oz',
      timestamp: now
    },
    {
      symbol: 'XAGUSD',
      name: 'Silver',
      price: 27.65 * (1 + (Math.random() * 2 - 1) * variationFactor),
      unit: 'USD/oz',
      timestamp: now
    },
    {
      symbol: 'USOIL',
      name: 'Crude Oil',
      price: 82.25 * (1 + (Math.random() * 2 - 1) * variationFactor),
      unit: 'USD/barrel',
      timestamp: now
    },
    {
      symbol: 'NATGAS',
      name: 'Natural Gas',
      price: 1.75 * (1 + (Math.random() * 2 - 1) * variationFactor),
      unit: 'USD/MMBtu',
      timestamp: now
    },
    {
      symbol: 'COPPER',
      name: 'Copper',
      price: 4.15 * (1 + (Math.random() * 2 - 1) * variationFactor),
      unit: 'USD/lb',
      timestamp: now
    }
  ];
}

// Generate stock quote data with realistic prices
async function fetchStockQuote(symbol: string) {
  console.log(`Fetching stock quote for ${symbol}`);
  
  // Base prices for different symbols
  const basePrices: Record<string, number> = {
    'AAPL': 176.50,
    'MSFT': 415.20,
    'AMZN': 182.30,
    'GOOGL': 152.75,
    'META': 485.60,
    'TSLA': 172.40,
    'NVDA': 905.80
  };
  
  // Default to Apple if symbol not found
  const basePrice = basePrices[symbol] || 176.50;
  
  // Add some randomness
  const randomFactor = 0.01; // 1% variation
  const price = basePrice * (1 + (Math.random() * 2 - 1) * randomFactor);
  const changePercent = (Math.random() * 6) - 3; // -3% to +3%
  const change = (price * changePercent) / 100;
  
  return {
    symbol,
    price,
    change,
    changePercent,
    volume: Math.floor(2000000 + Math.random() * 8000000),
    marketCap: price * (symbol === 'AAPL' ? 2700000000 : 1000000000),
    peRatio: 18 + Math.random() * 20,
    timestamp: new Date().toISOString()
  };
}

// Generate batch quotes data with realistic variations
async function fetchBatchQuotes(symbols: string[]) {
  console.log(`Fetching batch quotes for symbols: ${symbols.join(', ')}`);
  
  return symbols.map(symbol => {
    // Base prices for different types of symbols
    let basePrice = 100;
    if (symbol.includes('BTC') || symbol.includes('XBT')) basePrice = 67500;
    else if (symbol.includes('ETH')) basePrice = 3450;
    else if (symbol.includes('EUR')) basePrice = 1.08;
    else if (symbol.includes('GBP')) basePrice = 1.26;
    else if (symbol.includes('JPY')) basePrice = 151.5;
    else if (symbol.includes('XAU') || symbol.includes('GOLD')) basePrice = 2320;
    else if (symbol.includes('OIL')) basePrice = 82.35;
    
    // Add randomness
    const randomFactor = 0.01; // 1% variation
    const price = basePrice * (1 + (Math.random() * 2 - 1) * randomFactor);
    const changePercent = (Math.random() * 6) - 3; // -3% to +3%
    const change = (price * changePercent) / 100;
    
    return {
      symbol,
      price,
      change,
      changePercent,
      volume: Math.floor(100000 + Math.random() * 1000000),
      timestamp: new Date().toISOString()
    };
  });
}

// Generate Twitter sentiment data with realistic values
async function fetchTwitterSentiment(query: string) {
  console.log(`Fetching Twitter sentiment for query: ${query}`);
  
  const sentimentValue = Math.random() * 2 - 1; // Range from -1 to 1
  const postCount = Math.floor(2000 + Math.random() * 8000);
  const positivePercent = 40 + Math.random() * 30; // 40-70%
  const negativePercent = 100 - positivePercent - Math.random() * 10; // Remaining minus some neutral
  const neutralPercent = 100 - positivePercent - negativePercent;
  
  const positiveCount = Math.floor(postCount * (positivePercent / 100));
  const negativeCount = Math.floor(postCount * (negativePercent / 100));
  const neutralCount = postCount - positiveCount - negativeCount;
  
  // Generate trending hashtags related to the query
  const generateHashtags = (q: string) => {
    const baseHashtags = ['#trading', '#crypto', '#forex', '#stocks', '#investment'];
    if (q.toLowerCase().includes('btc') || q.toLowerCase().includes('bitcoin')) {
      return ['#bitcoin', '#btc', '#crypto', '#hodl', '#cryptocurrency'];
    } else if (q.toLowerCase().includes('eth') || q.toLowerCase().includes('ethereum')) {
      return ['#ethereum', '#eth', '#defi', '#altcoin', '#blockchain'];
    } else if (q.toLowerCase().includes('forex') || q.toLowerCase().includes('eur') || q.toLowerCase().includes('usd')) {
      return ['#forex', '#trading', '#eurusd', '#forextrading', '#forexsignals'];
    } else {
      return baseHashtags;
    }
  };
  
  return {
    query,
    sentiment: sentimentValue,
    postCount,
    positiveCount,
    negativeCount,
    neutralCount,
    topHashtags: generateHashtags(query),
    topMentions: ['@trader', '@investor', '@analyst', '@market', '@financialnews'],
    timestamp: new Date().toISOString()
  };
}
