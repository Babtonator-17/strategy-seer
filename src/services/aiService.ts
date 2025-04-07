// AI service for generating trading recommendations and analysis

import { getOpenPositions } from './brokerService';

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
 * OpenAI configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

let openAIConfig: OpenAIConfig = {
  apiKey: '',
  model: 'gpt-4o',
  enabled: false
};

/**
 * Set OpenAI configuration for enhanced analysis
 */
export const configureOpenAI = (config: OpenAIConfig): void => {
  openAIConfig = {
    ...config,
    enabled: Boolean(config.apiKey)
  };
};

/**
 * Get OpenAI configuration
 */
export const getOpenAIConfig = (): OpenAIConfig => {
  return { ...openAIConfig };
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
  
  // If OpenAI is enabled, use it for more sophisticated responses
  if (openAIConfig.enabled && openAIConfig.apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIConfig.apiKey}`
        },
        body: JSON.stringify({
          model: openAIConfig.model,
          messages: [
            {
              role: 'system',
              content: `You are an AI trading assistant that provides analysis and recommendations. 
                        Current positions: ${JSON.stringify(positionsData)}. 
                        Answer concisely but thoroughly, focusing on trading insights and analysis.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fall back to mock responses if OpenAI fails
    }
  }
  
  // Generate a context-aware response based on query content and positions
  // This is a fallback when OpenAI is not enabled or if the API call fails
  if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('btc')) {
    if (positionsData.some(pos => pos.instrument === 'BTCUSD')) {
      return 'Based on your current BTC/USD position and recent market data, Bitcoin is showing signs of bullish momentum with key resistance at $38,200. Your current position is up $172.50 (+0.47%). Consider setting a trailing stop at $36,300 to secure profits while allowing for continued upside.';
    } else {
      return 'Based on recent market data, Bitcoin is showing signs of bullish momentum with key resistance at $37,500. Consider entering on pullbacks to the 20-day EMA around $36,200. Set stop losses at $35,400 and consider taking profits at $38,900 and $40,500.';
    }
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
