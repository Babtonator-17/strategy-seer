import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY') || '';
const primaryModel = Deno.env.get('PRIMARY_MODEL') || 'deepseek/deepseek-chat';
const fallbackModel = Deno.env.get('FALLBACK_MODEL') || 'mistralai/mistral-8x7b-instruct';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function buildEnhancedPrompt(query: string, controlMode: boolean, marketContextData: any, accountType: string = 'demo') {
  let systemPrompt = `You are StrategySeer AI, an advanced trading assistant specializing in market analysis, strategy development, and trading execution. You help users with:

- Real-time market analysis and technical indicators
- Trading strategy development and optimization
- Risk management and portfolio analysis
- News sentiment analysis and market insights
- Trade execution and order management

Current Mode: ${controlMode ? 'Control Mode (can execute trades)' : 'Advisory Mode (analysis only)'}
Account Type: ${accountType.toUpperCase()}
Current date: ${new Date().toISOString().split('T')[0]}

`;

  // Add market context
  if (marketContextData) {
    systemPrompt += "Current Market Context:\n\n";
    
    if (marketContextData.cryptoData) {
      systemPrompt += "📈 Cryptocurrency Prices:\n";
      const cryptos = marketContextData.cryptoData.slice(0, 5);
      cryptos.forEach((crypto: any) => {
        systemPrompt += `• ${crypto.name} (${crypto.symbol.toUpperCase()}): $${crypto.price.toFixed(2)} ${crypto.price_change_24h > 0 ? '🟢' : '🔴'} ${crypto.price_change_24h > 0 ? '+' : ''}${crypto.price_change_24h.toFixed(2)}%\n`;
      });
      systemPrompt += "\n";
    }
    
    if (marketContextData.technicalAnalysis) {
      systemPrompt += "📊 Technical Analysis:\n";
      const { symbol, indicators } = marketContextData.technicalAnalysis;
      systemPrompt += `Symbol: ${symbol}\n`;
      if (indicators.rsi) systemPrompt += `RSI (14): ${indicators.rsi.toFixed(2)} ${indicators.rsi > 70 ? '(Overbought)' : indicators.rsi < 30 ? '(Oversold)' : '(Neutral)'}\n`;
      if (indicators.macd) systemPrompt += `MACD: ${indicators.macd.toFixed(2)}\n`;
      if (indicators.ema50) systemPrompt += `EMA 50: $${indicators.ema50.toFixed(2)}\n`;
      if (indicators.sma200) systemPrompt += `SMA 200: $${indicators.sma200.toFixed(2)}\n`;
      systemPrompt += "\n";
    }
    
    if (marketContextData.marketNews && marketContextData.marketNews.length > 0) {
      systemPrompt += "📰 Recent Market News:\n";
      marketContextData.marketNews.slice(0, 3).forEach((news: any) => {
        systemPrompt += `• ${news.title} (${news.source})\n`;
      });
      systemPrompt += "\n";
    }
  }
  
  if (controlMode) {
    systemPrompt += `
🔴 TRADE EXECUTION PROTOCOL:
When executing trades, format your response with the trade command at the beginning:
[TRADE: {BUY/SELL} {SYMBOL} {AMOUNT} {PRICE?} {STOP_LOSS?} {TAKE_PROFIT?}]

Examples:
- [TRADE: BUY BTCUSD 0.1 42000 40000 45000] (Buy 0.1 BTC at $42,000, stop loss $40,000, take profit $45,000)
- [TRADE: SELL EURUSD 10000 1.0850] (Sell 10,000 EUR/USD at 1.0850)

Always confirm trade details and explain your reasoning.
`;
  }

  systemPrompt += `
🎯 Response Guidelines:
- Be concise but comprehensive
- Use clear technical analysis when discussing markets
- Provide actionable insights
- Include risk warnings for volatile instruments
- Use emojis sparingly for key points
- Always explain your reasoning
`;

  return {
    systemPrompt,
    userQuery: query
  };
}

async function callOpenRouter(messages: any[], model: string, retryCount = 0): Promise<any> {
  try {
    console.log(`Attempting to call OpenRouter with model: ${model} (attempt ${retryCount + 1})`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://strategyseer.ai",
        "X-Title": "StrategySeer AI Trading Assistant"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const completion = await response.json();
    console.log(`Successfully got response from ${model}`);
    return completion;
    
  } catch (error) {
    console.error(`Error with model ${model}:`, error);
    
    // Try fallback model if primary fails and we haven't tried it yet
    if (retryCount === 0 && model === primaryModel) {
      console.log(`Primary model failed, trying fallback: ${fallbackModel}`);
      return await callOpenRouter(messages, fallbackModel, retryCount + 1);
    }
    
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if the OpenRouter API key is configured
  if (!openrouterApiKey) {
    return new Response(
      JSON.stringify({ 
        error: "OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to the Supabase Edge Function secrets." 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }

  try {
    const { query, conversationId, controlMode, marketContextData, accountType } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "No query provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Build enhanced prompt with market context
    const { systemPrompt, userQuery } = buildEnhancedPrompt(query, controlMode, marketContextData, accountType);

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery }
    ];

    // Call OpenRouter with DeepSeek primary and Mistral fallback
    const completion = await callOpenRouter(messages, primaryModel);
    const assistantResponse = completion.choices[0].message.content;

    // Store the conversation in the database if a user is authenticated
    let newConversationId = conversationId;
    
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          if (!conversationId) {
            // Create a new conversation
            const { data, error } = await supabase
              .from('assistant_conversations')
              .insert([
                { 
                  user_id: user.id, 
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
      }
    } catch (error) {
      console.error('Error storing conversation:', error);
    }

    // Check if this is a trade execution message
    let executionResults = null;
    if (controlMode && assistantResponse.includes("[TRADE:")) {
      const tradeMatch = assistantResponse.match(/\[TRADE:\s*([A-Z]+)\s+([A-Z0-9]+)\s+([0-9.]+)(?:\s+([0-9.]+))?(?:\s+([0-9.]+))?(?:\s+([0-9.]+))?\]/i);
      if (tradeMatch) {
        const [fullMatch, action, symbol, amount, price, stopLoss, takeProfit] = tradeMatch;
        executionResults = [
          {
            success: true,
            action,
            symbol,
            amount: parseFloat(amount),
            price: price ? parseFloat(price) : null,
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            takeProfit: takeProfit ? parseFloat(takeProfit) : null,
            message: `Trade instruction processed: ${action} ${amount} ${symbol}${price ? ` at $${price}` : ''}`,
            accountType: accountType || 'demo'
          }
        ];
      }
    }

    return new Response(
      JSON.stringify({ 
        response: assistantResponse, 
        conversationId: newConversationId,
        executionResults,
        model: completion.model || primaryModel,
        usage: completion.usage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: `AI service error: ${error.message}`,
        fallbackMessage: "I'm experiencing technical difficulties. Please try again in a moment."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});