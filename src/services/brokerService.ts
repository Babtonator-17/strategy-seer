
// Mock broker service for the trading application

/**
 * Different broker connection types
 */
export enum BrokerType {
  DEMO = 'demo',
  MT4 = 'mt4',
  MT5 = 'mt5',
  BINANCE = 'binance',
  OANDA = 'oanda',
  ALPACA = 'alpaca',
}

/**
 * Interface for broker connection parameters
 */
export interface BrokerConnectionParams {
  type: BrokerType;
  server?: string;
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
  login?: string;
  password?: string;
}

/**
 * Interface for trade order parameters
 */
export interface OrderParams {
  instrument: string;
  type: 'buy' | 'sell';
  volume: number;
  price?: number; // Optional for market orders
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
}

/**
 * Connect to a broker
 */
export const connectToBroker = async (params: BrokerConnectionParams): Promise<boolean> => {
  // In a real app, this would connect to the actual broker API
  console.log(`Connecting to ${params.type} broker...`);
  
  // Simulate API connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo, always return success
  if (params.type === BrokerType.DEMO) {
    console.log('Connected to demo broker successfully');
    return true;
  }
  
  // For real brokers, validate credentials
  if (!params.apiKey && !params.login) {
    console.error('API key or login credentials required');
    return false;
  }
  
  console.log('Connected to broker successfully');
  return true;
};

/**
 * Disconnect from a broker
 */
export const disconnectFromBroker = async (): Promise<boolean> => {
  console.log('Disconnecting from broker...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Disconnected from broker successfully');
  return true;
};

/**
 * Get account information
 */
export const getAccountInfo = async (): Promise<any> => {
  // For demo purposes, return mock data
  return {
    balance: 10000,
    equity: 10245.75,
    marginLevel: 324.5,
    freeMargin: 9800,
    currency: 'USD',
  };
};

/**
 * Place a trade order
 */
export const placeOrder = async (order: OrderParams): Promise<any> => {
  console.log(`Placing ${order.type} order for ${order.instrument}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock order ID and response
  const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;
  
  return {
    orderId,
    instrument: order.instrument,
    type: order.type,
    volume: order.volume,
    price: order.price || getMarketPrice(order.instrument, order.type),
    stopLoss: order.stopLoss,
    takeProfit: order.takeProfit,
    status: 'executed',
    openTime: new Date().toISOString(),
  };
};

/**
 * Close an open position
 */
export const closePosition = async (positionId: string): Promise<boolean> => {
  console.log(`Closing position ${positionId}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return true;
};

/**
 * Modify an existing position (stop loss, take profit)
 */
export const modifyPosition = async (
  positionId: string, 
  params: { stopLoss?: number; takeProfit?: number }
): Promise<boolean> => {
  console.log(`Modifying position ${positionId}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return true;
};

/**
 * Get open positions
 */
export const getOpenPositions = async (): Promise<any[]> => {
  // Return mock positions data
  return [
    {
      id: 'pos_1',
      instrument: 'BTCUSD',
      type: 'buy',
      volume: 0.15,
      openPrice: 36450,
      currentPrice: 36575,
      profit: 172.5,
      pips: 125,
      openTime: '2025-04-03T10:22:15Z',
      stopLoss: 36000,
      takeProfit: 37200,
    },
    {
      id: 'pos_2',
      instrument: 'EURUSD',
      type: 'sell',
      volume: 0.5,
      openPrice: 1.0892,
      currentPrice: 1.0915,
      profit: -47.25,
      pips: -23,
      openTime: '2025-04-03T12:05:22Z',
      stopLoss: 1.0950,
      takeProfit: 1.0800,
    },
    {
      id: 'pos_3',
      instrument: 'ETHUSD',
      type: 'buy',
      volume: 0.25,
      openPrice: 2345,
      currentPrice: 2368.2,
      profit: 120.5,
      pips: 23.2,
      openTime: '2025-04-04T15:12:08Z',
      stopLoss: 2300,
      takeProfit: 2450,
    },
  ];
};

/**
 * Get trade history
 */
export const getTradeHistory = async (
  startDate?: Date, 
  endDate?: Date
): Promise<any[]> => {
  // Return mock trade history
  return [
    {
      id: '1',
      instrument: 'BTCUSD',
      type: 'buy',
      volume: 0.15,
      openPrice: 36100,
      closePrice: 36450,
      profit: 172.50,
      pips: 350,
      openTime: '2025-04-03T10:22:15Z',
      closeTime: '2025-04-05T14:45:30Z',
    },
    {
      id: '2',
      instrument: 'EURUSD',
      type: 'sell',
      volume: 0.5,
      openPrice: 1.0892,
      closePrice: 1.0915,
      profit: -47.25,
      pips: -23,
      openTime: '2025-04-03T12:05:22Z',
      closeTime: '2025-04-05T12:30:45Z',
    },
    // ... more trades
  ];
};

/**
 * Helper function to get current market price
 */
const getMarketPrice = (instrument: string, orderType: 'buy' | 'sell'): number => {
  // In a real app, this would fetch the current market price
  // Here we generate a realistic mock price
  
  let basePrice;
  switch (instrument) {
    case 'BTCUSD':
      basePrice = 36500;
      break;
    case 'ETHUSD':
      basePrice = 2360;
      break;
    case 'EURUSD':
      basePrice = 1.0882;
      break;
    case 'USDJPY':
      basePrice = 151.45;
      break;
    case 'GBPUSD':
      basePrice = 1.2640;
      break;
    default:
      basePrice = 100;
  }
  
  // Add small spread
  return orderType === 'buy' ? basePrice * 1.0002 : basePrice * 0.9998;
};
