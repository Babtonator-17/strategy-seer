
import { supabase } from "@/integrations/supabase/client";
import { TradeHistory } from "@/types/supabase";
import { ModifyPositionParams, Position } from "./types";
import { getCurrentBroker } from "./connectionManager";
import { getMarketPrice } from "./marketData";

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
        const tradePosition = position as TradeHistory;
        // Calculate a realistic closing price
        const closingPrice = tradePosition.direction === 'buy' 
          ? tradePosition.open_price * (1 + (Math.random() * 0.05))  // Up to 5% profit for buy
          : tradePosition.open_price * (1 - (Math.random() * 0.05));  // Up to 5% profit for sell
        
        // Calculate profit/loss
        const profitLoss = tradePosition.direction === 'buy'
          ? (closingPrice - tradePosition.open_price) * tradePosition.volume
          : (tradePosition.open_price - closingPrice) * tradePosition.volume;
        
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
  params: ModifyPositionParams
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
        const tradePosition = position as TradeHistory;
        // Update metadata with new values
        const updatedMetadata = {
          ...tradePosition.metadata,
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
 * Helper function to calculate profit
 */
const calculateProfit = (position: TradeHistory): number => {
  const currentPrice = getMarketPrice(position.instrument, position.direction === 'buy' ? 'sell' : 'buy');
  
  if (position.direction === 'buy') {
    return (currentPrice - position.open_price) * position.volume;
  } else {
    return (position.open_price - currentPrice) * position.volume;
  }
};

/**
 * Helper function to calculate pips
 */
const calculatePips = (position: TradeHistory): number => {
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
 * Get open positions
 */
export const getOpenPositions = async (): Promise<Position[]> => {
  // Try to get positions from database if authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentBrokerType = getCurrentBroker();
    
    if (sessionData.session) {
      const { data: positions, error } = await supabase
        .from('trade_history')
        .select('*')
        .eq('status', 'open')
        .order('open_time', { ascending: false });
      
      if (!error && positions && positions.length > 0) {
        // Transform the database records to the expected format
        return positions.map(pos => {
          const tradePosition = pos as unknown as TradeHistory;
          return {
            id: tradePosition.id,
            instrument: tradePosition.instrument,
            type: tradePosition.direction,
            volume: tradePosition.volume,
            openPrice: tradePosition.open_price,
            currentPrice: getMarketPrice(tradePosition.instrument, tradePosition.direction === 'buy' ? 'sell' : 'buy'),
            profit: calculateProfit(tradePosition),
            pips: calculatePips(tradePosition),
            openTime: tradePosition.open_time,
            stopLoss: tradePosition.metadata?.stopLoss,
            takeProfit: tradePosition.metadata?.takeProfit,
            accountType: currentBrokerType
          };
        });
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
      accountType: getCurrentBroker()
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
      accountType: getCurrentBroker()
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
      accountType: getCurrentBroker()
    },
  ];
};
