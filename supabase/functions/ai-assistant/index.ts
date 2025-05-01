
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function buildEnhancedPrompt(query: string, controlMode: boolean, marketContextData: any) {
  let systemPrompt = `You are an AI trading assistant named TradeGPT. You help users with market analysis, trading strategies, and financial advice. ${
    controlMode ? 'You are in Control Mode, which means you can execute trades when specifically asked.' : 'You are in Advisory Mode, which means you can only provide advice but cannot execute trades.'
  }

Current date: ${new Date().toISOString().split('T')[0]}

`;

  // Add market context to the system prompt based on available data
  if (marketContextData) {
    systemPrompt += "Here is recent market information that might be relevant:\n\n";
    
    if (marketContextData.cryptoData) {
      systemPrompt += "Cryptocurrency Prices:\n";
      const cryptos = marketContextData.cryptoData.slice(0, 5); // Limit to 5 cryptos for conciseness
      cryptos.forEach((crypto: any) => {
        systemPrompt += `- ${crypto.name} (${crypto.symbol.toUpperCase()}): $${crypto.price.toFixed(2)}, ${crypto.price_change_24h > 0 ? '+' : ''}${crypto.price_change_24h.toFixed(2)}% (24h)\n`;
      });
      systemPrompt += "\n";
    }
    
    if (marketContextData.technicalAnalysis) {
      systemPrompt += "Technical Analysis:\n";
      const { symbol, indicators } = marketContextData.technicalAnalysis;
      systemPrompt += `- Symbol: ${symbol}\n`;
      if (indicators.rsi) systemPrompt += `- RSI (14): ${indicators.rsi.toFixed(2)}\n`;
      if (indicators.macd) systemPrompt += `- MACD: ${indicators.macd.toFixed(2)}\n`;
      if (indicators.ema50) systemPrompt += `- EMA 50: ${indicators.ema50.toFixed(2)}\n`;
      if (indicators.sma200) systemPrompt += `- SMA 200: ${indicators.sma200.toFixed(2)}\n`;
      systemPrompt += "\n";
    }
    
    if (marketContextData.marketNews && marketContextData.marketNews.length > 0) {
      systemPrompt += "Recent Market News Headlines:\n";
      marketContextData.marketNews.slice(0, 3).forEach((news: any, index: number) => {
        systemPrompt += `- ${news.title} (${news.source})\n`;
      });
      systemPrompt += "\n";
    }
    
    if (marketContextData.commodityData) {
      systemPrompt += "Commodity Prices:\n";
      const commodities = Object.entries(marketContextData.commodityData).slice(0, 5);
      commodities.forEach(([name, data]: [string, any]) => {
        systemPrompt += `- ${name}: $${data.price.toFixed(2)}, ${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%\n`;
      });
      systemPrompt += "\n";
    }
  }
  
  if (controlMode) {
    systemPrompt += `
IMPORTANT: When the user asks you to execute a trade, you MUST format your response with [TRADE: BUY/SELL SYMBOL AMOUNT] at the beginning.
For example, if the user asks you to buy $100 of Bitcoin, your response should start with: [TRADE: BUY BTC 100]
`;
  }

  systemPrompt += `
Remember to be helpful, accurate, and provide well-reasoned advice. If you don't know something, admit it rather than making up information.
`;

  return {
    systemPrompt,
    userQuery: query
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if the OpenAI API key is configured
  if (!openaiApiKey) {
    return new Response(
      JSON.stringify({ 
        error: "OpenAI API key is not configured. Please add it to the environment variables." 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }

  try {
    const { query, conversationId, controlMode, marketContextData } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "No query provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Build enhanced prompt with market context
    const { systemPrompt, userQuery } = buildEnhancedPrompt(query, controlMode, marketContextData);

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      
      let errorMessage = "Failed to get response from OpenAI API.";
      if (errorData.error) {
        if (errorData.error.code === "rate_limit_exceeded") {
          errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
        } else if (errorData.error.code === "invalid_api_key") {
          errorMessage = "Invalid OpenAI API key. Please check your credentials.";
        } else {
          errorMessage = `OpenAI error: ${errorData.error.message}`;
        }
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const completion = await openAIResponse.json();
    const assistantResponse = completion.choices[0].message.content;

    // Store the conversation in the database if a user is authenticated
    let newConversationId = conversationId;
    
    const { event, session } = await req.headers;
    
    if (session) {
      try {
        const authClient = supabase.auth.admin;
        const { data: userData } = await authClient.getUserById(session.user.id);
        
        if (userData?.user) {
          if (!conversationId) {
            // Create a new conversation
            const { data, error } = await supabase
              .from('assistant_conversations')
              .insert([
                { 
                  user_id: userData.user.id, 
                  title: query.substring(0, 100), 
                  messages: [
                    { role: 'user', content: query, timestamp: new Date().toISOString() },
                    { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() }
                  ]
                }
              ])
              .select('id')
              .single();
              
            if (error) {
              console.error('Error creating conversation:', error);
            } else {
              newConversationId = data.id;
            }
          } else {
            // Append to existing conversation
            const { data: existingConv, error: fetchError } = await supabase
              .from('assistant_conversations')
              .select('messages')
              .eq('id', conversationId)
              .single();
              
            if (!fetchError && existingConv) {
              const updatedMessages = [
                ...existingConv.messages,
                { role: 'user', content: query, timestamp: new Date().toISOString() },
                { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() }
              ];
              
              const { error: updateError } = await supabase
                .from('assistant_conversations')
                .update({ messages: updatedMessages })
                .eq('id', conversationId);
                
              if (updateError) {
                console.error('Error updating conversation:', updateError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error storing conversation:', error);
      }
    }

    // Check if this is a trade execution message
    let executionResults = null;
    if (controlMode && assistantResponse.includes("[TRADE:")) {
      const tradeMatch = assistantResponse.match(/\[TRADE:\s*([A-Z]+)\s+([A-Z]+)\s+(\d+\.?\d*)\]/i);
      if (tradeMatch) {
        const [fullMatch, action, symbol, amount] = tradeMatch;
        executionResults = [
          {
            success: true,
            action,
            symbol,
            amount,
            message: `Trade instruction received: ${action} ${amount} of ${symbol}`
          }
        ];
      }
    }

    return new Response(
      JSON.stringify({ 
        response: assistantResponse, 
        conversationId: newConversationId,
        executionResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-assistant function:", error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
