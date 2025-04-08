
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
You are a helpful AI trading assistant. You help users with:
1. Understanding trading strategies and concepts
2. Answering questions about market analysis
3. Providing guidance on broker connections and trading platform usage
4. General information about financial instruments and markets

Be concise, clear, and helpful. If you don't know something, be honest and suggest alternatives.
Avoid giving specific investment advice that could be construed as financial recommendations.
`;

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

    // Get user session
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

    // Generate response
    const mockResponse = generateMockResponse(query);
    
    // Store the conversation in the database
    let updatedConversationId = conversationId;
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    const assistantMessage = {
      role: 'assistant',
      content: mockResponse,
      timestamp: new Date().toISOString()
    };
    
    if (conversationId) {
      // Update existing conversation
      const { data: existingConversation, error: fetchError } = await supabaseClient
        .from('assistant_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
        // Continue with the response even if there's a fetch error
      } else {
        const updatedMessages = [...(existingConversation?.messages || []), userMessage, assistantMessage];
        
        const { error: updateError } = await supabaseClient
          .from('assistant_conversations')
          .update({ 
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
          
        if (updateError) {
          console.error('Error updating conversation:', updateError);
        }
      }
    } else {
      // Create a new conversation
      const { data: newConversation, error: insertError } = await supabaseClient
        .from('assistant_conversations')
        .insert([{
          user_id: session.user.id,
          messages: [userMessage, assistantMessage],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (insertError) {
        console.error('Error creating new conversation:', insertError);
      } else if (newConversation && newConversation.length > 0) {
        updatedConversationId = newConversation[0].id;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        response: mockResponse,
        conversationId: updatedConversationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple function to generate responses - in a real app, you'd call a language model
function generateMockResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('broker') || lowerQuery.includes('connect')) {
    return "To connect a broker, go to Settings > Broker and select your broker type. You'll need to provide your API keys or login credentials, which are securely encrypted in our database. Currently, we support MT4, MT5, Binance, Oanda, and others.";
  }
  
  if (lowerQuery.includes('strategy') || lowerQuery.includes('trading plan')) {
    return "Creating a solid trading strategy is essential. Your strategy should include entry and exit rules, risk management parameters, and the markets you'll trade. Consider using our built-in strategy tools to backtest your ideas before trading real money.";
  }
  
  if (lowerQuery.includes('risk') || lowerQuery.includes('management')) {
    return "Risk management is crucial for long-term trading success. A general rule is to risk no more than 1-2% of your account on any single trade. You can set stop-loss levels in the trading interface to automatically limit potential losses.";
  }
  
  if (lowerQuery.includes('chart') || lowerQuery.includes('analysis') || lowerQuery.includes('technical')) {
    return "Our platform provides advanced charting tools with various indicators like RSI, MACD, and Bollinger Bands. To add these to your chart, visit the Analysis tab and select your preferred indicators from the toolbox on the right side of the screen.";
  }
  
  return "I'm your AI trading assistant. I can help you with trading strategies, broker connections, market analysis, and platform navigation. Feel free to ask me specific questions about any of these topics.";
}
