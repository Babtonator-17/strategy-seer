
import { supabase } from "@/integrations/supabase/client";

/**
 * Different broker connection types
 */
export enum BrokerType {
  DEMO = 'demo',
  PAPER = 'paper',
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
  name?: string;
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

// Track current broker connection state
let currentBrokerType: BrokerType = BrokerType.DEMO;
let currentBrokerConnectionId: string | null = null;

/**
 * Get current broker connection type
 */
export const getCurrentBroker = (): BrokerType => {
  return currentBrokerType;
};

/**
 * Get current broker connection ID
 */
export const getCurrentBrokerConnectionId = (): string | null => {
  return currentBrokerConnectionId;
};

/**
 * Set current broker connection
 */
export const setCurrentBrokerConnection = (type: BrokerType, connectionId: string): void => {
  currentBrokerType = type;
  currentBrokerConnectionId = connectionId;
  console.log(`Current broker set to ${type} (ID: ${connectionId})`);
};

/**
 * Connect to a broker
 */
export const connectToBroker = async (params: BrokerConnectionParams): Promise<boolean> => {
  // In a real app, this would connect to the actual broker API
  console.log(`Connecting to ${params.type} broker...`);
  
  // Simulate API connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo or paper, always return success
  if (params.type === BrokerType.DEMO || params.type === BrokerType.PAPER) {
    console.log(`Connected to ${params.type} broker successfully`);
    currentBrokerType = params.type;
    return true;
  }
  
  // For real brokers, validate credentials
  if (!params.apiKey && !params.login) {
    console.error('API key or login credentials required');
    return false;
  }
  
  console.log('Connected to broker successfully');
  currentBrokerType = params.type;
  return true;
};

/**
 * Disconnect from a broker
 */
export const disconnectFromBroker = async (): Promise<boolean> => {
  console.log('Disconnecting from broker...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If we have a connection ID, update the database
  if (currentBrokerConnectionId) {
    try {
      await supabase
        .from('broker_connections')
        .update({ is_active: false })
        .eq('id', currentBrokerConnectionId);
    } catch (error) {
      console.error('Error updating broker connection status:', error);
    }
  }
  
  // Reset current connection
  currentBrokerType = BrokerType.DEMO;
  currentBrokerConnectionId = null;
  
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
  
  const executionPrice = order.price || getMarketPrice(order.instrument, order.type);
  
  console.log(`[${currentBrokerType}] Order executed at price: ${executionPrice}`);
  
  // Create a new trade history record if authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Insert the trade into the trade_history table
      await supabase
        .from('trade_history')
        .insert([
          {
            broker_connection_id: currentBrokerConnectionId,
            instrument: order.instrument,
            direction: order.type,
            volume: order.volume,
            open_price: executionPrice,
            status: 'open',
            open_time: new Date().toISOString(),
            metadata: {
              stopLoss: order.stopLoss,
              takeProfit: order.takeProfit,
              comment: order.comment
            }
          }
        ]);
    }
  } catch (error) {
    console.error('Error saving trade to history:', error);
    // Continue with the mock response even if saving fails
  }
  
  return {
    orderId,
    instrument: order.instrument,
    type: order.type,
    volume: order.volume,
    price: executionPrice,
    stopLoss: order.stopLoss,
    takeProfit: order.takeProfit,
    status: 'executed',
    openTime: new Date().toISOString(),
    accountType: currentBrokerType,
  };
};

/**
 * Close an open position
 */
export const closePosition = async (positionId: string): Promise<boolean> => {
  console.log(`Closing position ${positionId}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Update the trade history record if authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Fetch the position details
      const { data: position } = await supabase
        .from('trade_history')
        .select('*')
        .eq('id', positionId)
        .single();
      
      if (position) {
        // Calculate a realistic closing price
        const closingPrice = position.direction === 'buy' 
          ? position.open_price * (1 + (Math.random() * 0.05))  // Up to 5% profit for buy
          : position.open_price * (1 - (Math.random() * 0.05));  // Up to 5% profit for sell
        
        // Calculate profit/loss
        const profitLoss = position.direction === 'buy'
          ? (closingPrice - position.open_price) * position.volume
          : (position.open_price - closingPrice) * position.volume;
        
        // Update the position as closed
        await supabase
          .from('trade_history')
          .update({
            status: 'closed',
            close_price: closingPrice,
            close_time: new Date().toISOString(),
            profit_loss: profitLoss
          })
          .eq('id', positionId);
      }
    }
  } catch (error) {
    console.error('Error updating closed position in history:', error);
  }
  
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
  
  // Update the trade history record if authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Get the current metadata
      const { data: position } = await supabase
        .from('trade_history')
        .select('metadata')
        .eq('id', positionId)
        .single();
      
      if (position) {
        // Update metadata with new values
        const updatedMetadata = {
          ...position.metadata,
        };
        
        if (params.stopLoss !== undefined) {
          updatedMetadata.stopLoss = params.stopLoss;
        }
        
        if (params.takeProfit !== undefined) {
          updatedMetadata.takeProfit = params.takeProfit;
        }
        
        // Update the position
        await supabase
          .from('trade_history')
          .update({
            metadata: updatedMetadata
          })
          .eq('id', positionId);
      }
    }
  } catch (error) {
    console.error('Error updating position metadata in history:', error);
  }
  
  return true;
};

/**
 * Get open positions
 */
export const getOpenPositions = async (): Promise<any[]> => {
  // Try to get positions from database if authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      const { data: positions, error } = await supabase
        .from('trade_history')
        .select('*')
        .eq('status', 'open')
        .order('open_time', { ascending: false });
      
      if (!error && positions && positions.length > 0) {
        // Transform the database records to the expected format
        return positions.map(pos => ({
          id: pos.id,
          instrument: pos.instrument,
          type: pos.direction,
          volume: pos.volume,
          openPrice: pos.open_price,
          currentPrice: getMarketPrice(pos.instrument, pos.direction === 'buy' ? 'sell' : 'buy'),
          profit: calculateProfit(pos),
          pips: calculatePips(pos),
          openTime: pos.open_time,
          stopLoss: pos.metadata?.stopLoss,
          takeProfit: pos.metadata?.takeProfit,
          accountType: currentBrokerType
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching positions from database:', error);
  }
  
  // Return mock positions data as fallback
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
      accountType: currentBrokerType
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
      accountType: currentBrokerType
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
      accountType: currentBrokerType
    },
  ];
};

// Helper function to calculate profit
const calculateProfit = (position: any): number => {
  const currentPrice = getMarketPrice(position.instrument, position.direction === 'buy' ? 'sell' : 'buy');
  
  if (position.direction === 'buy') {
    return (currentPrice - position.open_price) * position.volume;
  } else {
    return (position.open_price - currentPrice) * position.volume;
  }
};

// Helper function to calculate pips
const calculatePips = (position: any): number => {
  const currentPrice = getMarketPrice(position.instrument, position.direction === 'buy' ? 'sell' : 'buy');
  
  if (position.instrument.includes('USD')) {
    // For crypto, just use price difference
    return position.direction === 'buy'
      ? currentPrice - position.open_price
      : position.open_price - currentPrice;
  } else {
    // For forex, multiply by 10000
    return position.direction === 'buy'
      ? (currentPrice - position.open_price) * 10000
      : (position.open_price - currentPrice) * 10000;
  }
};

/**
 * Get trade history
 */
export const getTradeHistory = async (
  startDate?: Date, 
  endDate?: Date
): Promise<any[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Start building the query
      let query = supabase
        .from('trade_history')
        .select('*')
        .eq('status', 'closed');
      
      // Add date filters if provided
      if (startDate) {
        query = query.gte('open_time', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('open_time', endDate.toISOString());
      }
      
      // Execute the query
      const { data: trades, error } = await query.order('close_time', { ascending: false });
      
      if (!error && trades && trades.length > 0) {
        // Transform the database records to the expected format
        return trades.map(trade => ({
          id: trade.id,
          instrument: trade.instrument,
          type: trade.direction,
          volume: trade.volume,
          openPrice: trade.open_price,
          closePrice: trade.close_price,
          profit: trade.profit_loss,
          pips: calculateTradeHistoryPips(trade),
          openTime: trade.open_time,
          closeTime: trade.close_time,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching trade history from database:', error);
  }
  
  // Return mock trade history as fallback
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
  ];
};

// Helper function to calculate pips for historical trades
const calculateTradeHistoryPips = (trade: any): number => {
  if (trade.instrument.includes('USD')) {
    // For crypto, just use price difference
    return trade.direction === 'buy'
      ? trade.close_price - trade.open_price
      : trade.open_price - trade.close_price;
  } else {
    // For forex, multiply by 10000
    return trade.direction === 'buy'
      ? (trade.close_price - trade.open_price) * 10000
      : (trade.open_price - trade.close_price) * 10000;
  }
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
