import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// API Keys from environment - securely stored in Supabase Edge Function secrets
const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
const newsApiKey = Deno.env.get('NEWS_API_KEY');
const yahooFinanceEnabled = true; // Yahoo Finance is free but rate-limited

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

async function fetchComprehensiveMarketData(symbols: string[], accountType: string) {
  // If demo mode, return demo data
  if (accountType === 'demo') {
    const now = Date.now();
    if (!demoDataCache || now - demoDataTimestamp > 30000) {
      demoDataCache = generateDemoData();
      demoDataTimestamp = now;
    }
    return demoDataCache;
  }
  
  // For live mode, try real APIs with comprehensive fallbacks
  const results = {
    stocks: [],
    forex: [],
    crypto: [],
    commodities: [],
    indices: [],
    source: 'mixed'
  };
  
  for (const symbol of symbols) {
    try {
      let data = null;
      
      // 1. Alpha Vantage - Primary for stocks and forex
      if (alphaVantageKey && !data) {
        try {
          if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP')) {
            // Forex
            const response = await fetch(
              `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.slice(0,3)}&to_currency=${symbol.slice(3,6)}&apikey=${alphaVantageKey}`
            );
            const result = await response.json();
            if (result['Realtime Currency Exchange Rate']) {
              const rate = result['Realtime Currency Exchange Rate'];
              data = {
                symbol,
                price: parseFloat(rate['5. Exchange Rate']),
                change: parseFloat(rate['8. Bid Price']) - parseFloat(rate['9. Ask Price']),
                timestamp: Date.now(),
                source: 'Alpha Vantage',
                type: 'forex'
              };
            }
          } else {
            // Stocks
            const response = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
            );
            const result = await response.json();
            if (result['Global Quote']) {
              const quote = result['Global Quote'];
              data = {
                symbol,
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                timestamp: Date.now(),
                source: 'Alpha Vantage',
                type: 'stock'
              };
            }
          }
        } catch (error) {
          console.error(`Alpha Vantage error for ${symbol}:`, error);
        }
      }
      
      // 2. Finnhub - Fallback and crypto specialist
      if (finnhubKey && !data) {
        try {
          let finnhubSymbol = symbol;
          if (symbol === 'BTCUSD') finnhubSymbol = 'BINANCE:BTCUSDT';
          else if (symbol === 'ETHUSD') finnhubSymbol = 'BINANCE:ETHUSDT';
          
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubKey}`
          );
          const result = await response.json();
          if (result.c && result.c > 0) {
            data = {
              symbol,
              price: result.c,
              change: result.d,
              changePercent: result.dp,
              high: result.h,
              low: result.l,
              previousClose: result.pc,
              timestamp: Date.now(),
              source: 'Finnhub',
              type: symbol.includes('BTC') || symbol.includes('ETH') ? 'crypto' : 'stock'
            };
          }
        } catch (error) {
          console.error(`Finnhub error for ${symbol}:`, error);
        }
      }
      
      // 3. Yahoo Finance - Universal fallback
      if (!data && yahooFinanceEnabled) {
        try {
          const yahooSymbol = 
            symbol === 'BTCUSD' ? 'BTC-USD' : 
            symbol === 'ETHUSD' ? 'ETH-USD' :
            symbol === 'EURUSD' ? 'EURUSD=X' :
            symbol === 'GBPUSD' ? 'GBPUSD=X' :
            symbol === 'USDJPY' ? 'USDJPY=X' :
            symbol === 'XAUUSD' ? 'GC=F' :
            symbol === 'USOIL' ? 'CL=F' :
            symbol;
          
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }
          );
          
          const result = await response.json();
          if (result.chart?.result?.[0]) {
            const chart = result.chart.result[0];
            const meta = chart.meta;
            
            data = {
              symbol,
              price: meta.regularMarketPrice || meta.previousClose,
              change: meta.regularMarketPrice - meta.previousClose,
              changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
              high: meta.regularMarketDayHigh,
              low: meta.regularMarketDayLow,
              volume: meta.regularMarketVolume,
              previousClose: meta.previousClose,
              timestamp: Date.now(),
              source: 'Yahoo Finance',
              type: 
                symbol.includes('BTC') || symbol.includes('ETH') ? 'crypto' :
                symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP') ? 'forex' :
                symbol.includes('XAU') || symbol.includes('USO') ? 'commodity' :
                'stock'
            };
          }
        } catch (error) {
          console.error(`Yahoo Finance error for ${symbol}:`, error);
        }
      }
      
      // Store data in appropriate category
      if (data) {
        switch (data.type) {
          case 'stock':
            results.stocks.push(data);
            break;
          case 'forex':
            results.forex.push(data);
            break;
          case 'crypto':
            results.crypto.push(data);
            break;
          case 'commodity':
            results.commodities.push(data);
            break;
          default:
            results.stocks.push(data);
        }
      }
      
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
    }
  }
  
  return results;
}

async function fetchMarketNews(accountType: string, category: string = 'general') {
  if (accountType === 'demo') {
    return generateDemoData().newsData;
  }
  
  // Comprehensive news fetching with fallbacks
  let newsData = [];
  
  // Primary: NewsAPI
  if (newsApiKey) {
    try {
      const queries = {
        general: 'trading OR forex OR cryptocurrency OR bitcoin OR stocks OR market',
        crypto: 'bitcoin OR ethereum OR cryptocurrency OR blockchain OR crypto',
        forex: 'forex OR currency OR USD OR EUR OR GBP OR JPY',
        stocks: 'stocks OR NYSE OR NASDAQ OR earnings OR IPO',
        commodities: 'gold OR oil OR commodities OR futures'
      };
      
      const query = queries[category] || queries.general;
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${newsApiKey}`
      );
      
      if (response.ok) {
        const result = await response.json();
        newsData = result.articles?.map((article: any, index: number) => ({
          id: `news_${index}`,
          title: article.title,
          summary: article.description || article.title,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
          urlToImage: article.urlToImage,
          sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
          instruments: extractInstruments(article.title + ' ' + (article.description || '')),
          category
        })) || [];
      }
    } catch (error) {
      console.error('NewsAPI error:', error);
    }
  }
  
  // Fallback: Alpha Vantage News (if available)
  if (newsData.length === 0 && alphaVantageKey) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${alphaVantageKey}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.feed) {
          newsData = result.feed.slice(0, 10).map((item: any, index: number) => ({
            id: `av_news_${index}`,
            title: item.title,
            summary: item.summary,
            source: item.source,
            publishedAt: item.time_published,
            url: item.url,
            sentiment: parseFloat(item.overall_sentiment_score) || 0,
            instruments: item.ticker_sentiment?.map((t: any) => t.ticker) || [],
            category
          }));
        }
      }
    } catch (error) {
      console.error('Alpha Vantage News error:', error);
    }
  }
  
  // Ultimate fallback: Demo data
  if (newsData.length === 0) {
    newsData = generateDemoData().newsData;
  }
  
  return newsData;
}

function analyzeSentiment(text: string): number {
  // Simple sentiment analysis
  const positiveWords = ['surge', 'rise', 'gain', 'up', 'bull', 'positive', 'growth', 'increase', 'profit'];
  const negativeWords = ['fall', 'drop', 'decline', 'down', 'bear', 'negative', 'loss', 'decrease', 'crash'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.1;
  });
  
  return Math.max(-1, Math.min(1, score));
}

function extractInstruments(text: string): string[] {
  const instruments = [];
  const lowerText = text.toLowerCase();
  
  // Common trading instruments
  const instrumentMap = {
    'bitcoin': 'BTCUSD',
    'btc': 'BTCUSD',
    'ethereum': 'ETHUSD',
    'eth': 'ETHUSD',
    'euro': 'EURUSD',
    'eur': 'EURUSD',
    'pound': 'GBPUSD',
    'gbp': 'GBPUSD',
    'yen': 'USDJPY',
    'jpy': 'USDJPY',
    'gold': 'XAUUSD',
    'oil': 'USOIL',
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'tesla': 'TSLA'
  };
  
  Object.entries(instrumentMap).forEach(([keyword, symbol]) => {
    if (lowerText.includes(keyword)) {
      instruments.push(symbol);
    }
  });
  
  return [...new Set(instruments)]; // Remove duplicates
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbolsParam = url.searchParams.get('symbols') || 'BTCUSD,ETHUSD,EURUSD,GBPUSD,XAUUSD';
    const symbols = symbolsParam.split(',');
    const accountType = url.searchParams.get('accountType') || 'demo';
    const dataType = url.searchParams.get('type') || 'all'; // 'price', 'news', 'all', 'timeframe'
    const timeframe = url.searchParams.get('timeframe') || '1D'; // 1D, 1W, 1M, 1Y
    const newsCategory = url.searchParams.get('newsCategory') || 'general';
    
    let response: any = {
      success: true,
      timestamp: Date.now(),
      accountType,
      apis_status: {
        alpha_vantage: !!alphaVantageKey,
        finnhub: !!finnhubKey,
        news_api: !!newsApiKey,
        yahoo_finance: yahooFinanceEnabled
      }
    };
    
    // Fetch market data for multiple symbols
    if (dataType === 'all' || dataType === 'price') {
      const marketData = await fetchComprehensiveMarketData(symbols, accountType);
      response.marketData = marketData;
      
      // Add time-series data for charts
      if (dataType === 'all' || dataType === 'timeframe') {
        response.timeSeriesData = await fetchTimeSeriesData(symbols[0], timeframe, accountType);
      }
    }
    
    // Fetch news data
    if (dataType === 'all' || dataType === 'news') {
      const newsData = await fetchMarketNews(accountType, newsCategory);
      response.newsData = newsData;
    }
    
    // Add technical indicators for primary symbol
    if (response.marketData && symbols.length > 0) {
      response.technicalAnalysis = await generateTechnicalAnalysis(symbols[0], response.marketData);
    }
    
    // Add market summary
    response.marketSummary = generateMarketSummary(response.marketData);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Error in market-data function:", error);
    
    // Return comprehensive fallback data
    const fallbackData = generateDemoData();
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API error - using demo data',
        marketData: {
          stocks: [],
          forex: fallbackData.forexData,
          crypto: fallbackData.cryptoData,
          commodities: fallbackData.commodityData,
          source: 'demo'
        },
        newsData: fallbackData.newsData,
        accountType: 'demo',
        timestamp: Date.now(),
        apis_status: {
          alpha_vantage: false,
          finnhub: false,
          news_api: false,
          yahoo_finance: false
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

async function fetchTimeSeriesData(symbol: string, timeframe: string, accountType: string) {
  if (accountType === 'demo') {
    return generateDemoTimeSeriesData(symbol, timeframe);
  }
  
  // Try Alpha Vantage for real time-series data
  if (alphaVantageKey) {
    try {
      const functionMap = {
        '1D': 'TIME_SERIES_INTRADAY',
        '1W': 'TIME_SERIES_DAILY',
        '1M': 'TIME_SERIES_DAILY',
        '1Y': 'TIME_SERIES_WEEKLY'
      };
      
      const interval = timeframe === '1D' ? '&interval=15min' : '';
      const func = functionMap[timeframe] || 'TIME_SERIES_DAILY';
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}${interval}&apikey=${alphaVantageKey}`
      );
      
      const result = await response.json();
      // Process Alpha Vantage time series data
      // Implementation would depend on the specific data structure returned
      
    } catch (error) {
      console.error('Alpha Vantage time series error:', error);
    }
  }
  
  // Fallback to demo data
  return generateDemoTimeSeriesData(symbol, timeframe);
}

function generateDemoTimeSeriesData(symbol: string, timeframe: string) {
  const basePrice = 42000; // Base price for demo
  const dataPoints = timeframe === '1D' ? 96 : timeframe === '1W' ? 168 : 720; // Different intervals
  const interval = timeframe === '1D' ? 15 : timeframe === '1W' ? 1 : 1; // minutes or hours
  
  const data = [];
  const now = Date.now();
  
  for (let i = dataPoints; i >= 0; i--) {
    const timestamp = now - (i * interval * 60 * 1000);
    const randomChange = (Math.random() - 0.5) * 0.02; // 2% max change
    const price = basePrice * (1 + randomChange);
    
    data.push({
      timestamp,
      open: price * 0.999,
      high: price * 1.001,
      low: price * 0.998,
      close: price,
      volume: Math.floor(Math.random() * 1000000 + 100000)
    });
  }
  
  return {
    symbol,
    timeframe,
    data
  };
}

async function generateTechnicalAnalysis(symbol: string, marketData: any) {
  // Find the price for the symbol
  let price = 42000; // Default
  
  if (marketData?.crypto?.length > 0) {
    const cryptoData = marketData.crypto.find((item: any) => item.symbol === symbol);
    if (cryptoData) price = cryptoData.price;
  } else if (marketData?.forex?.length > 0) {
    const forexData = marketData.forex.find((item: any) => item.symbol === symbol);
    if (forexData) price = forexData.price;
  }
  
  return {
    symbol,
    indicators: {
      rsi: 30 + Math.random() * 40, // 30-70 range
      macd: (Math.random() - 0.5) * (symbol.includes('BTC') ? 200 : 2),
      macdSignal: (Math.random() - 0.5) * (symbol.includes('BTC') ? 180 : 1.8),
      macdHistogram: (Math.random() - 0.5) * (symbol.includes('BTC') ? 50 : 0.5),
      ema12: price * (1 - Math.random() * 0.01),
      ema26: price * (1 - Math.random() * 0.02),
      sma50: price * (1 - Math.random() * 0.03),
      sma200: price * (1 - Math.random() * 0.05),
      bollingerUpper: price * (1 + Math.random() * 0.02),
      bollingerMiddle: price,
      bollingerLower: price * (1 - Math.random() * 0.02),
      stochK: Math.random() * 100,
      stochD: Math.random() * 100,
      atr: price * (Math.random() * 0.02),
      obv: Math.random() * 1000000
    },
    signals: {
      trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
      strength: Math.random(),
      recommendation: Math.random() > 0.5 ? 'buy' : Math.random() > 0.5 ? 'sell' : 'hold'
    }
  };
}

function generateMarketSummary(marketData: any) {
  if (!marketData) return null;
  
  const summary = {
    totalInstruments: 0,
    gainers: 0,
    losers: 0,
    unchanged: 0,
    totalVolume: 0,
    marketCap: 0,
    fearGreedIndex: Math.floor(Math.random() * 100),
    volatilityIndex: Math.random() * 100
  };
  
  // Process all market data types
  ['stocks', 'forex', 'crypto', 'commodities'].forEach(type => {
    if (marketData[type] && Array.isArray(marketData[type])) {
      marketData[type].forEach((item: any) => {
        summary.totalInstruments++;
        if (item.change > 0) summary.gainers++;
        else if (item.change < 0) summary.losers++;
        else summary.unchanged++;
        
        if (item.volume) summary.totalVolume += item.volume;
        if (item.marketCap) summary.marketCap += item.marketCap;
      });
    }
  });
  
  return summary;
});