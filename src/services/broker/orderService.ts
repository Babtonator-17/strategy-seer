
import { tradeHistory } from "@/utils/supabaseHelpers";
import { OrderParams } from "./types";
import { getCurrentBrokerConnectionId, getCurrentBroker } from "./connectionManager";
import { getMarketPrice } from "./marketData";
import { supabase } from "@/integrations/supabase/client";
import { createBrokerAdapter } from "./adapters/brokerAdapter";

/**
 * Place a trade order
 */
export const placeOrder = async (order: OrderParams): Promise<any> => {
  console.log(`Placing ${order.type} order for ${order.instrument}...`);
  
  const currentBrokerType = getCurrentBroker();
  const currentBrokerConnectionId = getCurrentBrokerConnectionId();
  
  // Create the appropriate broker adapter
  const brokerAdapter = createBrokerAdapter(currentBrokerType || 'demo', { accountId: currentBrokerConnectionId });
  
  try {
    // Use the adapter to place the order
    const orderResult = await brokerAdapter.placeOrder(order);
    
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
          open_price: orderResult.price,
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
      // Continue with the order result even if saving fails
    }
    
    return orderResult;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
