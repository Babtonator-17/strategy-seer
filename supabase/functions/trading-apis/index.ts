
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Keys from Supabase Secrets
const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY') || 'demo';
const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY') || '';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const TWITTER_API_BEARER = Deno.env.get('TWITTER_API_BEARER') || '';
const FMP_API_KEY = Deno.env.get('FMP_API_KEY') || '';

// Alpha Vantage API for stock data and technical indicators
async function fetchAlphaVantageData(endpoint: string, params: Record<string, string>) {
  const queryParams = new URLSearchParams({
    ...params,
    apikey: ALPHA_VANTAGE_API_KEY,
  });
  
  const url = `https://www.alphavantage.co/${endpoint}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`AlphaVantage API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching AlphaVantage data:', error);
    throw error;
  }
}

// Financial Modeling Prep API for fundamental data
async function fetchFMPData(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    ...params,
    apikey: FMP_API_KEY,
  });
  
  const url = `https://financialmodelingprep.com/api/v3/${endpoint}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching FMP data:', error);
    throw error;
  }
}

// CoinGecko API for cryptocurrency data
async function fetchCoinGeckoData(endpoint: string) {
  const url = `${COINGECKO_API_URL}/${endpoint}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    throw error;
  }
}

// Twitter API for sentiment analysis
async function fetchTwitterSentiment(query: string) {
  if (!TWITTER_API_BEARER) {
    return { error: "Twitter API key not configured" };
  }
  
  try {
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TWITTER_API_BEARER}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    throw error;
  }
}

// Finnhub API for real-time market data
async function fetchFinnhubData(endpoint: string, params: Record<string, string> = {}) {
  if (!FINNHUB_API_KEY) {
    return { error: "Finnhub API key not configured" };
  }
  
  const queryParams = new URLSearchParams(params);
  const url = `https://finnhub.io/api/v1/${endpoint}?${queryParams}&token=${FINNHUB_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Finnhub data:', error);
    throw error;
  }
}

// Market news aggregation from multiple sources
async function getAggregatedMarketNews(symbol: string = '') {
  try {
    // Get news from multiple sources for redundancy
    const [alphavantageNews, finnhubNews, fmpNews] = await Promise.allSettled([
      // Alpha Vantage News
      symbol ? 
        fetchAlphaVantageData('query', { function: 'NEWS_SENTIMENT', tickers: symbol }) :
        fetchAlphaVantageData('query', { function: 'NEWS_SENTIMENT' }),
      
      // Finnhub News
      FINNHUB_API_KEY ? 
        fetchFinnhubData('company-news', symbol ? { symbol } : {}) :
        Promise.reject('No Finnhub API key'),
      
      // FMP News
      FMP_API_KEY ?
        fetchFMPData(symbol ? `stock_news?tickers=${symbol}` : 'stock_news?limit=50') :
        Promise.reject('No FMP API key')
    ]);
    
    // Process and normalize data from different sources
    const allNews = [];
    
    // Add Alpha Vantage news if available
    if (alphavantageNews.status === 'fulfilled' && alphavantageNews.value.feed) {
      const avNews = alphavantageNews.value.feed.map((item: any) => ({
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: item.source,
        timestamp: item.time_published,
        sentiment: item.overall_sentiment,
        instruments: item.ticker_sentiment?.map((t: any) => t.ticker) || []
      }));
      allNews.push(...avNews);
    }
    
    // Add Finnhub news if available
    if (finnhubNews.status === 'fulfilled' && Array.isArray(finnhubNews.value)) {
      const fhNews = finnhubNews.value.map((item: any) => ({
        title: item.headline,
        summary: item.summary,
        url: item.url,
        source: item.source,
        timestamp: new Date(item.datetime * 1000).toISOString(),
        sentiment: null,
        instruments: [item.related || symbol].filter(Boolean)
      }));
      allNews.push(...fhNews);
    }
    
    // Add FMP news if available
    if (fmpNews.status === 'fulfilled' && Array.isArray(fmpNews.value)) {
      const fmpNewsItems = fmpNews.value.map((item: any) => ({
        title: item.title,
        summary: item.text,
        url: item.url,
        source: item.site,
        timestamp: item.publishedDate,
        sentiment: null,
        instruments: item.tickers || []
      }));
      allNews.push(...fmpNewsItems);
    }
    
    // Sort by timestamp (newest first) and remove duplicates
    const uniqueNews = allNews
      .filter((item, index, self) => 
        index === self.findIndex((t) => t.title === item.title)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return uniqueNews;
  } catch (error) {
    console.error('Error aggregating market news:', error);
    throw error;
  }
}

// Technical analysis function
async function getTechnicalAnalysis(symbol: string, interval: string = 'daily') {
  try {
    // Get data for multiple indicators
    const [sma, ema, rsi, macd, bbands] = await Promise.allSettled([
      fetchAlphaVantageData('query', { 
        function: 'SMA', 
        symbol, 
        interval, 
        time_period: '14', 
        series_type: 'close' 
      }),
      fetchAlphaVantageData('query', { 
        function: 'EMA', 
        symbol, 
        interval, 
        time_period: '14', 
        series_type: 'close' 
      }),
      fetchAlphaVantageData('query', { 
        function: 'RSI', 
        symbol, 
        interval, 
        time_period: '14', 
        series_type: 'close' 
      }),
      fetchAlphaVantageData('query', { 
        function: 'MACD', 
        symbol, 
        interval, 
        series_type: 'close',
        fastperiod: '12',
        slowperiod: '26',
        signalperiod: '9'
      }),
      fetchAlphaVantageData('query', { 
        function: 'BBANDS', 
        symbol, 
        interval, 
        time_period: '20', 
        series_type: 'close',
        nbdevup: '2',
        nbdevdn: '2',
        matype: '0'
      }),
    ]);
    
    // Extract the latest values for each indicator
    const analysis = {
      symbol,
      interval,
      sma: null,
      ema: null,
      rsi: null,
      macd: null,
      macdSignal: null,
      macdHist: null,
      bbUpper: null,
      bbMiddle: null,
      bbLower: null,
      lastUpdated: new Date().toISOString()
    };
    
    if (sma.status === 'fulfilled' && sma.value['Technical Analysis: SMA']) {
      const dates = Object.keys(sma.value['Technical Analysis: SMA']).sort().reverse();
      if (dates.length > 0) {
        analysis.sma = parseFloat(sma.value['Technical Analysis: SMA'][dates[0]]['SMA']);
      }
    }
    
    if (ema.status === 'fulfilled' && ema.value['Technical Analysis: EMA']) {
      const dates = Object.keys(ema.value['Technical Analysis: EMA']).sort().reverse();
      if (dates.length > 0) {
        analysis.ema = parseFloat(ema.value['Technical Analysis: EMA'][dates[0]]['EMA']);
      }
    }
    
    if (rsi.status === 'fulfilled' && rsi.value['Technical Analysis: RSI']) {
      const dates = Object.keys(rsi.value['Technical Analysis: RSI']).sort().reverse();
      if (dates.length > 0) {
        analysis.rsi = parseFloat(rsi.value['Technical Analysis: RSI'][dates[0]]['RSI']);
      }
    }
    
    if (macd.status === 'fulfilled' && macd.value['Technical Analysis: MACD']) {
      const dates = Object.keys(macd.value['Technical Analysis: MACD']).sort().reverse();
      if (dates.length > 0) {
        analysis.macd = parseFloat(macd.value['Technical Analysis: MACD'][dates[0]]['MACD']);
        analysis.macdSignal = parseFloat(macd.value['Technical Analysis: MACD'][dates[0]]['MACD_Signal']);
        analysis.macdHist = parseFloat(macd.value['Technical Analysis: MACD'][dates[0]]['MACD_Hist']);
      }
    }
    
    if (bbands.status === 'fulfilled' && bbands.value['Technical Analysis: BBANDS']) {
      const dates = Object.keys(bbands.value['Technical Analysis: BBANDS']).sort().reverse();
      if (dates.length > 0) {
        analysis.bbUpper = parseFloat(bbands.value['Technical Analysis: BBANDS'][dates[0]]['Real Upper Band']);
        analysis.bbMiddle = parseFloat(bbands.value['Technical Analysis: BBANDS'][dates[0]]['Real Middle Band']);
        analysis.bbLower = parseFloat(bbands.value['Technical Analysis: BBANDS'][dates[0]]['Real Lower Band']);
      }
    }
    
    return analysis;
  } catch (error) {
    console.error('Error getting technical analysis:', error);
    throw error;
  }
}

// Get crypto market data
async function getCryptoMarketData(coinIds: string = 'bitcoin,ethereum,ripple,litecoin,cardano') {
  try {
    const data = await fetchCoinGeckoData(`coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d`);
    return data;
  } catch (error) {
    console.error('Error getting crypto market data:', error);
    throw error;
  }
}

// Get commodity prices
async function getCommodityPrices() {
  try {
    // Using Alpha Vantage for commodity data
    const commodities = [
      { symbol: 'WTI', name: 'Crude Oil (WTI)' },
      { symbol: 'BRENT', name: 'Crude Oil (Brent)' },
      { symbol: 'NATURAL_GAS', name: 'Natural Gas' },
      { symbol: 'COPPER', name: 'Copper' },
      { symbol: 'ALUMINUM', name: 'Aluminum' },
      { symbol: 'WHEAT', name: 'Wheat' },
      { symbol: 'CORN', name: 'Corn' },
      { symbol: 'COTTON', name: 'Cotton' },
      { symbol: 'SUGAR', name: 'Sugar' },
      { symbol: 'COFFEE', name: 'Coffee' }
    ];
    
    const results = await Promise.allSettled(
      commodities.map(commodity => 
        fetchAlphaVantageData('query', { 
          function: 'COMMODITY_PRICE', 
          symbol: commodity.symbol 
        })
      )
    );
    
    const commodityData = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value.data) {
        return {
          symbol: commodities[index].symbol,
          name: commodities[index].name,
          price: parseFloat(result.value.data[0].value),
          unit: result.value.data[0].unit,
          timestamp: result.value.data[0].timestamp
        };
      }
      return null;
    }).filter(Boolean);
    
    return commodityData;
  } catch (error) {
    console.error('Error getting commodity prices:', error);
    throw error;
  }
}

// Handle the different API endpoints
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();
  
  try {
    let responseData;
    
    if (req.method === 'GET') {
      // Handle GET requests
      const params = Object.fromEntries(url.searchParams.entries());
      
      switch (endpoint) {
        case 'market-news':
          responseData = await getAggregatedMarketNews(params.symbol);
          break;
          
        case 'technical-analysis':
          if (!params.symbol) {
            return new Response(JSON.stringify({ error: 'Symbol parameter is required' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }
          responseData = await getTechnicalAnalysis(params.symbol, params.interval || 'daily');
          break;
          
        case 'crypto-market':
          responseData = await getCryptoMarketData(params.coins);
          break;
          
        case 'commodity-prices':
          responseData = await getCommodityPrices();
          break;
          
        case 'twitter-sentiment':
          if (!params.query) {
            return new Response(JSON.stringify({ error: 'Query parameter is required' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }
          responseData = await fetchTwitterSentiment(params.query);
          break;
          
        case 'stock-quote':
          if (!params.symbol) {
            return new Response(JSON.stringify({ error: 'Symbol parameter is required' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }
          responseData = await fetchAlphaVantageData('query', { 
            function: 'GLOBAL_QUOTE', 
            symbol: params.symbol 
          });
          break;
          
        default:
          return new Response(JSON.stringify({ error: 'Invalid endpoint' }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
      }
    } else if (req.method === 'POST') {
      // Handle POST requests for more complex queries
      const requestData = await req.json();
      
      switch (endpoint) {
        case 'batch-quotes':
          if (!requestData.symbols || !Array.isArray(requestData.symbols)) {
            return new Response(JSON.stringify({ error: 'Symbols array is required' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }
          
          const batchResults = await Promise.allSettled(
            requestData.symbols.map((symbol: string) => 
              fetchAlphaVantageData('query', { 
                function: 'GLOBAL_QUOTE', 
                symbol 
              })
            )
          );
          
          responseData = batchResults.map((result, index) => {
            if (result.status === 'fulfilled') {
              return {
                symbol: requestData.symbols[index],
                data: result.value
              };
            }
            return {
              symbol: requestData.symbols[index],
              error: 'Failed to fetch data'
            };
          });
          break;
          
        default:
          return new Response(JSON.stringify({ error: 'Invalid endpoint' }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify(responseData), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('Error in trading-apis function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
