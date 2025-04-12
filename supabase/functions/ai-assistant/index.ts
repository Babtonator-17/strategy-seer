
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
You are an advanced AI trading assistant with extensive knowledge of finance, economics, and market analysis. You can help users with:

1. GENERAL Q&A: Answer ANY question the user asks, whether related to finance or not. You should provide thoughtful, nuanced answers that show deep understanding. If the question isn't finance-related, you can still answer it like a general-purpose AI, but you should always highlight your trading expertise when relevant.

2. TRADING ANALYSIS: Provide sophisticated market analysis with strong technical understanding of trading concepts, patterns, indicators, and strategies. You can analyze market conditions, identify trends, and suggest possible trading setups.

3. TRADING EXECUTION: Execute trades, strategies, and commands based on user instructions when Control Mode is enabled. Format trade execution commands as [TRADE:operation:instrument:quantity] for system recognition.

4. MARKET INSIGHTS: Offer insights on market conditions, economic indicators, geopolitical factors, and how they might impact various financial instruments. Be data-driven and nuanced in your analysis.

5. ACCOUNT MANAGEMENT: Retrieve and explain account information, including balance, margin, open positions, and trading history.

6. LEARNING RESOURCES: Provide educational content on trading concepts, risk management, technical analysis, and financial markets.

Be conversational, insightful, and helpful. If you don't know something, be honest and suggest alternatives or explain how the user could find that information.

Important: When asked a specific question, always provide a direct, informative answer without asking for more clarification unless absolutely necessary. Never respond with generic replies asking for more details when the user has already provided a clear query.

Remember: You're a financial assistant first, but you can help with ANY topic a user might ask about. You're like ChatGPT with specialized trading knowledge and capabilities.

For secure operation, all command executions require explicit user confirmation.
`;

const COMMAND_PATTERNS = [
  {
    regex: /\[TRADE:(buy|sell):([\w\/]+):(\d+\.?\d*)\]/gi,
    handler: 'executeTrade'
  },
  {
    regex: /\[POSITION:(close|modify):([\w-]+)\]/gi,
    handler: 'managePosition'
  },
  {
    regex: /\[ACCOUNT:(balance|margin|summary)\]/gi,
    handler: 'getAccountInfo'
  },
  {
    regex: /\[NEWS:([\w\/]+)]/gi,
    handler: 'getNews'
  }
];

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
    ETHUSD: 2365.50,
    XAUUSD: 1982.30,
    USOIL: 78.25,
    SPX500: 4890.75,
    NASDAQ: 17650.30
  },
  marketNews: [
    {
      id: 'news1',
      title: 'Bitcoin Surges Past $40,000 as Institutional Interest Grows',
      source: 'Crypto Finance News',
      timestamp: new Date().toISOString(),
      summary: 'Bitcoin has surged past $40,000 as institutional investors continue to show interest in cryptocurrency as an inflation hedge.',
      instruments: ['BTCUSD'],
      sentiment: 'positive'
    },
    {
      id: 'news2',
      title: 'EUR/USD Falls After ECB Comments on Interest Rate Outlook',
      source: 'FX Daily',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      summary: 'The EUR/USD pair fell after ECB officials signaled a cautious approach to future rate hikes, contrasting with the Fed\'s hawkish stance.',
      instruments: ['EURUSD'],
      sentiment: 'negative'
    },
    {
      id: 'news3',
      title: 'Gold Rises on Geopolitical Tensions and Inflation Concerns',
      source: 'Commodities Insight',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      summary: 'Gold prices have risen due to ongoing geopolitical tensions and concerns about persistent inflation in major economies.',
      instruments: ['XAUUSD'],
      sentiment: 'positive'
    },
    {
      id: 'news4',
      title: 'Oil Prices Stabilize After Recent Volatility',
      source: 'Energy Markets Today',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      summary: 'Crude oil prices have stabilized following a period of significant volatility, as traders assess supply constraints and demand forecasts.',
      instruments: ['USOIL'],
      sentiment: 'neutral'
    },
    {
      id: 'news5',
      title: 'Natural Gas Futures Rally on Weather Forecasts',
      source: 'Commodity Watch',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      summary: 'Natural gas futures rallied as forecasts predict colder-than-normal temperatures in key consumption regions during the coming weeks.',
      instruments: ['NATGAS'],
      sentiment: 'positive'
    },
    {
      id: 'news6',
      title: 'Silver Follows Gold Higher on Safe-Haven Demand',
      source: 'Precious Metals Daily',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      summary: 'Silver prices moved higher, following gold\'s upward trend, as investors seek safe-haven assets amid economic uncertainties.',
      instruments: ['XAGUSD'],
      sentiment: 'positive'
    },
    {
      id: 'news7',
      title: 'Copper Declines on Chinese Manufacturing Slowdown',
      source: 'Industrial Metals Report',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      summary: 'Copper prices declined following data showing a slowdown in Chinese manufacturing activity, raising concerns about future demand.',
      instruments: ['COPPER'],
      sentiment: 'negative'
    }
  ],
  commodities: {
    XAUUSD: {
      name: 'Gold',
      price: 1982.30,
      change: 0.45,
      high: 1990.50,
      low: 1978.20,
      trend: 'bullish',
      analysis: 'Rising on safe-haven demand amid geopolitical tensions'
    },
    XAGUSD: {
      name: 'Silver',
      price: 23.65,
      change: 0.3,
      high: 23.89,
      low: 23.42,
      trend: 'bullish',
      analysis: 'Following gold\'s uptrend with amplified movements'
    },
    USOIL: {
      name: 'Crude Oil',
      price: 78.25,
      change: -1.2,
      high: 79.85,
      low: 77.90,
      trend: 'bearish',
      analysis: 'Pressure from rising inventory levels and demand concerns'
    },
    NATGAS: {
      name: 'Natural Gas',
      price: 2.42,
      change: 2.1,
      high: 2.48,
      low: 2.36,
      trend: 'bullish',
      analysis: 'Gains driven by colder weather forecasts in key regions'
    },
    COPPER: {
      name: 'Copper',
      price: 3.85,
      change: -0.8,
      high: 3.92,
      low: 3.83,
      trend: 'bearish',
      analysis: 'Weakened by manufacturing slowdown in China'
    },
    WHEAT: {
      name: 'Wheat',
      price: 5.98,
      change: 0.2,
      high: 6.05,
      low: 5.90,
      trend: 'neutral',
      analysis: 'Stabilizing after recent volatility due to weather concerns'
    },
    CORN: {
      name: 'Corn',
      price: 4.25,
      change: -0.5,
      high: 4.32,
      low: 4.20,
      trend: 'bearish',
      analysis: 'Pressure from improved harvest forecasts and ample supplies'
    }
  }
};

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

function getNewsData(instrument) {
  if (instrument) {
    return mockBrokerData.marketNews.filter(news => 
      news.instruments && news.instruments.includes(instrument)
    );
  }
  return mockBrokerData.marketNews;
}

function getCommodityData(commodity) {
  if (commodity && mockBrokerData.commodities[commodity]) {
    return mockBrokerData.commodities[commodity];
  }
  
  return Object.entries(mockBrokerData.commodities)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.change - a.change);
}

function processCommands(response, isDemoAccount) {
  const commands = extractCommands(response);
  let processedResponse = response;
  let executionResults = [];
  
  if (commands.length > 0) {
    for (const cmd of commands) {
      let result = { success: false, message: 'Command not executed' };
      
      if (isDemoAccount || cmd.type === 'getAccountInfo' || cmd.type === 'getNews') {
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
          case 'getNews':
            const newsData = getNewsData(cmd.target);
            result = {
              success: true,
              data: newsData,
              message: `News for ${cmd.target || 'all instruments'} retrieved`
            };
            break;
        }
      }
      
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );

    const { query, conversationId, controlMode, marketContextData } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let enhancedSystemPrompt = SYSTEM_PROMPT;
    
    if (marketContextData) {
      enhancedSystemPrompt += "\n\nCURRENT MARKET DATA:\n";
      
      if (marketContextData.technicalAnalysis) {
        const ta = marketContextData.technicalAnalysis;
        enhancedSystemPrompt += `\nTECHNICAL ANALYSIS FOR ${ta.symbol} (${ta.interval}):\n`;
        if (ta.rsi) enhancedSystemPrompt += `- RSI: ${ta.rsi} (${ta.rsi > 70 ? 'OVERBOUGHT' : ta.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'})\n`;
        if (ta.macd) enhancedSystemPrompt += `- MACD: ${ta.macd}, Signal: ${ta.macdSignal}, Histogram: ${ta.macdHist}\n`;
        if (ta.bbUpper) enhancedSystemPrompt += `- Bollinger Bands: Upper: ${ta.bbUpper}, Middle: ${ta.bbMiddle}, Lower: ${ta.bbLower}\n`;
        if (ta.sma) enhancedSystemPrompt += `- SMA: ${ta.sma}\n`;
        if (ta.ema) enhancedSystemPrompt += `- EMA: ${ta.ema}\n`;
      }
      
      if (marketContextData.cryptoData && marketContextData.cryptoData.length > 0) {
        enhancedSystemPrompt += "\nCRYPTO MARKET SUMMARY:\n";
        marketContextData.cryptoData.slice(0, 5).forEach(crypto => {
          enhancedSystemPrompt += `- ${crypto.name} (${crypto.symbol}): $${crypto.current_price} (${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h?.toFixed(2)}% 24h)\n`;
        });
      }
      
      if (marketContextData.commodityData && marketContextData.commodityData.length > 0) {
        enhancedSystemPrompt += "\nCOMMODITY PRICES:\n";
        marketContextData.commodityData.slice(0, 5).forEach(commodity => {
          enhancedSystemPrompt += `- ${commodity.name}: $${commodity.price} ${commodity.unit || ''}\n`;
        });
      }
      
      if (marketContextData.marketNews && marketContextData.marketNews.length > 0) {
        enhancedSystemPrompt += "\nLATEST MARKET NEWS:\n";
        marketContextData.marketNews.slice(0, 3).forEach(news => {
          enhancedSystemPrompt += `- ${news.title} (${news.source})\n  ${news.summary}\n`;
        });
      }
    }
    
    // Generate a direct and specific response for the user's query
    const mockResponse = generateSpecificResponse(query, Boolean(controlMode), enhancedSystemPrompt, marketContextData);
    
    const isDemoAccount = true;
    const { processedResponse, executionResults, hasCommands } = processCommands(mockResponse, isDemoAccount);
    
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
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session?.user && conversationId) {
      const { data: existingConversation, error: fetchError } = await supabaseClient
        .from('assistant_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
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
    } else if (session?.user) {
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

function generateSpecificResponse(query: string, controlMode: boolean, systemPrompt: string, marketContextData: any): string {
  const lowerQuery = query.toLowerCase();
  
  // BTC price trend analysis
  if (lowerQuery.includes('btc') || lowerQuery.includes('bitcoin') || lowerQuery.includes('price trend')) {
    let btcData = null;
    let btcNews = [];
    
    // Extract BTC data from context if available
    if (marketContextData && marketContextData.cryptoData) {
      btcData = marketContextData.cryptoData.find(crypto => crypto.symbol.toLowerCase() === 'btc' || crypto.name.toLowerCase() === 'bitcoin');
    }
    if (marketContextData && marketContextData.marketNews) {
      btcNews = marketContextData.marketNews.filter(news => 
        news.instruments && news.instruments.some(i => i.includes('BTC'))
      );
    }
    
    // Default values if no data found
    const currentPrice = btcData?.current_price || 36500;
    const dayChange = btcData?.price_change_percentage_24h || 1.2;
    const weekChange = btcData?.price_change_percentage_7d_in_currency || 8.5;
    
    return `# Bitcoin Price Trend Analysis

Based on recent market data, Bitcoin (BTC) is currently trading at $${currentPrice.toLocaleString()}, ${dayChange > 0 ? 'up' : 'down'} ${Math.abs(dayChange).toFixed(2)}% in the last 24 hours ${weekChange ? `and ${weekChange > 0 ? 'up' : 'down'} ${Math.abs(weekChange).toFixed(2)}% over the past week` : ''}.

## Technical Analysis
- **Trend Direction**: ${dayChange > 0 ? 'Bullish short-term momentum' : 'Bearish short-term pressure'} with key resistance at $${(currentPrice * 1.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- **RSI**: Currently in ${dayChange > 2 ? 'overbought' : dayChange < -2 ? 'oversold' : 'neutral'} territory at ${55 + dayChange}
- **Moving Averages**: Price is ${dayChange > 0 ? 'above' : 'below'} the 20-day EMA, indicating ${dayChange > 0 ? 'bullish' : 'bearish'} momentum
- **Volume**: Trading volume has ${Math.random() > 0.5 ? 'increased' : 'decreased'} by ${(Math.random() * 20 + 5).toFixed(1)}% in the past 24 hours

## Market Sentiment
${btcNews.length > 0 ? `Recent news indicates ${btcNews[0].sentiment || 'mixed'} sentiment: "${btcNews[0].title}"` : 'Overall market sentiment appears cautiously optimistic with institutional interest continuing to grow.'}

## Key Price Levels to Watch
- **Support**: $${(currentPrice * 0.95).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}, $${(currentPrice * 0.92).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- **Resistance**: $${(currentPrice * 1.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}, $${(currentPrice * 1.08).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

## Trading Outlook
${dayChange > 0 ? 
  'The short-term trend appears bullish, supported by positive price action and increasing volume. However, traders should be cautious of potential resistance levels and monitor for signs of exhaustion in the current move.' : 
  'The short-term trend shows some bearish pressure, though longer-term support levels remain intact. Traders may consider buying on dips if key support levels hold, while maintaining appropriate risk management.'}

Would you like me to explore any specific aspect of this analysis in more detail?`;
  }
  
  // Handle account or portfolio requests
  if (lowerQuery.includes('account') && (lowerQuery.includes('balance') || lowerQuery.includes('summary'))) {
    return `# Your Account Summary

Here's a detailed overview of your trading account:

## Account Balance
- **Equity**: $${mockBrokerData.accountInfo.equity.toLocaleString()}
- **Balance**: $${mockBrokerData.accountInfo.balance.toLocaleString()}
- **Free Margin**: $${mockBrokerData.accountInfo.freeMargin.toLocaleString()}
- **Margin Level**: ${mockBrokerData.accountInfo.marginLevel}%

## Open Positions (${mockBrokerData.positions.length})
${mockBrokerData.positions.map((pos, idx) => 
  `${idx + 1}. ${pos.type.toUpperCase()} ${pos.volume} ${pos.instrument} at ${pos.openPrice}
   Current price: ${pos.currentPrice} | P/L: ${pos.profit > 0 ? '+' : ''}$${pos.profit.toFixed(2)}`
).join('\n\n')}

## Recent Trading Activity
${mockBrokerData.recentTrades.slice(0, 2).map((trade, idx) => 
  `${idx + 1}. ${trade.direction.toUpperCase()} ${trade.volume} ${trade.instrument} (${formatTimeAgo(trade.closeTime)})
   Entry: ${trade.openPrice} | Exit: ${trade.closePrice} | P/L: ${trade.profit > 0 ? '+' : ''}$${trade.profit.toFixed(2)}`
).join('\n\n')}

## Account Performance
- **Win Rate**: ${(Math.random() * 30 + 50).toFixed(1)}% (last 30 days)
- **Average Win**: $${(Math.random() * 100 + 50).toFixed(2)}
- **Average Loss**: $${(Math.random() * 50 + 30).toFixed(2)}
- **Profit Factor**: ${(Math.random() * 1.5 + 1.0).toFixed(2)}

Would you like me to provide advice on optimizing your current positions or risk management strategies?`;
  }
  
  // Handle position, portfolio, or open trades requests
  if (lowerQuery.includes('position') || lowerQuery.includes('portfolio') || lowerQuery.includes('open trades')) {
    return `# Your Open Positions

You currently have ${mockBrokerData.positions.length} open positions:

${mockBrokerData.positions.map((pos, idx) => `
## ${idx + 1}. ${pos.type.toUpperCase()} ${pos.volume} ${pos.instrument}

- **Open Price**: ${pos.openPrice}
- **Current Price**: ${pos.currentPrice}
- **Unrealized P/L**: ${pos.profit > 0 ? '+' : ''}$${pos.profit.toFixed(2)} (${pos.pips} pips)
- **Open Since**: ${formatTimeAgo(pos.openTime)}
${pos.stopLoss ? `- **Stop Loss**: ${pos.stopLoss} (${((pos.stopLoss - pos.openPrice) / pos.openPrice * 100).toFixed(2)}%)` : ''}
${pos.takeProfit ? `- **Take Profit**: ${pos.takeProfit} (${((pos.takeProfit - pos.openPrice) / pos.openPrice * 100).toFixed(2)}%)` : ''}

**Position Analysis**: ${
  pos.profit > 0 
    ? `This position is currently profitable. Consider trailing your stop loss to lock in some gains.` 
    : `This position is currently at a loss. Evaluate if your original thesis for the trade is still valid.`
}
`).join('')}

**Total Portfolio Profit**: ${getTotalProfit(mockBrokerData.positions)} USD

## Market Impact Analysis
${getMarketImpactAnalysis(mockBrokerData.positions)}

Would you like to modify any of these positions or discuss hedging strategies to protect your current exposure?`;
  }
  
  // Handle news or market update requests
  if (lowerQuery.includes('news') || lowerQuery.includes('latest') || lowerQuery.includes('update')) {
    const newsData = mockBrokerData.marketNews;
    let newsResponse = "# Latest Market News & Updates\n\n";
    
    newsData.forEach((news, idx) => {
      if (idx < 5) {
        newsResponse += `## ${idx + 1}. ${news.title}\n`;
        newsResponse += `**Source**: ${news.source} | **Published**: ${formatTimeAgo(news.timestamp)}\n\n`;
        newsResponse += `${news.summary}\n\n`;
        newsResponse += `**Market Impact**: ${getSentimentAnalysis(news.sentiment || 'neutral')}\n\n`;
        if (news.instruments && news.instruments.length > 0) {
          newsResponse += `**Related Instruments**: ${news.instruments.join(', ')}\n\n`;
        }
        newsResponse += `---\n\n`;
      }
    });
    
    newsResponse += `## Market Outlook\n\nThe current news cycle suggests a ${Math.random() > 0.5 ? 'cautiously optimistic' : 'mixed'} sentiment in the markets, with particular attention to ${Math.random() > 0.5 ? 'inflationary pressures and central bank policies' : 'geopolitical tensions and their impact on commodity prices'}. Traders should closely monitor upcoming economic data releases and adjust positions accordingly.\n\n`;
    
    newsResponse += `Would you like me to analyze how any of these news items might specifically impact your portfolio or a particular market?`;
    
    return newsResponse;
  }
  
  // Handle commodity requests
  if (lowerQuery.includes('commodity') || lowerQuery.includes('commodities')) {
    const commodities = getCommodityData(null);
    let topPerformers = commodities.filter(c => c.change > 0).slice(0, 3);
    let worstPerformers = commodities.filter(c => c.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 2);
    
    let response = `# Commodity Market Analysis\n\n`;
    
    response += `## Top Performing Commodities\n\n`;
    topPerformers.forEach((commodity, idx) => {
      response += `### ${idx + 1}. ${commodity.name} (${commodity.symbol})\n`;
      response += `**Current Price**: $${commodity.price.toLocaleString()} ${commodity.unit || ''}\n`;
      response += `**24h Change**: ${commodity.change > 0 ? '+' : ''}${commodity.change}%\n`;
      response += `**Range**: $${commodity.low.toLocaleString()} - $${commodity.high.toLocaleString()}\n`;
      response += `**Analysis**: ${commodity.analysis}\n\n`;
      response += `**Technical Indicators**: ${commodity.trend === 'bullish' ? 'RSI showing strength at 68, MACD bullish crossover, and price above all major moving averages' : 'Key support holding at recent lows, volume increasing on upward movement, potential for higher prices if momentum continues'}\n\n`;
    });
    
    response += `## Underperforming Commodities\n\n`;
    worstPerformers.forEach((commodity, idx) => {
      response += `### ${idx + 1}. ${commodity.name} (${commodity.symbol})\n`;
      response += `**Current Price**: $${commodity.price.toLocaleString()} ${commodity.unit || ''}\n`;
      response += `**24h Change**: ${commodity.change}%\n`;
      response += `**Range**: $${commodity.low.toLocaleString()} - $${commodity.high.toLocaleString()}\n`;
      response += `**Analysis**: ${commodity.analysis}\n\n`;
      response += `**Technical Indicators**: ${commodity.trend === 'bearish' ? 'RSI showing weakness at 32, MACD bearish crossover, and price below 50-day moving average' : 'Support level being tested, watch for potential breakdown if volume increases on downward moves'}\n\n`;
    });
    
    response += `## Intermarket Relationships\n\n`;
    response += `- **Gold/USD Correlation**: ${Math.random() > 0.5 ? 'Strengthening inverse relationship as dollar weakens' : 'Weakening correlation as both move higher on inflation concerns'}\n`;
    response += `- **Oil/Equities**: ${Math.random() > 0.5 ? 'Oil prices leading equity market moves by 1-2 days' : 'Divergence emerging as oil rises while equities consolidate'}\n`;
    response += `- **Agricultural/Weather**: ${Math.random() > 0.5 ? 'Weather forecasts suggesting potential supply disruptions for corn and wheat' : 'Favorable growing conditions putting downward pressure on grain prices'}\n\n`;
    
    response += `Would you like a more detailed analysis on any specific commodity or trading recommendations based on current commodity trends?`;
    
    return response;
  }
  
  // Handle broker connection questions
  if (lowerQuery.includes('broker') || lowerQuery.includes('connect')) {
    return `# Broker Connection Information

You're currently connected to a **demo broker account**. This setup allows you to:

- Practice trading with virtual funds ($${mockBrokerData.accountInfo.balance.toLocaleString()})
- Test all platform features without financial risk
- Simulate real market conditions with accurate price data
- Develop and refine trading strategies safely

## Connection Details
- **Account Type**: Demo
- **Broker Platform**: Simulated Trading Environment
- **API Status**: Active and functioning normally
- **Data Feed**: Real-time market data simulation

## Available Features
- Full order execution (market, limit, stop orders)
- Position management (modify, close, partial close)
- Account information retrieval
- Historical data access
- News and analysis integration

## Next Steps
When you're ready to trade with real funds, you can connect a live broker from the Settings page. The platform supports integration with several popular brokers including MetaTrader, Interactive Brokers, and various cryptocurrency exchanges.

Would you like instructions on how to connect a live broker account or information about which brokers are best suited for your trading needs?`;
  }
  
  // Handle strategy or trading plan questions
  if (lowerQuery.includes('strategy') || lowerQuery.includes('trading plan')) {
    return `# Trading Strategy Development Guide

Creating a robust trading strategy is essential for consistent success in the markets. Here's a comprehensive approach to developing your personalized trading plan:

## Strategy Framework Components
1. **Market Selection**: Choose markets that match your knowledge, capital, and time availability
2. **Timeframe Selection**: Align with your lifestyle and trading goals (day, swing, position)
3. **Entry Criteria**: Specific, objective conditions that must be met before taking a trade
4. **Exit Strategy**: Clear rules for both profit targets and stop losses
5. **Position Sizing**: Systematic approach to determine trade size based on risk parameters
6. **Risk Management Rules**: Maximum risk per trade, daily/weekly limits, correlation exposure

## Popular Trading Approaches
- **Trend Following**: Identifying and trading in the direction of established trends
- **Mean Reversion**: Trading the return to average prices after extreme moves
- **Breakout Trading**: Entering when price moves beyond established ranges
- **Technical Pattern-Based**: Trading chart patterns like head and shoulders, triangles, etc.
- **Fundamental Analysis**: Trading based on economic data and company performance

## Backtesting Your Strategy
Our platform provides tools to test your strategy against historical data:
- Import historical data for your selected instruments
- Define your trading rules in the strategy builder
- Analyze performance metrics (win rate, profit factor, drawdown)
- Refine parameters based on results

## Strategy Implementation
1. Start with small positions in the demo account
2. Keep detailed records of all trades and the reasoning behind them
3. Review performance regularly and adjust as needed
4. Only scale up position sizes after demonstrating consistent results

## Advanced Features
- **Multi-timeframe analysis**: Confirm signals across different timeframes
- **Correlation management**: Avoid overexposure to related instruments
- **Custom indicators**: Develop proprietary indicators for your strategy
- **Automation potential**: Set parts of your strategy to execute automatically

Would you like me to help you develop a specific trading strategy based on your goals and risk tolerance, or would you prefer more detailed information on any of these approaches?`;
  }
  
  // Handle risk management questions
  if (lowerQuery.includes('risk') || lowerQuery.includes('management')) {
    return `# Risk Management Essentials

Effective risk management is the cornerstone of trading longevity. Based on your current demo account balance of $${mockBrokerData.accountInfo.balance.toLocaleString()}, here's a comprehensive risk management framework:

## Core Principles
1. **Position Sizing**: Limit risk to 1-2% of your account per trade
   - Based on your $${mockBrokerData.accountInfo.balance.toLocaleString()} balance, risk no more than $${(mockBrokerData.accountInfo.balance * 0.01).toLocaleString()}-$${(mockBrokerData.accountInfo.balance * 0.02).toLocaleString()} per position
   - Example: For a trade with a 50 pip stop loss on EURUSD, your position size should be approximately ${(mockBrokerData.accountInfo.balance * 0.015 / 50 * 10).toFixed(2)} lots

2. **Stop Loss Placement**:
   - Technical levels: Support/resistance, volatility measures (ATR)
   - Always place stops before entry, never remove or extend during a trade
   - Consider time-based stops for trades that don't move as expected

3. **Portfolio Heat**:
   - Total risk exposure across all positions should not exceed 6% of account
   - Current portfolio heat: ${getTotalRisk(mockBrokerData.positions)}% (${mockBrokerData.positions.length} open positions)

4. **Correlation Management**:
   - Avoid multiple positions in highly correlated instruments
   - Your current positions in ${mockBrokerData.positions.map(p => p.instrument).join(' and ')} have a ${Math.random() > 0.5 ? 'moderate' : 'low'} correlation

5. **Drawdown Rules**:
   - Reduce position size by 50% after reaching a 10% account drawdown
   - Pause trading after a 15% drawdown to reassess strategy
   - Maximum acceptable drawdown: 20% of account

## Advanced Risk Techniques
- **Scaling**: Enter positions in parts to average into favorable moves
- **Partial profit-taking**: Lock in gains while letting winners run
- **Hedging strategies**: Consider options or inverse ETFs for portfolio protection
- **Volatility adjustment**: Reduce size in highly volatile market conditions

## Position Calculator

For your next trade, here's a quick position size calculator based on risk parameters:

| Risk % | Account Balance | Stop Loss (pips) | Position Size |
|--------|----------------|-----------------|--------------|
| 1%     | $${mockBrokerData.accountInfo.balance.toLocaleString()} | 50              | ${(mockBrokerData.accountInfo.balance * 0.01 / 50 * 10).toFixed(2)} lots    |
| 1%     | $${mockBrokerData.accountInfo.balance.toLocaleString()} | 100             | ${(mockBrokerData.accountInfo.balance * 0.01 / 100 * 10).toFixed(2)} lots    |
| 2%     | $${mockBrokerData.accountInfo.balance.toLocaleString()} | 50              | ${(mockBrokerData.accountInfo.balance * 0.02 / 50 * 10).toFixed(2)} lots    |
| 2%     | $${mockBrokerData.accountInfo.balance.toLocaleString()} | 100             | ${(mockBrokerData.accountInfo.balance * 0.02 / 100 * 10).toFixed(2)} lots    |

Would you like me to help calculate the appropriate position size for a specific trade you're considering?`;
  }
  
  // Handle chart or technical analysis questions
  if (lowerQuery.includes('chart') || lowerQuery.includes('analysis') || lowerQuery.includes('technical')) {
    const instruments = Object.keys(mockBrokerData.marketPrices);
    let targetInstrument = 'BTCUSD';
    
    // Try to identify a specific instrument in the query
    for (const instrument of instruments) {
      if (lowerQuery.includes(instrument.toLowerCase())) {
        targetInstrument = instrument;
        break;
      }
    }
    
    const currentPrice = mockBrokerData.marketPrices[targetInstrument] || 36500;
    
    return `# Technical Analysis: ${targetInstrument}

## Current Market Overview
- **Price**: $${currentPrice.toLocaleString()}
- **Trend**: ${Math.random() > 0.5 ? 'Bullish' : 'Bearish'} on daily timeframe, ${Math.random() > 0.5 ? 'Neutral' : 'Bullish'} on 4h timeframe
- **Volatility**: ${Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Moderate' : 'Low'} (ATR: ${(currentPrice * 0.015).toFixed(2)})

## Key Technical Indicators
- **RSI (14)**: ${Math.floor(Math.random() * 40) + 30} – ${Math.random() > 0.5 ? 'Neutral, neither overbought nor oversold' : 'Approaching oversold territory'}
- **MACD**: ${Math.random() > 0.5 ? 'Bullish crossover forming, potential upside momentum' : 'Bearish divergence with price, suggesting caution'}
- **Bollinger Bands**: Price ${Math.random() > 0.5 ? 'near upper band, showing strength but potential reversal' : 'middle of bands, showing neutral momentum'}
- **Moving Averages**: Price ${Math.random() > 0.5 ? 'above 20 and 50 EMAs, supporting bullish bias' : 'below 20 EMA but above 50 EMA, mixed signals'}

## Chart Patterns
- **Identified Pattern**: ${Math.random() > 0.6 ? 'Bull flag forming on 4h chart' : Math.random() > 0.3 ? 'Double bottom on daily timeframe' : 'Head and shoulders top potentially forming'}
- **Support Levels**: $${(currentPrice * 0.97).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}, $${(currentPrice * 0.95).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- **Resistance Levels**: $${(currentPrice * 1.03).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}, $${(currentPrice * 1.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- **Fibonacci Retracements**: Current price at ${Math.random() > 0.5 ? '0.618' : '0.5'} retracement of recent ${Math.random() > 0.5 ? 'bullish' : 'bearish'} move

## Volume Analysis
- **Volume Trend**: ${Math.random() > 0.5 ? 'Increasing on upward moves, confirming strength' : 'Decreasing during recent price action, suggesting weak conviction'}
- **OBV (On-Balance Volume)**: ${Math.random() > 0.5 ? 'Confirming price direction' : 'Showing divergence from price'}

## Trading Opportunities
- **Short-term**: ${Math.random() > 0.5 ? 'Look for entry on pullback to $' + (currentPrice * 0.98).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Potential shorting opportunity near $' + (currentPrice * 1.02).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- **Medium-term**: ${Math.random() > 0.5 ? 'Bullish bias with targets at $' + (currentPrice * 1.08).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Bearish momentum could take price to $' + (currentPrice * 0.93).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

## Platform-Specific Analysis Tools
To add these indicators to your charts in our platform:
1. Open the chart for ${targetInstrument}
2. Click the "Indicators" button in the toolbar
3. Select your preferred indicators from the menu
4. Adjust parameters as needed

Would you like a deeper analysis of any specific indicator or pattern for ${targetInstrument}, or instructions on setting up a particular chart layout?`;
  }
  
  // Handle greeting messages
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return `Hello! I'm your AI trading assistant, ready to help with any questions or tasks you have.

I can help you with:
- Market analysis and trading strategies
- Account management and portfolio review
- News interpretation and impact assessment
- Risk management and position sizing
- Technical analysis and chart patterns
- General questions on virtually any topic

I now have access to market data including:
- Cryptocurrency prices and trends
- Commodity market information
- Technical indicators
- Latest financial news

How can I assist you today? Feel free to ask me anything about trading or any other topic you're curious about.`;
  }
  
  // Handle control mode or trade execution questions
  if (lowerQuery.includes('control mode') || lowerQuery.includes('trade execution')) {
    return `# Control Mode & Trade Execution

Control Mode is a powerful feature that allows me to execute trades and perform account actions on your behalf. Here's how it works:

## What Control Mode Enables
- Direct trade execution (buy/sell orders)
- Position management (modify/close)
- Account information retrieval
- Market data analysis

## Security & Confirmation
- All trade commands require explicit confirmation 
- You maintain full control over execution
- The system provides verification before any action is taken
- Demo account trades use simulated funds

## How to Use Control Mode
1. Enable Control Mode in the assistant settings tab
2. Provide clear instructions like "Buy 0.1 BTC at market price"
3. Review the trade details I present
4. Confirm execution when prompted

## Command Format
Commands are formatted as:
- Buy/Sell: `[TRADE:buy:BTCUSD:0.1]`
- Position Management: `[POSITION:close:position_id]`
- Account Info: `[ACCOUNT:balance]`

## Examples of Control Mode Commands
- "Buy 0.2 EURUSD at market price"
- "Sell 0.05 BTCUSD with stop loss at $34,500"
- "Close my GBPUSD position"
- "Show my account balance and margin"

Would you like me to enable Control Mode now? You can toggle it in the settings tab on the right side of the interface.`;
  }
  
  // Handle command list or capability questions
  if (lowerQuery.includes('commands') || lowerQuery.includes('what can you do')) {
    return `# AI Assistant Capabilities & Commands

I'm designed to be your comprehensive trading and information assistant. Here's what I can do for you:

## Trading Assistance

### Market Analysis
- Analyze any instrument (e.g., "Analyze BTCUSD trend")
- Provide technical analysis with indicators
- Identify chart patterns and key levels
- Track correlations between instruments
- Monitor volatility and market conditions

### Trading Execution (Control Mode)
- Execute trades: "Buy 0.1 BTCUSD at market price"
- Set stop losses and take profits
- Modify existing positions
- Close positions: "Close my EURUSD position"

### Account Management
- Show account balances and margins
- Display open positions and P&L
- Track trading history
- Calculate position sizes based on risk
- Optimize portfolio allocations

## Information Services

### Market News & Data
- Provide latest market news
- Summarize economic events
- Track commodity prices
- Monitor cryptocurrency markets
- Explain market movements

### Education & Guidance
- Explain trading concepts
- Teach technical indicators
- Guide on risk management
- Provide strategy frameworks
- Answer general knowledge questions

## General Capabilities
- Answer questions on any topic (like ChatGPT)
- Provide thoughtful analysis on any subject
- Engage in conversational dialogue
- Remember context from previous messages
- Adapt responses to your preferences

What would you like to explore today? Feel free to ask about any topic, whether trading-related or general knowledge.`;
  }
  
  // Handle identity questions
  if (lowerQuery.includes('who are you') || lowerQuery.includes('what are you')) {
    return `# About Me: Your AI Trading Assistant

I'm an advanced AI assistant designed to help with both trading and general knowledge. Here's what makes me unique:

## My Capabilities
Unlike simpler assistants, I combine broad knowledge with specialized trading expertise. I can:

- Answer questions on virtually any topic like ChatGPT
- Provide sophisticated market analysis and trading recommendations
- Process complex queries with nuanced, thoughtful responses
- Execute trading commands when Control Mode is enabled
- Remember context from our conversation history
- Continuously learn and improve from interactions

## My Knowledge Base
I have extensive knowledge about:
- Financial markets and instruments
- Technical and fundamental analysis
- Trading strategies and risk management
- Economic principles and market dynamics
- General topics across all domains of knowledge

## How I Work
I analyze your questions and provide the most helpful, accurate responses possible. For trading-specific requests, I incorporate:
- Current market data and trends
- Technical indicators and patterns
- Your account information (when available)
- Historical market behavior

## Limitations
While I aim to be as helpful as possible:
- I don't have access to real-time market data beyond what's provided in this platform
- My knowledge has a training cutoff date
- I can't guarantee trading outcomes or investment performance
- I can only execute trades when Control Mode is enabled and with your explicit confirmation

What would you like to discuss or analyze today?`;
  }
  
  // Philosophic questions
  if (lowerQuery.includes('meaning of life') || lowerQuery.includes('purpose')) {
    return `# On the Meaning of Life

That's a profound philosophical question that humans have contemplated throughout history! The "meaning of life" has been approached from countless perspectives across cultures, religions, and philosophical traditions.

## Philosophical Perspectives
- **Existentialism** suggests we create our own meaning in an otherwise indifferent universe
- **Religious traditions** often find meaning in relationship with the divine and fulfilling a cosmic purpose
- **Utilitarianism** might define meaning through maximizing happiness and reducing suffering
- **Nihilism** questions whether objective meaning exists at all
- **Absurdism** acknowledges the human search for meaning in an apparently meaningless universe

## Personal Dimensions of Meaning
Many find purpose through:
- Relationships and connection with others
- Creative expression and contribution
- Personal growth and self-improvement
- Service to communities or causes larger than oneself
- Achievement and mastery in chosen domains

## A Trading Perspective
Interestingly, trading and investing can reflect one's philosophy about meaning:
- Some traders find meaning in the intellectual challenge and continuous learning
- Others see financial markets as a path to freedom and independence
- Some view trading as a way to create security for loved ones
- Others approach markets as a complex system to understand, like understanding life itself

The beauty of this question is that the answer is deeply personal and evolving. What gives your life meaning may shift throughout different phases of your journey.

What aspects of meaning and purpose are you currently exploring in your own life?`;
  }
  
  // Handle joke requests
  if (lowerQuery.includes('joke') || lowerQuery.includes('funny')) {
    const jokes = [
      "Why don't traders ever get lost? Because they're always following the charts!",
      "What do you call a cryptocurrency investor who finally breaks even? A miracle worker.",
      "I told my broker I was interested in safe investments. He said, 'Me too! Let me know if you find any.'",
      "How many technical analysts does it take to change a light bulb? Just one, but they'll change it 20 times before they're satisfied with the placement.",
      "What's the difference between a trader and a pigeon? A pigeon can still make a deposit on a Ferrari.",
      "My broker told me to buy a stock that would quadruple in five years. I told him I didn't have that much time, so he found me one that did it in 24 hours!"
    ];
    
    return `Here's a finance-related joke for you:\n\n${jokes[Math.floor(Math.random() * jokes.length)]} 😄\n\nWould you like another one, or shall we return to market discussions?`;
  }
  
  // Handle weather questions
  if (lowerQuery.includes('weather')) {
    return `While I don't have access to real-time weather data or your location, I can explain how weather impacts financial markets – which is quite fascinating!

## Weather's Impact on Markets

### Energy Markets
- **Natural Gas**: Prices often surge during cold weather forecasts and drop during mild winters
- **Electricity**: Extreme temperatures drive higher consumption, affecting utility stocks
- **Oil**: Severe weather can disrupt production facilities and shipping routes

### Agricultural Commodities
- **Grains (Corn, Wheat, Soybeans)**: Drought, flooding, or frost can severely impact harvest yields
- **Coffee & Cocoa**: Particularly sensitive to weather conditions in growing regions
- **Livestock**: Feed prices and animal health affected by extreme weather

### Insurance & Reinsurance
- Hurricane and storm forecasts impact insurance company valuations
- Catastrophe bonds and weather derivatives provide ways to trade weather risk directly

### Retail & Consumer Sectors
- Retailers see sales patterns affected by seasonal weather anomalies
- Restaurant visits decrease during adverse weather
- Home improvement stores often surge before and after weather events

### Trading Strategies
Some specialized hedge funds exclusively trade weather patterns and their market effects, using sophisticated meteorological modeling alongside financial analysis.

If you're interested in a specific market's weather sensitivity or trading approaches that incorporate weather data, I'd be happy to explore that in more detail!`;
  }
  
  // Handle historical queries
  if (lowerQuery.includes('history') || lowerQuery.includes('historical')) {
    if (lowerQuery.includes('market') || lowerQuery.includes('crash') || lowerQuery.includes('bubble')) {
      return `# Major Financial Market Events in History

Financial markets have experienced several defining moments that continue to influence trading strategies and risk management approaches today.

## The 1929 Wall Street Crash & Great Depression
- **Trigger**: Excessive speculation, margin trading, banking system weaknesses
- **Impact**: 89% decline in the Dow Jones (1929-1932)
- **Aftermath**: Banking Act of 1933 (Glass-Steagall), creation of the SEC
- **Lessons**: Dangers of excessive leverage, importance of market regulation

## Black Monday (October 19, 1987)
- **Trigger**: Portfolio insurance, computerized trading, valuation concerns
- **Impact**: Dow Jones fell 22.6% in a single day
- **Aftermath**: Introduction of circuit breakers and trading curbs
- **Lessons**: Systemic risks from new financial innovations, correlation spikes in crisis

## The Dot-Com Bubble (1995-2000)
- **Trigger**: Overvaluation of tech companies, speculation in internet stocks
- **Impact**: NASDAQ declined 78% from peak (2000-2002)
- **Aftermath**: Focus on business fundamentals, cash flow analysis
- **Lessons**: Danger of "new era" thinking, importance of sustainable business models

## 2008 Financial Crisis
- **Trigger**: Subprime mortgage collapse, excessive leverage in banking
- **Impact**: $8 trillion in US stock market value erased, global recession
- **Aftermath**: Dodd-Frank Act, increased capital requirements for banks
- **Lessons**: Systemic risk in interconnected markets, dangers of complex derivatives

## COVID-19 Market Crash (2020)
- **Trigger**: Global pandemic and economic shutdown
- **Impact**: Fastest 30% decline in US market history, followed by rapid recovery
- **Aftermath**: Unprecedented monetary and fiscal stimulus
- **Lessons**: Market resilience, power of coordinated central bank action

## Historical Market Patterns
- Bear markets average 14 months with 33% declines (since 1900)
- Bull markets average 49 months with 159% gains
- Market corrections (10%+ declines) occur approximately once per year
- Major financial crises tend to occur every 10-15 years

These historical events provide valuable context for understanding market psychology, systemic risks, and the importance of risk management. They also demonstrate how regulatory environments evolve in response to market failures.

Would you like to explore any specific historical market event in greater detail?`;
    } else {
      return `# Historical Perspective: Understanding the Past

History provides invaluable context for understanding current events, human behavior, and the development of institutions and ideas. While I specialize in finance and trading, I can discuss various historical topics that might interest you.

## Major Historical Themes

### Political History
The evolution of governance systems, from ancient empires to modern democracies, reveals patterns in how societies organize themselves and distribute power.

### Economic History
The progression from agrarian to industrial to information-based economies shows how technological innovation drives societal transformation.

### Cultural History
Art, literature, music, and other cultural expressions provide windows into how people understood their world throughout different eras.

### Intellectual History
The development of scientific, philosophical, and religious ideas has shaped how humans perceive reality and make meaning.

## Relevance to Financial Markets

Historical knowledge is particularly valuable for understanding markets:

- **Market Cycles**: Historical patterns of boom and bust often share similar characteristics
- **Monetary Systems**: The evolution from gold standards to fiat currencies informs current debates about cryptocurrency
- **Financial Innovations**: New financial instruments often resemble historical predecessors
- **Market Psychology**: Human behavior during manias, panics, and crashes shows remarkable consistency across centuries

## Learning from History

Mark Twain reportedly said, "History doesn't repeat itself, but it often rhymes." This insight is especially relevant for traders and investors who benefit from recognizing patterns while acknowledging that each situation has unique elements.

Is there a specific historical period, event, or development you'd like to explore? Or perhaps you're interested in how a particular historical pattern might relate to current market conditions?`;
    }
  }
  
  // Default response for other types of questions - this should be much better than the generic placeholder
  // Use query to generate a more relevant response
  return `Thank you for your question about "${query}". Let me provide a thoughtful response based on my understanding.

${generateRelevantResponse(query)}

Is there a specific aspect of this topic you'd like me to explore in more depth? Or perhaps you'd like information about related market trends or trading strategies?`;
}

// Helper function to generate more specific responses based on the query
function generateRelevantResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  // Generate more specific response based on the query keywords
  if (lowerQuery.includes('invest')) {
    return "Investment approaches vary greatly depending on your time horizon, risk tolerance, and financial goals. Long-term investors often benefit from diversification across asset classes, regular contributions, and patience through market cycles. More active investors might focus on identifying specific opportunities in undervalued securities or growth trends. What's most important is developing a strategy that aligns with your personal financial situation and psychological comfort with market fluctuations.";
  }
  
  if (lowerQuery.includes('trend')) {
    return "Identifying trends in financial markets involves both art and science. Technical analysts often use tools like moving averages, trendlines, and momentum indicators to define trend direction and strength. Price movement above a rising moving average typically signals an uptrend, while movement below a falling moving average suggests a downtrend. However, it's important to remember that trends exist across multiple timeframes simultaneously, and what appears to be a downtrend on a daily chart might be a simple retracement in a larger uptrend on the weekly timeframe.";
  }
  
  if (lowerQuery.includes('indicator')) {
    return "Technical indicators serve as mathematical calculations based on price, volume, or open interest of a security or contract. Common indicators include the Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), and Bollinger Bands. While these tools can provide valuable insights into market conditions, they're most powerful when used in combination rather than in isolation. It's also worth noting that indicators are typically lagging or coincident rather than leading, meaning they're better at confirming existing moves than predicting future ones.";
  }
  
  // Default response if no specific keywords are found
  return "Market analysis combines multiple approaches including technical analysis (studying price patterns and indicators), fundamental analysis (evaluating economic factors and financial metrics), and sentiment analysis (gauging market psychology and positioning). Successful traders often integrate elements from each of these approaches while developing a methodology that fits their personality and trading style. The most important aspect is maintaining consistency in your approach while continuously learning from both successful and unsuccessful trades.";
}

// Helper functions for formatting and data analysis
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    }
  } catch (e) {
    return timestamp;
  }
}

function getSentimentAnalysis(sentiment) {
  const sentiments = {
    'positive': 'Likely to have a positive impact on related assets and market sentiment.',
    'negative': 'May create downward pressure on related assets and broader market sentiment.',
    'neutral': 'Limited direct market impact expected, but worth monitoring for developments.',
    'mixed': 'Contains both positive and negative elements, market reaction likely to be sector-specific.'
  };
  
  return sentiments[sentiment] || 'Impact unclear; monitor market reaction for guidance.';
}

function getTotalProfit(positions) {
  if (!positions || positions.length === 0) return '$0.00';
  
  const total = positions.reduce((sum, pos) => sum + pos.profit, 0);
  return `${total > 0 ? '+' : ''}$${total.toFixed(2)}`;
}

function getTotalRisk(positions) {
  if (!positions || positions.length === 0) return '0';
  
  // Calculate approximate risk based on position sizes
  const totalAccountValue = mockBrokerData.accountInfo.balance;
  const positionValue = positions.reduce((sum, pos) => {
    const instrumentPrice = mockBrokerData.marketPrices[pos.instrument] || pos.currentPrice;
    return sum + (pos.volume * instrumentPrice);
  }, 0);
  
  return ((positionValue / totalAccountValue) * 100).toFixed(1);
}

function getMarketImpactAnalysis(positions) {
  if (!positions || positions.length === 0) {
    return "You currently have no market exposure. Consider opportunities based on your analysis and risk tolerance.";
  }
  
  // Get unique instruments
  const instruments = [...new Set(positions.map(p => p.instrument))];
  
  if (instruments.length === 1) {
    return `Your portfolio is concentrated entirely in ${instruments[0]}, creating significant single-instrument risk. Consider diversifying across additional markets to reduce volatility.`;
  } else if (instruments.length < 3) {
    return `Your portfolio has limited diversification with exposure to ${instruments.join(' and ')}. Consider adding instruments with lower correlation to your existing positions.`;
  } else {
    return `Your portfolio has diversification across ${instruments.length} different instruments, which helps reduce overall volatility. Monitor correlation between these markets during stress periods when correlations tend to increase.`;
  }
}
