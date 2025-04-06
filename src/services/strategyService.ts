
// Mock strategy service for the trading application

/**
 * Strategy types available in the application
 */
export enum StrategyType {
  TECHNICAL = 'technical',
  AI = 'ai',
  CUSTOM = 'custom',
}

/**
 * Risk levels for strategies
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Interface for strategy parameters
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  risk: RiskLevel;
  parameters: Record<string, any>;
  isActive: boolean;
  performance?: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    averageProfitPips: number;
    averageLossPips: number;
    netProfit: number;
    netProfitPercentage: number;
  };
}

/**
 * Get available strategies
 */
export const getStrategies = async (): Promise<Strategy[]> => {
  // In a real app, this would fetch from a backend or local storage
  return [
    {
      id: 'strategy_1',
      name: 'AI Trend Follower',
      description: 'Uses machine learning to identify market trends',
      type: StrategyType.AI,
      risk: RiskLevel.MEDIUM,
      parameters: {
        timeframes: ['1h', '4h', '1d'],
        confidenceThreshold: 0.75,
        maxPositions: 3,
      },
      isActive: true,
      performance: {
        totalTrades: 48,
        winRate: 58.3,
        profitFactor: 1.75,
        averageProfitPips: 42,
        averageLossPips: 28,
        netProfit: 824.50,
        netProfitPercentage: 8.2,
      },
    },
    {
      id: 'strategy_2',
      name: 'RSI + MACD Crossover',
      description: 'Technical analysis with RSI and MACD indicators',
      type: StrategyType.TECHNICAL,
      risk: RiskLevel.LOW,
      parameters: {
        rsiPeriod: 14,
        rsiOverbought: 70,
        rsiOversold: 30,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
      },
      isActive: false,
      performance: {
        totalTrades: 35,
        winRate: 54.3,
        profitFactor: 1.42,
        averageProfitPips: 32,
        averageLossPips: 24,
        netProfit: 347.25,
        netProfitPercentage: 3.5,
      },
    },
    {
      id: 'strategy_3',
      name: 'Breakout Hunter',
      description: 'Identifies and trades breakouts from key levels',
      type: StrategyType.TECHNICAL,
      risk: RiskLevel.HIGH,
      parameters: {
        lookbackPeriod: 20,
        volatilityMultiplier: 2.0,
        minimumVolume: 1.5,
      },
      isActive: false,
      performance: {
        totalTrades: 22,
        winRate: 45.5,
        profitFactor: 2.10,
        averageProfitPips: 85,
        averageLossPips: 35,
        netProfit: 612.80,
        netProfitPercentage: 6.1,
      },
    },
  ];
};

/**
 * Create a new strategy
 */
export const createStrategy = async (strategy: Omit<Strategy, 'id'>): Promise<Strategy> => {
  // Generate a random ID
  const newStrategy: Strategy = {
    ...strategy,
    id: `strategy_${Math.random().toString(36).substring(2, 10)}`,
  };
  
  console.log('Created new strategy:', newStrategy);
  
  // In a real app, this would save to a backend or local storage
  return newStrategy;
};

/**
 * Update an existing strategy
 */
export const updateStrategy = async (id: string, updates: Partial<Strategy>): Promise<Strategy> => {
  // In a real app, this would update the strategy in a backend or local storage
  console.log(`Updating strategy ${id}:`, updates);
  
  // Return mock updated strategy
  return {
    id,
    name: updates.name || 'Updated Strategy',
    description: updates.description || 'Updated strategy description',
    type: updates.type || StrategyType.TECHNICAL,
    risk: updates.risk || RiskLevel.MEDIUM,
    parameters: updates.parameters || {},
    isActive: updates.isActive !== undefined ? updates.isActive : false,
    performance: {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      averageProfitPips: 0,
      averageLossPips: 0,
      netProfit: 0,
      netProfitPercentage: 0,
    },
  };
};

/**
 * Delete a strategy
 */
export const deleteStrategy = async (id: string): Promise<boolean> => {
  // In a real app, this would delete from a backend or local storage
  console.log(`Deleting strategy ${id}`);
  return true;
};

/**
 * Activate a strategy
 */
export const activateStrategy = async (id: string, active: boolean): Promise<boolean> => {
  // In a real app, this would update the active status in a backend or local storage
  console.log(`${active ? 'Activating' : 'Deactivating'} strategy ${id}`);
  return true;
};

/**
 * Backtest a strategy against historical data
 */
export const backtestStrategy = async (
  strategyId: string,
  instrument: string,
  timeframe: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  // In a real app, this would run an actual backtest
  console.log(`Backtesting strategy ${strategyId} on ${instrument} (${timeframe}) from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  // Return mock backtest results
  return {
    totalTrades: 42,
    winningTrades: 24,
    losingTrades: 18,
    winRate: 57.1,
    profitFactor: 1.68,
    netProfit: 825.50,
    netProfitPercentage: 8.3,
    maxDrawdown: 412.80,
    maxDrawdownPercentage: 4.1,
    averageProfitPips: 45,
    averageLossPips: 28,
    sharpeRatio: 1.23,
    trades: [], // This would contain detailed trade information
  };
};

/**
 * Get strategy signals
 */
export const getStrategySignals = async (strategyId: string): Promise<any[]> => {
  // In a real app, this would compute actual strategy signals
  
  // Return mock signals
  return [
    {
      instrument: 'BTCUSD',
      type: 'buy',
      confidence: 0.85,
      price: 36500,
      time: new Date().toISOString(),
      reason: 'Multiple technical indicators aligned with strong trend confirmation',
    },
    {
      instrument: 'ETHUSD',
      type: 'sell',
      confidence: 0.72,
      price: 2380,
      time: new Date().toISOString(),
      reason: 'Bearish divergence with decreasing volume',
    },
    {
      instrument: 'EURUSD',
      type: 'hold',
      confidence: 0.65,
      price: 1.0882,
      time: new Date().toISOString(),
      reason: 'Mixed signals with upcoming high-impact news event',
    },
  ];
};
