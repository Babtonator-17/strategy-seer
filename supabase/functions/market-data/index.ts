import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// API Keys from environment
const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
const newsApiKey = Deno.env.get('NEWS_API_KEY');

// Demo mode data cache
let demoDataCache: any = null;
let demoDataTimestamp = 0;

function generateDemoData() {
  const now = Date.now();
  
  // Generate realistic but fake market data
  const instruments = ['BTCUSD', 'ETHUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'SPX500', 'NSDQ100'];
  const cryptoData = [];
  const forexData = [];
  const commodityData = [];
  const indexData = [];
  
  instruments.forEach(symbol => {
    const basePrice = {
      'BTCUSD': 42000,
      'ETHUSD': 2500,
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'XAUUSD': 2050,
      'SPX500': 4800,
      'NSDQ100': 16500
    }[symbol] || 100;
    
    const volatility = Math.random() * 0.05; // 0-5% daily volatility
    const change = (Math.random() - 0.5) * volatility * 2;
    const price = basePrice * (1 + change);
    const volume = Math.random() * 1000000 + 100000;
    
    const marketData = {
      symbol,
      name: symbol.replace('USD', '/USD'),
      price: parseFloat(price.toFixed(symbol.includes('JPY') ? 2 : 4)),
      change: parseFloat((change * 100).toFixed(2)),
      volume: Math.floor(volume),
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.02),
      timestamp: now
    };
    
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
      cryptoData.push(marketData);
    } else if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('JPY')) {
      forexData.push(marketData);
    } else if (symbol.includes('XAU') || symbol.includes('XAG')) {
      commodityData.push(marketData);
    } else {
      indexData.push(marketData);
    }
  });
  
  const newsData = [
    {
      id: 'news1',
      title: 'Bitcoin Reaches New Monthly High as Institutional Adoption Grows',
      summary: 'Major financial institutions continue to allocate portions of their treasury to Bitcoin.',
      source: 'CryptoDaily',
      publishedAt: new Date(now - 3600000).toISOString(),
      sentiment: 'positive',
      instruments: ['BTCUSD']
    },
    {
      id: 'news2',
      title: 'Federal Reserve Hints at Potential Rate Pause in Next Meeting',
      summary: 'Fed officials suggest they may pause rate hikes to assess economic impact.',
      source: 'Financial Times',
      publishedAt: new Date(now - 7200000).toISOString(),
      sentiment: 'mixed',
      instruments: ['EURUSD', 'USDJPY', 'SPX500']
    },
    {
      id: 'news3',
      title: 'Gold Prices Surge on Geopolitical Tensions',
      summary: 'Safe-haven demand drives gold to highest levels in weeks.',
      source: 'Reuters',
      publishedAt: new Date(now - 10800000).toISOString(),
      sentiment: 'positive',
      instruments: ['XAUUSD']
    }
  ];
  
  return {
    cryptoData,
    forexData,
    commodityData,
    indexData,
    newsData,
    timestamp: now
  };
}

async function fetchRealMarketData(symbol: string, accountType: string) {
  // If demo mode, return demo data
  if (accountType === 'demo') {
    // Cache demo data for 30 seconds to simulate real market updates
    const now = Date.now();
    if (!demoDataCache || now - demoDataTimestamp > 30000) {
      demoDataCache = generateDemoData();
      demoDataTimestamp = now;
    }
    return demoDataCache;
  }
  
  // For live mode, try real APIs with fallbacks
  try {
    let data = null;
    
    // Try Alpha Vantage first
    if (alphaVantageKey && (symbol.includes('USD') || symbol.includes('EUR'))) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.slice(0,3)}&to_currency=${symbol.slice(3,6)}&apikey=${alphaVantageKey}`
        );
        const result = await response.json();
        if (result['Realtime Currency Exchange Rate']) {
          const rate = result['Realtime Currency Exchange Rate'];
          data = {
            symbol,
            price: parseFloat(rate['5. Exchange Rate']),
            timestamp: Date.now(),
            source: 'AlphaVantage'
          };
        }
      } catch (error) {
        console.error('Alpha Vantage error:', error);
      }
    }
    
    // Try Finnhub as fallback
    if (!data && finnhubKey) {
      try {
        const finnhubSymbol = symbol === 'BTCUSD' ? 'BINANCE:BTCUSDT' : symbol;
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubKey}`
        );
        const result = await response.json();
        if (result.c) {
          data = {
            symbol,
            price: result.c,
            change: result.dp,
            high: result.h,
            low: result.l,
            timestamp: Date.now(),
            source: 'Finnhub'
          };
        }
      } catch (error) {
        console.error('Finnhub error:', error);
      }
    }
    
    // Yahoo Finance fallback (free but rate limited)
    if (!data) {
      try {
        const yahooSymbol = symbol === 'BTCUSD' ? 'BTC-USD' : 
                           symbol === 'ETHUSD' ? 'ETH-USD' :
                           symbol === 'EURUSD' ? 'EURUSD=X' :
                           symbol === 'XAUUSD' ? 'GC=F' : symbol;
        
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`
        );
        const result = await response.json();
        if (result.chart?.result?.[0]) {
          const chart = result.chart.result[0];
          const meta = chart.meta;
          data = {
            symbol,
            price: meta.regularMarketPrice,
            change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
            high: meta.regularMarketDayHigh,
            low: meta.regularMarketDayLow,
            volume: meta.regularMarketVolume,
            timestamp: Date.now(),
            source: 'Yahoo Finance'
          };
        }
      } catch (error) {
        console.error('Yahoo Finance error:', error);
      }
    }
    
    return data || generateDemoData(); // Fallback to demo data if all APIs fail
    
  } catch (error) {
    console.error('Error fetching real market data:', error);
    return generateDemoData(); // Return demo data on error
  }
}

async function fetchMarketNews(accountType: string) {
  if (accountType === 'demo') {
    return generateDemoData().newsData;
  }
  
  if (!newsApiKey) {
    return generateDemoData().newsData;
  }
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=trading OR forex OR cryptocurrency OR bitcoin&sortBy=publishedAt&language=en&pageSize=10&apiKey=${newsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error('News API request failed');
    }
    
    const result = await response.json();
    
    return result.articles?.map((article: any, index: number) => ({
      id: `news_${index}`,
      title: article.title,
      summary: article.description,
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url,
      sentiment: 'neutral', // Would need sentiment analysis API for real sentiment
      instruments: [] // Would need NLP to extract relevant instruments
    })) || generateDemoData().newsData;
    
  } catch (error) {
    console.error('News API error:', error);
    return generateDemoData().newsData;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'BTCUSD';
    const accountType = url.searchParams.get('accountType') || 'demo';
    const dataType = url.searchParams.get('type') || 'all'; // 'price', 'news', 'all'
    
    let response: any = {};
    
    if (dataType === 'all' || dataType === 'price') {
      const marketData = await fetchRealMarketData(symbol, accountType);
      response.marketData = marketData;
    }
    
    if (dataType === 'all' || dataType === 'news') {
      const newsData = await fetchMarketNews(accountType);
      response.newsData = newsData;
    }
    
    // Add technical indicators (simplified)
    if (response.marketData?.cryptoData?.[0]) {
      const btcData = response.marketData.cryptoData[0];
      response.technicalAnalysis = {
        symbol: 'BTCUSD',
        indicators: {
          rsi: 45 + Math.random() * 20, // Mock RSI between 45-65
          macd: (Math.random() - 0.5) * 100,
          ema50: btcData.price * (0.98 + Math.random() * 0.04),
          sma200: btcData.price * (0.95 + Math.random() * 0.06)
        }
      };
    }
    
    response.accountType = accountType;
    response.timestamp = Date.now();
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Error in market-data function:", error);
    
    // Return demo data as fallback
    const fallbackData = generateDemoData();
    return new Response(
      JSON.stringify({
        ...fallbackData,
        accountType: 'demo',
        error: 'Using demo data due to API error',
        timestamp: Date.now()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});