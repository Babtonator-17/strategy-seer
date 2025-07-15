
// AI service for generating trading recommendations and analysis

import { getOpenPositions, getMarketData } from './brokerService';

/**
 * AI recommendation interface
 */
export interface AIRecommendation {
  instrument: string;
  action: 'buy' | 'sell' | 'hold';
  strength: 'weak' | 'moderate' | 'strong';
  entryZone?: { min: number; max: number };
  target?: number;
  stopLoss?: number;
  reasoning: string;
  timestamp: string;
  confidenceScore: number;
  timeframe: string;
}

/**
 * Market condition interface
 */
export interface MarketCondition {
  instrument: string;
  condition: 'volatile' | 'trending' | 'ranging' | 'uncertain';
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

/**
 * Options for account types
 */
export enum AccountType {
  DEMO = 'demo',
  PAPER = 'paper',
  LIVE = 'live'
}

/**
 * AI Configuration - Uses OpenRouter instead of OpenAI
 * Configuration is handled via Supabase Edge Function secrets
 */

/**
 * News article interface
 */
export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  summary?: string;
  keywords: string[];
  instruments?: string[];
}

// Cache for news data to avoid excessive API calls
const newsCache: {
  data: NewsArticle[];
  timestamp: number;
} = {
  data: [],
  timestamp: 0
};
export const fetchMarketNews = async (
  instruments?: string[],
  limit: number = 10
): Promise<NewsArticle[]> => {
  // Check if we have recent cached news (less than 15 minutes old)
  const now = Date.now();
  if (newsCache.data.length > 0 && now - newsCache.timestamp < 15 * 60 * 1000) {
    console.log('Using cached news data');
    
    if (instruments && instruments.length > 0) {
      return newsCache.data.filter(article => 
        article.instruments?.some(i => instruments.includes(i))
      ).slice(0, limit);
    }
    
    return newsCache.data.slice(0, limit);
  }
  
  console.log('Fetching fresh news data');
  
  // Mock news data - in a real app, this would call a financial news API
  const mockNews: NewsArticle[] = [
    {
      id: 'news1',
      title: 'Bitcoin Surges Past $40,000 as Institutional Interest Grows',
      url: 'https://example.com/bitcoin-news-1',
      source: 'Crypto Finance News',
      publishedAt: new Date().toISOString(),
      sentiment: 'positive',
      relevance: 0.95,
      summary: 'Bitcoin has surged past $40,000 as institutional investors continue to show interest in cryptocurrency as an inflation hedge.',
      keywords: ['bitcoin', 'cryptocurrency', 'institutional investors', 'inflation hedge'],
      instruments: ['BTCUSD']
    },
    {
      id: 'news2',
      title: 'EUR/USD Falls After ECB Comments on Interest Rate Outlook',
      url: 'https://example.com/eurusd-news-1',
      source: 'FX Daily',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sentiment: 'negative',
      relevance: 0.87,
      summary: 'The EUR/USD pair fell after ECB officials signaled a cautious approach to future rate hikes, contrasting with the Fed\'s hawkish stance.',
      keywords: ['EUR/USD', 'ECB', 'interest rates', 'Federal Reserve'],
      instruments: ['EURUSD']
    },
    {
      id: 'news3',
      title: 'Gold Rises on Geopolitical Tensions and Inflation Concerns',
      url: 'https://example.com/gold-news-1',
      source: 'Commodities Insight',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      sentiment: 'positive',
      relevance: 0.82,
      summary: 'Gold prices have risen due to ongoing geopolitical tensions and concerns about persistent inflation in major economies.',
      keywords: ['gold', 'geopolitical tensions', 'inflation', 'safe haven'],
      instruments: ['XAUUSD']
    },
    {
      id: 'news4',
      title: 'Oil Prices Drop on Rising Inventories and Demand Concerns',
      url: 'https://example.com/oil-news-1',
      source: 'Energy Markets Review',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      sentiment: 'negative',
      relevance: 0.79,
      summary: 'Crude oil prices declined following reports of rising U.S. inventories and concerns about weakening global demand.',
      keywords: ['oil', 'inventories', 'demand', 'energy'],
      instruments: ['USOIL', 'BRENT']
    },
    {
      id: 'news5',
      title: 'S&P 500 Reaches New All-Time High Amid Strong Earnings',
      url: 'https://example.com/sp500-news-1',
      source: 'Market Watch Daily',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      sentiment: 'positive',
      relevance: 0.91,
      summary: 'The S&P 500 index reached a new all-time high, driven by better-than-expected corporate earnings and positive economic data.',
      keywords: ['S&P 500', 'stocks', 'earnings', 'economic data'],
      instruments: ['SPX500']
    }
  ];
  
  // Update cache
  newsCache.data = mockNews;
  newsCache.timestamp = now;
  
  if (instruments && instruments.length > 0) {
    return mockNews.filter(article => 
      article.instruments?.some(i => instruments.includes(i))
    ).slice(0, limit);
  }
  
  return mockNews.slice(0, limit);
};

/**
 * Generate AI response to user query using positions data and market context
 */
export const generateAIResponse = async (query: string): Promise<string> => {
  console.log(`Processing user query: ${query}`);
  
  // Get current positions for context
  let positionsData = [];
  try {
    positionsData = await getOpenPositions();
  } catch (error) {
    console.error('Failed to fetch positions for AI context:', error);
  }
  
  // Get market news for context
  let newsData = [];
  try {
    if (query.toLowerCase().includes('news') || 
        query.toLowerCase().includes('current') ||
        query.toLowerCase().includes('latest')) {
      newsData = await fetchMarketNews(undefined, 5);
    }
  } catch (error) {
    console.error('Failed to fetch news for AI context:', error);
  }
  
  // AI functionality is now handled by OpenRouter via Supabase Edge Functions
  // This service now focuses on demo data and market analysis
  
  // Context-aware responses based on query
  if (query.toLowerCase().includes('news') || query.toLowerCase().includes('latest')) {
    const newsContent = await fetchMarketNews();
    let newsResponse = "Here's the latest market news:\n\n";
    
    newsContent.forEach((article, idx) => {
      newsResponse += `${idx + 1}. ${article.title} (${article.source})\n`;
      if (article.summary) {
        newsResponse += `   Summary: ${article.summary}\n`;
      }
      newsResponse += `   Sentiment: ${article.sentiment}\n\n`;
    });
    
    return newsResponse;
  }
  
  if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('btc')) {
    const btcData = getMarketData('BTCUSD');
    const btcNews = await fetchMarketNews(['BTCUSD'], 2);
    
    let response = `Current Bitcoin price is $${btcData.price.toLocaleString()}, `;
    response += btcData.change > 0 
      ? `up ${btcData.change}% today. ` 
      : `down ${Math.abs(btcData.change)}% today. `;
    
    response += `Today's range: $${btcData.low.toLocaleString()} - $${btcData.high.toLocaleString()}. `;
    
    if (btcNews.length > 0) {
      response += `\n\nRecent news: ${btcNews[0].title} - ${btcNews[0].summary}`;
    }
    
    if (positionsData.some(pos => pos.instrument === 'BTCUSD')) {
      const btcPosition = positionsData.find(pos => pos.instrument === 'BTCUSD');
      response += `\n\nYou currently have a ${btcPosition.type} position of ${btcPosition.volume} BTC, `;
      response += btcPosition.profit > 0 
        ? `with a profit of $${btcPosition.profit.toFixed(2)}.` 
        : `with a loss of $${Math.abs(btcPosition.profit).toFixed(2)}.`;
    }
    
    return response;
  } else if (query.toLowerCase().includes('risk')) {
    const totalRisk = positionsData.reduce((sum, pos) => {
      const riskAmount = pos.type === 'buy' 
        ? (pos.openPrice - (pos.stopLoss || pos.openPrice * 0.95)) * pos.volume
        : ((pos.stopLoss || pos.openPrice * 1.05) - pos.openPrice) * pos.volume;
      return sum + Math.abs(riskAmount);
    }, 0);
    
    return `Your current portfolio has ${positionsData.length} open positions with approximately $${totalRisk.toFixed(2)} at risk (assuming default stop losses where not set). I recommend limiting each position to 2-5% of your capital. Your most volatile positions in crypto should have tighter stops. Consider hedging your crypto exposure with options or futures if available through your broker.`;
  } else if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('analysis')) {
    const profitPositions = positionsData.filter(pos => pos.profit > 0);
    const lossPositions = positionsData.filter(pos => pos.profit <= 0);
    const avgProfit = profitPositions.length ? profitPositions.reduce((sum, pos) => sum + pos.profit, 0) / profitPositions.length : 0;
    const avgLoss = lossPositions.length ? lossPositions.reduce((sum, pos) => sum + pos.profit, 0) / lossPositions.length : 0;
    
    return `I've analyzed your ${positionsData.length} open positions. Your average winning position is +$${avgProfit.toFixed(2)} while your average losing position is -$${Math.abs(avgLoss).toFixed(2)}. This gives you a profit-to-loss ratio of ${avgLoss !== 0 ? (avgProfit / Math.abs(avgLoss)).toFixed(2) : 'N/A'}. ${
      positionsData.length > 0 ? `Your largest position is in ${positionsData.sort((a, b) => b.volume - a.volume)[0].instrument}. Consider reducing this position size to better manage risk.` : 'Consider adding positions to diversify your portfolio.'
    }`;
  } else if (query.toLowerCase().includes('recommend') || query.toLowerCase().includes('suggestion')) {
    return `Based on current market conditions and your portfolio composition, I'd recommend:
    
    1. Consider adding EUR/USD long positions as the pair is showing signs of a trend reversal
    2. Your BTC exposure is high relative to your account size, consider taking partial profits
    3. The volatility in ETH/USD suggests increasing your position size gradually rather than all at once
    4. Set a trailing stop on your current profitable positions to lock in gains while letting them run`;
  } else if (query.toLowerCase().includes('commodit')) {
    return `Based on the latest market data and news, here are the current best-performing commodities:

1. Gold (XAUUSD): Up 0.45% today with positive sentiment due to ongoing geopolitical tensions. Technical indicators suggest a bullish trend continuation.

2. Silver (XAGUSD): Following gold's uptrend with a 0.3% gain. Silver typically amplifies gold's movements and could see stronger gains if industrial demand increases.

3. Natural Gas: Showing strength with a 2.1% gain as weather forecasts predict colder temperatures in key consumption regions.

Oil markets (USOIL) are currently underperforming, down 1.2% today due to rising inventory levels and concerns about demand weakness in major economies.

Would you like a more detailed analysis on any specific commodity?`;
  } else {
    // Generic response for other types of questions
    return `I've analyzed the current market conditions and your portfolio of ${positionsData.length} positions. ${
      positionsData.length > 0 
        ? `Your largest exposure is to ${positionsData.sort((a, b) => b.volume - a.volume)[0].instrument} which represents about ${Math.round(positionsData.sort((a, b) => b.volume - a.volume)[0].volume / positionsData.reduce((sum, pos) => sum + pos.volume, 0) * 100)}% of your portfolio.`
        : 'You currently have no open positions. Consider starting with small positions in major pairs or cryptocurrencies.'
    } For more specific analysis, please ask about a particular instrument, strategy, or risk management technique.`;
  }
};

/**
 * Get AI trading recommendations
 */
export const getRecommendations = async (
  instruments?: string[],
  timeframe?: string
): Promise<AIRecommendation[]> => {
  // In a real app, this would call an actual AI model API
  console.log(`Fetching AI recommendations for ${instruments?.join(', ') || 'all instruments'} on ${timeframe || 'default'} timeframe`);
  
  // Generate mock recommendations
  const recommendations: AIRecommendation[] = [
    {
      instrument: 'BTCUSD',
      action: 'buy',
      strength: 'strong',
      entryZone: { min: 36200, max: 36500 },
      target: 38750,
      stopLoss: 35800,
      reasoning: 'Multiple technical indicators suggest a bullish trend is forming. RSI shows oversold conditions with positive divergence. Strong support level confirmed at $36,200.',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.85,
      timeframe: '1d',
    },
    {
      instrument: 'ETHUSD',
      action: 'sell',
      strength: 'moderate',
      entryZone: { min: 2380, max: 2420 },
      target: 2250,
      stopLoss: 2470,
      reasoning: 'Price rejected at key resistance level. MACD showing bearish crossover with decreasing volume on recent rallies. Chart pattern indicates potential head and shoulders formation.',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.72,
      timeframe: '4h',
    },
    {
      instrument: 'EURUSD',
      action: 'hold',
      strength: 'weak',
      reasoning: 'Mixed signals ahead of important economic data releases. Price consolidating within a narrow range with decreased volatility.',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.55,
      timeframe: '1d',
    },
  ];
  
  // Filter by instruments if provided
  if (instruments && instruments.length > 0) {
    return recommendations.filter(rec => instruments.includes(rec.instrument));
  }
  
  return recommendations;
};

/**
 * Get market conditions and risk analysis
 */
export const getMarketConditions = async (): Promise<MarketCondition[]> => {
  // In a real app, this would analyze market data and return actual insights
  
  return [
    {
      instrument: 'EURUSD',
      condition: 'volatile',
      description: 'Upcoming ECB announcement may cause significant volatility. Consider reducing position sizes or widening stop losses.',
      riskLevel: 'high',
      timestamp: new Date().toISOString(),
    },
    {
      instrument: 'BTCUSD',
      condition: 'trending',
      description: 'Strong upward momentum detected with increasing volume. Favorable conditions for trend-following strategies.',
      riskLevel: 'medium',
      timestamp: new Date().toISOString(),
    },
    {
      instrument: 'USDJPY',
      condition: 'ranging',
      description: 'Price consolidating in a defined range. Suitable for range-based trading strategies.',
      riskLevel: 'low',
      timestamp: new Date().toISOString(),
    },
  ];
};

/**
 * Get AI-analyzed news and sentiment data
 */
export const getNewsSentiment = async (instruments?: string[]): Promise<any[]> => {
  // In a real app, this would fetch and analyze actual news data
  
  return [
    {
      instrument: 'BTCUSD',
      sentiment: 'positive',
      score: 0.68,
      headlines: [
        {
          title: 'Major institution announces Bitcoin adoption for treasury',
          source: 'Crypto News Daily',
          url: '#',
          sentiment: 'very_positive',
          timestamp: new Date().toISOString(),
        },
        {
          title: 'Bitcoin network activity reaches all-time high',
          source: 'Blockchain Insights',
          url: '#',
          sentiment: 'positive',
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      instrument: 'EURUSD',
      sentiment: 'negative',
      score: 0.58,
      headlines: [
        {
          title: 'ECB signals concern over Eurozone growth outlook',
          source: 'Euro Finance',
          url: '#',
          sentiment: 'negative',
          timestamp: new Date().toISOString(),
        },
        {
          title: 'USD strengthens as Fed maintains hawkish stance',
          source: 'FX Daily',
          url: '#',
          sentiment: 'negative',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ];
};

/**
 * Generate AI trade prediction
 */
export const getPrediction = async (
  instrument: string, 
  timeframe: string
): Promise<any> => {
  // In a real app, this would call a machine learning model API
  console.log(`Generating prediction for ${instrument} on ${timeframe} timeframe`);
  
  // Return mock prediction data
  return {
    instrument,
    timeframe,
    prediction: {
      direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
      confidenceScore: 0.65 + Math.random() * 0.3,
      priceTargets: {
        oneDay: { min: 36200, max: 36800 },
        oneWeek: { min: 35800, max: 38200 },
      },
      probabilityDistribution: {
        stronglyBearish: 0.15,
        bearish: 0.2,
        neutral: 0.25,
        bullish: 0.3,
        stronglyBullish: 0.1,
      },
    },
    analysisFactors: {
      technical: 0.65,
      sentiment: 0.75,
      fundamental: 0.45,
      marketStructure: 0.8,
    },
    generatedAt: new Date().toISOString(),
  };
};

/**
 * Optimize a trading strategy using AI
 */
export const optimizeStrategy = async (
  strategyId: string, 
  parameters: Record<string, any>
): Promise<any> => {
  // In a real app, this would run optimization algorithms and machine learning
  console.log(`Optimizing strategy ${strategyId} with parameters:`, parameters);
  
  // Return mock optimized parameters
  return {
    originalParameters: parameters,
    optimizedParameters: {
      ...parameters,
      entryThreshold: parameters.entryThreshold * 1.2,
      stopLossDistance: parameters.stopLossDistance * 0.9,
      takeProfitDistance: parameters.takeProfitDistance * 1.1,
    },
    performance: {
      beforeOptimization: {
        profitFactor: 1.45,
        winRate: 52,
        expectedValue: 0.8,
      },
      afterOptimization: {
        profitFactor: 1.76,
        winRate: 58,
        expectedValue: 1.2,
      },
    },
  };
};
