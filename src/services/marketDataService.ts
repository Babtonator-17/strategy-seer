
// Mock market data service for the trading application

/**
 * Generate random price data for charts
 * @param instrument The trading instrument symbol
 * @param timeframe The chart timeframe
 * @returns Array of price data points
 */
export const fetchPriceData = async (instrument: string, timeframe: string): Promise<any[]> => {
  // In a real application, this would call an actual API
  console.log(`Fetching price data for ${instrument} with timeframe ${timeframe}`);
  
  // Generate mock data
  let basePrice = getBasePrice(instrument);
  let volatility = getVolatility(instrument);
  let dataPoints = getDataPoints(timeframe);
  
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < dataPoints; i++) {
    // Generate time points going backwards from now
    const time = new Date(now.getTime() - (dataPoints - i) * getTimeInterval(timeframe));
    
    // Random walk algorithm for price simulation
    basePrice = basePrice + (Math.random() - 0.5) * volatility;
    
    data.push({
      time: formatTime(time, timeframe),
      price: basePrice,
    });
  }
  
  return data;
};

/**
 * Get base price for different instruments
 */
const getBasePrice = (instrument: string): number => {
  switch (instrument) {
    case 'BTCUSD':
      return 36400 + Math.random() * 1000;
    case 'ETHUSD':
      return 2350 + Math.random() * 100;
    case 'EURUSD':
      return 1.0872 + Math.random() * 0.01;
    case 'USDJPY':
      return 151.30 + Math.random() * 1;
    case 'GBPUSD':
      return 1.2650 + Math.random() * 0.01;
    default:
      return 100 + Math.random() * 10;
  }
};

/**
 * Get volatility for different instruments
 */
const getVolatility = (instrument: string): number => {
  switch (instrument) {
    case 'BTCUSD':
      return 120;
    case 'ETHUSD':
      return 15;
    case 'EURUSD':
      return 0.0012;
    case 'USDJPY':
      return 0.15;
    case 'GBPUSD':
      return 0.0015;
    default:
      return 1;
  }
};

/**
 * Get number of data points based on timeframe
 */
const getDataPoints = (timeframe: string): number => {
  switch (timeframe) {
    case '1h':
      return 60;
    case '4h':
      return 48;
    case '1d':
      return 30;
    case '1w':
      return 20;
    case '1m':
      return 30;
    default:
      return 50;
  }
};

/**
 * Get time interval in milliseconds based on timeframe
 */
const getTimeInterval = (timeframe: string): number => {
  switch (timeframe) {
    case '1h':
      return 60 * 1000; // 1 minute intervals for 1-hour chart
    case '4h':
      return 5 * 60 * 1000; // 5 minute intervals for 4-hour chart
    case '1d':
      return 30 * 60 * 1000; // 30 minute intervals for 1-day chart
    case '1w':
      return 6 * 60 * 60 * 1000; // 6 hour intervals for 1-week chart
    case '1m':
      return 24 * 60 * 60 * 1000; // 1 day intervals for 1-month chart
    default:
      return 60 * 1000;
  }
};

/**
 * Format time based on timeframe
 */
const formatTime = (date: Date, timeframe: string): string => {
  if (['1w', '1m'].includes(timeframe)) {
    // For longer timeframes, show date only
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } else if (timeframe === '1d') {
    // For daily chart, show hour
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } else {
    // For shorter timeframes, show hour:minute
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
};

// More mock endpoints for a real application

/**
 * Get historical OHLC (Open-High-Low-Close) data
 */
export const fetchOHLCData = async (instrument: string, timeframe: string): Promise<any[]> => {
  // Implementation would be similar to fetchPriceData but with OHLC format
  return [];
};

/**
 * Get list of available instruments
 */
export const getInstruments = async (): Promise<any[]> => {
  return [
    { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto' },
    { symbol: 'EURUSD', name: 'Euro/US Dollar', type: 'forex' },
    { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', type: 'forex' },
    { symbol: 'GBPUSD', name: 'British Pound/US Dollar', type: 'forex' },
    // ... more instruments
  ];
};

/**
 * Get order book data
 */
export const getOrderBook = async (instrument: string): Promise<any> => {
  // Implementation would fetch actual order book data
  return {
    bids: [],
    asks: []
  };
};
