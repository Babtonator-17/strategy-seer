
import { tradeHistory } from "@/utils/supabaseHelpers";
import { OrderParams } from "./types";
import { getCurrentBrokerConnectionId, getCurrentBroker } from "./connectionManager";
import { getMarketPrice } from "./marketData";
import { supabase } from "@/integrations/supabase/client";

/**
 * Place a trade order
 */
export const placeOrder = async (order: OrderParams): Promise<any> => {
  console.log(`Placing ${order.type} order for ${order.instrument}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const currentBrokerType = getCurrentBroker();
  const currentBrokerConnectionId = getCurrentBrokerConnectionId();
  
  // Generate a mock order ID and response
  const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;
  
  const executionPrice = order.price || getMarketPrice(order.instrument, order.type);
  
  console.log(`[${currentBrokerType}] Order executed at price: ${executionPrice}`);
  
  // Create a new trade history record if authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      const userId = sessionData.session.user.id;
      
      // Insert the trade into the trade_history table
      await tradeHistory.insert({
        user_id: userId,
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
      });
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
