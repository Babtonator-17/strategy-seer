import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TradeRequest {
  action: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  accountType: 'demo' | 'live';
  userId?: string;
}

interface TradeResult {
  success: boolean;
  orderId?: string;
  message: string;
  executedPrice?: number;
  fees?: number;
  timestamp: string;
  error?: string;
}

function generateOrderId(): string {
  return `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function calculateFees(amount: number, price: number, symbol: string): number {
  // Demo fees calculation
  const notionalValue = amount * price;
  
  // Different fee structures by asset type
  if (symbol.includes('BTC') || symbol.includes('ETH')) {
    return notionalValue * 0.001; // 0.1% for crypto
  } else if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP')) {
    return notionalValue * 0.0002; // 0.02% for forex
  } else {
    return notionalValue * 0.0005; // 0.05% for other assets
  }
}

async function executeDemoTrade(trade: TradeRequest): Promise<TradeResult> {
  try {
    const orderId = generateOrderId();
    const executedPrice = trade.price || (42000 + (Math.random() - 0.5) * 100); // Mock execution with slippage
    const fees = calculateFees(trade.amount, executedPrice, trade.symbol);
    
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Random execution success (98% success rate for demo)
    const success = Math.random() > 0.02;
    
    if (!success) {
      return {
        success: false,
        message: "Trade execution failed - insufficient liquidity",
        timestamp: new Date().toISOString(),
        error: "INSUFFICIENT_LIQUIDITY"
      };
    }
    
    // Store trade in database if user is authenticated
    if (trade.userId) {
      try {
        await supabase.from('trade_history').insert([{
          user_id: trade.userId,
          instrument: trade.symbol,
          direction: trade.action,
          volume: trade.amount,
          open_price: executedPrice,
          open_time: new Date().toISOString(),
          status: 'open',
          metadata: {
            order_id: orderId,
            account_type: trade.accountType,
            stop_loss: trade.stopLoss,
            take_profit: trade.takeProfit,
            fees: fees
          }
        }]);
      } catch (dbError) {
        console.error('Failed to store trade in database:', dbError);
      }
    }
    
    return {
      success: true,
      orderId,
      message: `${trade.action.toUpperCase()} order executed successfully`,
      executedPrice,
      fees,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Demo trade execution error:', error);
    return {
      success: false,
      message: "Trade execution failed due to system error",
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

async function executeLiveTrade(trade: TradeRequest): Promise<TradeResult> {
  // For live trading, you would connect to actual broker APIs here
  // This is a placeholder that should be replaced with real broker integration
  
  console.log('Live trading not implemented yet - executing as demo trade');
  
  // For now, execute as demo but mark it clearly
  const result = await executeDemoTrade(trade);
  result.message = `[DEMO MODE] ${result.message} - Live trading not configured`;
  
  return result;
}

async function getPortfolioSummary(userId: string): Promise<any> {
  try {
    const { data: trades, error } = await supabase
      .from('trade_history')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open');
    
    if (error) throw error;
    
    const summary = {
      totalPositions: trades?.length || 0,
      totalValue: 0,
      totalPnL: 0,
      positions: trades || []
    };
    
    trades?.forEach(trade => {
      const currentPrice = trade.open_price * (1 + (Math.random() - 0.5) * 0.05); // Mock current price
      const pnl = trade.direction === 'buy' 
        ? (currentPrice - trade.open_price) * trade.volume
        : (trade.open_price - currentPrice) * trade.volume;
      
      summary.totalValue += currentPrice * trade.volume;
      summary.totalPnL += pnl;
    });
    
    return summary;
    
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return {
      totalPositions: 0,
      totalValue: 0,
      totalPnL: 0,
      positions: [],
      error: error.message
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    // Get user from auth header
    let userId = null;
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
    
    if (action === 'execute') {
      const tradeRequest: TradeRequest = await req.json();
      tradeRequest.userId = userId;
      
      // Validate trade request
      if (!tradeRequest.symbol || !tradeRequest.action || !tradeRequest.amount) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Missing required fields: symbol, action, amount",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      if (tradeRequest.amount <= 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Trade amount must be greater than 0",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      let result: TradeResult;
      
      if (tradeRequest.accountType === 'live') {
        result = await executeLiveTrade(tradeRequest);
      } else {
        result = await executeDemoTrade(tradeRequest);
      }
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } else if (action === 'portfolio') {
      if (!userId) {
        return new Response(
          JSON.stringify({
            error: "Authentication required",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      
      const portfolio = await getPortfolioSummary(userId);
      
      return new Response(
        JSON.stringify(portfolio),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } else if (action === 'close') {
      const { orderId } = await req.json();
      
      if (!userId) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Authentication required",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      
      // Close position in database
      try {
        const { error } = await supabase
          .from('trade_history')
          .update({
            status: 'closed',
            close_time: new Date().toISOString(),
            close_price: 42000 + (Math.random() - 0.5) * 100, // Mock close price
            profit_loss: (Math.random() - 0.3) * 1000 // Mock P&L
          })
          .eq('metadata->order_id', orderId)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Position closed successfully",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to close position",
            error: error.message,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid endpoint. Use /execute, /portfolio, or /close",
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
  } catch (error) {
    console.error("Error in trade-execution function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});