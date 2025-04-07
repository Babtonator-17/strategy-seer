
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, conversationId } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's existing broker connections for context
    const { data: brokerConnections } = await supabaseClient
      .from('broker_connections')
      .select('*')
      .eq('user_id', session.user.id);

    // Get user's trading history for context
    const { data: recentTrades } = await supabaseClient
      .from('trade_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabaseClient
        .from('assistant_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', session.user.id)
        .single();
      
      conversation = data;
    }

    if (!conversation) {
      const { data } = await supabaseClient
        .from('assistant_conversations')
        .insert([
          { user_id: session.user.id, messages: [] }
        ])
        .select()
        .single();
      
      conversation = data;
    }

    // Extract conversation context
    const messages = conversation?.messages || [];
    
    // Store user's query
    messages.push({ role: 'user', content: query });

    // Generate response (in a real app, this would use an LLM API)
    let response = "";

    // Simple rule-based responses for demo
    if (query.toLowerCase().includes('connect') && query.toLowerCase().includes('broker')) {
      response = "To connect a broker, navigate to the Settings page and select the Broker tab. You can then enter your API keys or login credentials for various brokers like MetaTrader, Binance, or OANDA.";
    } else if (query.toLowerCase().includes('metatrader')) {
      response = "MetaTrader integration allows you to connect your MT4 or MT5 accounts. You'll need your login credentials and server address from your broker. Once connected, you can execute trades directly from this platform.";
    } else if (query.toLowerCase().includes('binance')) {
      response = "To integrate with Binance, you'll need to create API keys from your Binance account. Make sure to enable trading permissions for the API key but restrict withdrawals for security.";
    } else if (query.toLowerCase().includes('trading strategy') || query.toLowerCase().includes('strategy')) {
      response = "I can help analyze different trading strategies based on your goals and risk tolerance. Would you like information about trend-following, mean-reversion, or breakout strategies?";
    } else if (query.toLowerCase().includes('account') && query.toLowerCase().includes('management')) {
      response = "For account management, you can view your connected brokers, check your portfolio balance, and manage risk parameters. Would you like specific help with position sizing or risk management?";
    } else {
      response = `I understand you're asking about "${query}". I can help with broker connections, trading strategies, platform navigation, and account management. Could you provide more details about what you need?`;
    }

    // Store assistant's response
    messages.push({ role: 'assistant', content: response });

    // Update conversation with new messages
    await supabaseClient
      .from('assistant_conversations')
      .update({ messages, updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return new Response(
      JSON.stringify({
        response,
        conversationId: conversation.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
