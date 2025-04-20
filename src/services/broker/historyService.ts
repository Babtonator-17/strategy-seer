
import { tradeHistory } from "@/utils/supabaseHelpers";
import { TradeHistory } from "@/types/supabase";

/**
 * Helper function to calculate pips for historical trades
 */
const calculateTradeHistoryPips = (trade: TradeHistory): number => {
  if (!trade.close_price) return 0;
  
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
      const startIsoDate = startDate ? startDate.toISOString() : undefined;
      const endIsoDate = endDate ? endDate.toISOString() : undefined;
      
      const { data: trades, error } = await tradeHistory.getClosedTrades(startIsoDate, endIsoDate);
      
      if (!error && trades && trades.length > 0) {
        // Transform the database records to the expected format
        return trades.map(trade => {
          const tradeHistory = trade as unknown as TradeHistory;
          return {
            id: tradeHistory.id,
            instrument: tradeHistory.instrument,
            type: tradeHistory.direction,
            volume: tradeHistory.volume,
            openPrice: tradeHistory.open_price,
            closePrice: tradeHistory.close_price,
            profit: tradeHistory.profit_loss,
            pips: calculateTradeHistoryPips(tradeHistory),
            openTime: tradeHistory.open_time,
            closeTime: tradeHistory.close_time,
          };
        });
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

import { supabase } from "@/integrations/supabase/client";
