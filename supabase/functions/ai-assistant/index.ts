
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
You are a helpful AI trading assistant. You help users with:

1. GENERAL Q&A: Answer general questions related to trading and account management with clear and concise information.

2. TRADING EXECUTION: Execute trades, strategies, and commands based on user instructions. Format trade execution commands as [TRADE:operation:instrument:quantity] for system recognition.

3. SYSTEM ACCESS: Access the trading system to perform tasks as instructed. For buying, use [TRADE:buy:symbol:amount], for selling use [TRADE:sell:symbol:amount], for managing positions use [POSITION:action:id].

4. MARKET ANALYSIS: Provide insights on market conditions, trends, technical indicators, and potential trading opportunities based on available data.

5. ACCOUNT MANAGEMENT: Retrieve and explain account information, including balance, margin, open positions, and trading history.

Be concise, clear, and helpful. If you don't know something, be honest and suggest alternatives.
Avoid giving specific investment advice that could be construed as financial recommendations.

For secure operation, all command executions require explicit user confirmation.
`;

const COMMAND_PATTERNS = [
  {
    regex: /\[TRADE:(buy|sell):([\w\/]+):(\d+\.?\d*)\]/i,
    handler: 'executeTrade'
  },
  {
    regex: /\[POSITION:(close|modify):([\w-]+)\]/i,
    handler: 'managePosition'
  },
  {
    regex: /\[ACCOUNT:(balance|margin|summary)\]/i,
    handler: 'getAccountInfo'
  }
];

// Mock broker data for demo accounts
const mockBrokerData = {
  accountInfo: {
    balance: 10000,
    equity: 10232.45,
    marginLevel: 327.8,
    freeMargin: 9850.25,
    currency: 'USD',
  },
  positions: [
    {
      id: 'pos_abcd1234',
      instrument: 'EURUSD',
      type: 'buy',
      volume: 0.1,
      openPrice: 1.0872,
      currentPrice: 1.0892,
      profit: 20.00,
      pips: 20,
      openTime: new Date().toISOString(),
      stopLoss: 1.0822,
      takeProfit: 1.0972,
      accountType: 'demo',
    },
    {
      id: 'pos_efgh5678',
      instrument: 'BTCUSD',
      type: 'sell',
      volume: 0.05,
      openPrice: 36750.25,
      currentPrice: 36650.75,
      profit: 4.98,
      pips: 99.5,
      openTime: new Date(Date.now() - 86400000).toISOString(),
      accountType: 'demo',
    },
  ],
  recentTrades: [
    {
      id: 'trade_1234',
      instrument: 'GBPUSD',
      direction: 'buy',
      volume: 0.15,
      openPrice: 1.2635,
      closePrice: 1.2685,
      profit: 75.00,
      openTime: new Date(Date.now() - 172800000).toISOString(),
      closeTime: new Date(Date.now() - 86400000).toISOString(),
      status: 'closed',
      accountType: 'demo',
    },
    {
      id: 'trade_5678',
      instrument: 'ETHUSD',
      direction: 'sell',
      volume: 0.2,
      openPrice: 2368.50,
      closePrice: 2342.25,
      profit: 52.50,
      openTime: new Date(Date.now() - 259200000).toISOString(),
      closeTime: new Date(Date.now() - 172800000).toISOString(),
      status: 'closed',
      accountType: 'demo',
    },
  ],
  marketPrices: {
    EURUSD: 1.0892,
    GBPUSD: 1.2645,
    USDJPY: 151.35,
    BTCUSD: 36500.75,
    ETHUSD: 2365.50
  }
};

// Extract trading commands from assistant response
function extractCommands(response) {
  let commandsFound = [];
  
  for (const pattern of COMMAND_PATTERNS) {
    const matches = [...response.matchAll(pattern.regex)];
    for (const match of matches) {
      commandsFound.push({
        type: pattern.handler,
        action: match[1],
        target: match[2],
        quantity: match[3] || null,
        fullCommand: match[0]
      });
    }
  }
  
  return commandsFound;
}

// Execute mock trade for demo accounts
function executeMockTrade(action, instrument, quantity) {
  const price = mockBrokerData.marketPrices[instrument] || 100.00;
  const tradeId = `pos_${Math.random().toString(36).substring(2, 10)}`;
  
  return {
    success: true,
    tradeId,
    instrument,
    action,
    quantity,
    price,
    timestamp: new Date().toISOString(),
    message: `Successfully executed ${action} order for ${quantity} ${instrument} at price ${price}`,
  };
}

// Process trading commands in the assistant's response
function processCommands(response, isDemoAccount) {
  const commands = extractCommands(response);
  let processedResponse = response;
  let executionResults = [];
  
  if (commands.length > 0) {
    for (const cmd of commands) {
      let result = { success: false, message: 'Command not executed' };
      
      // Only execute commands in demo mode or if we have verification
      if (isDemoAccount || cmd.type === 'getAccountInfo') {
        switch (cmd.type) {
          case 'executeTrade':
            result = executeMockTrade(cmd.action, cmd.target, cmd.quantity);
            break;
          case 'managePosition':
            result = {
              success: true,
              message: `Position ${cmd.target} ${cmd.action}d successfully`
            };
            break;
          case 'getAccountInfo':
            result = {
              success: true,
              data: cmd.action === 'summary' 
                ? mockBrokerData.accountInfo 
                : mockBrokerData.accountInfo[cmd.action],
              message: `Account ${cmd.action} retrieved`
            };
            break;
        }
      }
      
      // Replace command with result
      processedResponse = processedResponse.replace(
        cmd.fullCommand,
        `**EXECUTED: ${cmd.fullCommand}**\n${result.message}`
      );
      
      executionResults.push(result);
    }
  }
  
  return {
    processedResponse,
    executionResults,
    hasCommands: commands.length > 0
  };
}

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

    // For demo purposes, we'll accept unauthorized requests but won't save them
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    const { query, conversationId, controlMode } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate response
    const mockResponse = generateMockResponse(query, Boolean(controlMode));
    
    // Process any trading commands in the response
    const isDemoAccount = true; // For now, all accounts are considered demo
    const { processedResponse, executionResults, hasCommands } = processCommands(mockResponse, isDemoAccount);
    
    // Store the conversation in the database if user is authenticated
    let updatedConversationId = conversationId;
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    const assistantMessage = {
      role: 'assistant',
      content: processedResponse,
      timestamp: new Date().toISOString(),
      metadata: hasCommands ? { executionResults } : undefined
    };
    
    if (session && conversationId) {
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
    } else if (session) {
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
        response: processedResponse,
        conversationId: updatedConversationId,
        executionResults: executionResults
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

// Enhanced function to generate responses with trading capabilities
function generateMockResponse(query: string, controlMode: boolean): string {
  const lowerQuery = query.toLowerCase();
  
  // Check if this is a trade execution request when control mode is on
  if (controlMode && (lowerQuery.includes('buy') || lowerQuery.includes('sell'))) {
    const instruments = ['EURUSD', 'BTCUSD', 'GBPUSD', 'ETHUSD', 'USDJPY'];
    let instrument = 'BTCUSD'; // Default
    
    // Try to determine instrument from query
    for (const i of instruments) {
      if (lowerQuery.includes(i.toLowerCase())) {
        instrument = i;
        break;
      }
    }
    
    // Try to determine volume/quantity
    const volumeMatch = lowerQuery.match(/(\d+\.?\d*)\s*(lot|bitcoin|btc|eth|euro|dollar|eur|usd)/i);
    const volume = volumeMatch ? parseFloat(volumeMatch[1]) : 0.1;
    
    // Determine if buy or sell
    const action = lowerQuery.includes('sell') ? 'sell' : 'buy';
    
    return `I'll execute a ${action} order for ${volume} ${instrument}. 

[TRADE:${action}:${instrument}:${volume}]

Would you like me to set a stop loss or take profit for this trade?`;
  }
  
  // Handle account information requests
  if (lowerQuery.includes('account') && (lowerQuery.includes('balance') || lowerQuery.includes('summary'))) {
    return `Here's your account information:

[ACCOUNT:summary]

Would you like to know about your open positions as well?`;
  }
  
  if (lowerQuery.includes('position') || lowerQuery.includes('portfolio') || lowerQuery.includes('open trades')) {
    return `You currently have 2 open positions:

1. Buy 0.1 EURUSD at 1.0872, currently +20.00 USD profit
2. Sell 0.05 BTCUSD at 36750.25, currently +4.98 USD profit

Total portfolio profit: +24.98 USD

Would you like to modify or close any of these positions?`;
  }
  
  if (lowerQuery.includes('broker') || lowerQuery.includes('connect')) {
    return "You're currently connected to a demo broker account. This allows you to practice trading with virtual funds and test all platform features without risking real money. All trades, positions, and account data you see are simulated. When you're ready to trade with real funds, you can connect a live broker from the Settings page.";
  }
  
  if (lowerQuery.includes('strategy') || lowerQuery.includes('trading plan')) {
    return "Creating a solid trading strategy is essential. Your strategy should include entry and exit rules, risk management parameters, and the markets you'll trade. Consider using our built-in strategy tools to backtest your ideas before trading real money. Would you like me to suggest some popular trading strategies that you could implement on this platform?";
  }
  
  if (lowerQuery.includes('risk') || lowerQuery.includes('management')) {
    return "Risk management is crucial for long-term trading success. A general rule is to risk no more than 1-2% of your account on any single trade. Based on your current demo account balance of $10,000, you should risk no more than $100-$200 per trade. You can set stop-loss levels in the trading interface to automatically limit potential losses. Would you like me to help you calculate the appropriate position size for your next trade?";
  }
  
  if (lowerQuery.includes('chart') || lowerQuery.includes('analysis') || lowerQuery.includes('technical')) {
    return "Our platform provides advanced charting tools with various indicators like RSI, MACD, and Bollinger Bands. To add these to your chart, visit the Analysis tab and select your preferred indicators from the toolbox on the right side of the screen. For BTCUSD specifically, the current technical analysis shows RSI at 58 (neutral), with resistance at $37,500 and support at $35,800. The MACD is showing a bullish crossover, suggesting potential upward momentum.";
  }
  
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return "Hello! I'm your AI trading assistant. I can help you with trading strategies, broker connections, market analysis, platform navigation, and even execute trades for you when Control Mode is enabled. How can I assist you today?";
  }
  
  if (lowerQuery.includes('control mode') || lowerQuery.includes('trade execution')) {
    return "Control Mode allows me to execute trades on your behalf when you give me specific instructions. When enabled, I can process commands to buy or sell assets, modify positions, and retrieve account information. All commands require your explicit confirmation before execution. You can toggle Control Mode in the assistant settings. Would you like me to enable Control Mode now?";
  }
  
  if (lowerQuery.includes('commands') || lowerQuery.includes('what can you do')) {
    return `Here are some commands and queries you can use:

1. Trading:
   - "Buy 0.1 BTCUSD"
   - "Sell 0.05 EURUSD"
   - "Close my GBPUSD position"

2. Account Information:
   - "Show my account balance"
   - "What's my free margin?"
   - "Show my open positions"

3. Analysis:
   - "Analyze BTCUSD on 4-hour timeframe"
   - "What's the technical outlook for EURUSD?"
   - "Show me support and resistance levels for ETHUSD"

4. Learning:
   - "Explain RSI indicator"
   - "How does leverage work?"
   - "What is a good risk management strategy?"

Remember to enable Control Mode if you want me to execute actual trading commands.`;
  }
  
  return "I'm your AI trading assistant. I can help you with trading strategies, broker connections, market analysis, platform navigation, and even execute trades for you when Control Mode is enabled. Feel free to ask me specific questions about any of these topics, or simply tell me what you're trying to achieve with your trading today.";
}
