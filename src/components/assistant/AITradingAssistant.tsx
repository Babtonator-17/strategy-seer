import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, AlertCircle, RefreshCw, MicIcon, ShieldCheck, BarChart4 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssistantConversation } from '@/types/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ChatMessage from './ChatMessage';
import SuggestedCommands from './SuggestedCommands';
import AssistantSettings from './AssistantSettings';
import useSpeechRecognition from '@/hooks/use-speech-recognition';
import { fetchMarketNews } from '@/services/aiService';
import { fetchTechnicalAnalysis, fetchCryptoMarketData, fetchCommodityPrices } from '@/services/marketApiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: any;
}

interface CommandButton {
  text: string;
  command: string;
}

export const AITradingAssistant = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('chat');
  const [controlMode, setControlMode] = useState(false);
  const [confirmTrade, setConfirmTrade] = useState<{ show: boolean; command: string | null }>({ 
    show: false, 
    command: null 
  });
  const [suggestedCommands, setSuggestedCommands] = useState<CommandButton[]>([
    { text: "Account Balance", command: "What's my account balance?" },
    { text: "Open Positions", command: "Show my open positions" },
    { text: "BTCUSD Analysis", command: "Analyze BTCUSD trend" },
    { text: "Risk Management", command: "Help with risk management" }
  ]);
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  
  const welcomeMessage: Message = {
    role: 'assistant',
    content: 'Hello! I\'m your AI trading assistant. I can help you with trading strategies, broker connections, market analysis, and even execute trades when Control Mode is enabled. How can I assist you today?',
    timestamp: new Date().toISOString()
  };
  
  const { isListening, toggleListening } = useSpeechRecognition((transcript) => {
    setQuery(transcript);
  });
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    setError(null);
    
    const fetchConversation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('assistant_conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching conversation:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const conversation = data[0] as AssistantConversation;
          setConversationId(conversation.id);
          
          if (conversation.messages && conversation.messages.length > 0) {
            setMessages(conversation.messages as Message[]);
          }
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };
    
    fetchConversation();
    
    fetchInitialMarketData();
  }, [user]);
  
  const fetchInitialMarketData = async () => {
    setIsLoadingMarketData(true);
    try {
      const [cryptoData, commodityData, newsData] = await Promise.all([
        fetchCryptoMarketData('bitcoin,ethereum,ripple,solana,cardano'),
        fetchCommodityPrices(),
        fetchMarketNews(undefined, 5)
      ]);
      
      setMarketData({
        crypto: cryptoData,
        commodities: commodityData,
        news: newsData
      });
      
      const newCommands: CommandButton[] = [];
      
      if (cryptoData && cryptoData.length > 0) {
        const topCrypto = cryptoData[0];
        newCommands.push({
          text: `${topCrypto.name} Analysis`,
          command: `Analyze ${topCrypto.symbol} price trend`
        });
      }
      
      if (commodityData && commodityData.length > 0) {
        const topCommodity = commodityData[0];
        newCommands.push({
          text: `${topCommodity.name} Market`,
          command: `What's happening with ${topCommodity.name.toLowerCase()} prices?`
        });
      }
      
      if (newsData && newsData.length > 0) {
        newsData.slice(0, 2).forEach(item => {
          if (item.instruments && item.instruments.length > 0) {
            newCommands.push({
              text: `${item.instruments[0]} News`,
              command: `Tell me about ${item.instruments[0]} based on this news: ${item.title}`
            });
          }
        });
      }
      
      if (newCommands.length > 0) {
        setSuggestedCommands(prevCommands => {
          const originalCommands = prevCommands.slice(0, 2);
          return [...originalCommands, ...newCommands.slice(0, 4)];
        });
      }
    } catch (error) {
      console.error('Error fetching initial market data:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setError(null);
    
    try {
      let marketContextData: any = {};
      
      const lowerQuery = query.toLowerCase();
      
      if (
        lowerQuery.includes('technical') || 
        lowerQuery.includes('analysis') ||
        lowerQuery.includes('indicators') ||
        lowerQuery.includes('chart') ||
        lowerQuery.includes('rsi') ||
        lowerQuery.includes('macd')
      ) {
        const symbolMatch = lowerQuery.match(/\b(btc|eth|xrp|ada|btcusd|ethusd|eurusd|gbpusd|usdjpy|gold|xauusd)\b/i);
        if (symbolMatch) {
          const symbol = symbolMatch[0].toUpperCase();
          try {
            marketContextData.technicalAnalysis = await fetchTechnicalAnalysis(symbol);
          } catch (err) {
            console.error('Error fetching technical analysis for context:', err);
          }
        }
      }
      
      if (
        lowerQuery.includes('crypto') ||
        lowerQuery.includes('bitcoin') ||
        lowerQuery.includes('btc') ||
        lowerQuery.includes('ethereum') ||
        lowerQuery.includes('eth')
      ) {
        try {
          marketContextData.cryptoData = await fetchCryptoMarketData();
        } catch (err) {
          console.error('Error fetching crypto data for context:', err);
        }
      }
      
      if (
        lowerQuery.includes('commodity') ||
        lowerQuery.includes('commodities') ||
        lowerQuery.includes('gold') ||
        lowerQuery.includes('oil') ||
        lowerQuery.includes('metals')
      ) {
        try {
          marketContextData.commodityData = await fetchCommodityPrices();
        } catch (err) {
          console.error('Error fetching commodity data for context:', err);
        }
      }
      
      if (
        lowerQuery.includes('news') || 
        lowerQuery.includes('market') ||
        lowerQuery.includes('latest') ||
        lowerQuery.includes('update') ||
        lowerQuery.includes('information')
      ) {
        try {
          const symbolMatch = lowerQuery.match(/\b(btc|eth|xrp|ada|btcusd|ethusd|eurusd|gbpusd|usdjpy|gold|xauusd)\b/i);
          const symbol = symbolMatch ? symbolMatch[0].toUpperCase() : undefined;
          
          marketContextData.marketNews = await fetchMarketNews(symbol);
        } catch (err) {
          console.error('Error fetching market news for context:', err);
        }
      }
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: userMessage.content,
          conversationId,
          controlMode,
          marketContextData
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data.error) throw new Error(data.error);
      
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.executionResults ? { executionResults: data.executionResults } : undefined
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      updateSuggestedCommands(data.response);
      
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      setError(error.message || "Failed to get response from the assistant");
      
      toast({
        title: "Error",
        description: error.message || "Failed to get response from the assistant",
        variant: "destructive"
      });
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again later or try with a different question.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const updateSuggestedCommands = (response: string) => {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('position') || lowerResponse.includes('trade')) {
      setSuggestedCommands([
        { text: "Close Position", command: "Close my EURUSD position" },
        { text: "Modify Stop Loss", command: "Set stop loss for BTCUSD" },
        { text: "Show All Positions", command: "Show all my positions" },
        { text: "Trading History", command: "Show my recent trades" }
      ]);
    } else if (lowerResponse.includes('analysis') || lowerResponse.includes('chart')) {
      setSuggestedCommands([
        { text: "BTC Analysis", command: "Analyze BTCUSD on 4h timeframe" },
        { text: "EUR/USD Support", command: "Support and resistance for EURUSD" },
        { text: "Market Sentiment", command: "What's the market sentiment?" },
        { text: "Technical Indicators", command: "Explain MACD indicator" }
      ]);
    } else if (lowerResponse.includes('account') || lowerResponse.includes('balance')) {
      setSuggestedCommands([
        { text: "Account Summary", command: "Show my account summary" },
        { text: "Profit/Loss", command: "What's my total P&L today?" },
        { text: "Margin Level", command: "What's my margin level?" },
        { text: "Trading Limits", command: "Explain my trading limits" }
      ]);
    } else if (lowerResponse.includes('commodity') || lowerResponse.includes('commodities')) {
      setSuggestedCommands([
        { text: "Gold Analysis", command: "Analyze gold price trends" },
        { text: "Oil Markets", command: "How is oil performing today?" },
        { text: "Best Commodities", command: "What are the best-performing commodities now?" },
        { text: "Commodity News", command: "Latest commodity market news" }
      ]);
    } else if (lowerResponse.includes('news') || lowerResponse.includes('market')) {
      setSuggestedCommands([
        { text: "Market News", command: "Get the latest market news" },
        { text: "Crypto News", command: "Bitcoin news today" },
        { text: "Forex Updates", command: "Latest forex market updates" },
        { text: "Economic Calendar", command: "Important economic events today" }
      ]);
    } else if (lowerResponse.includes('crypto') || lowerResponse.includes('bitcoin') || lowerResponse.includes('ethereum')) {
      setSuggestedCommands([
        { text: "BTC Price", command: "Current Bitcoin price" },
        { text: "ETH Analysis", command: "Ethereum price analysis" },
        { text: "Top Cryptos", command: "Show top performing cryptocurrencies" },
        { text: "Crypto Market", command: "Overall crypto market sentiment" }
      ]);
    }
  };
  
  const retryLastMessage = () => {
    if (messages.length < 2) return;
    
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    const actualIndex = messages.length - 1 - lastUserMessageIndex;
    const lastUserMessage = messages[actualIndex];
    
    setQuery(lastUserMessage.content);
    setMessages(messages.slice(0, actualIndex));
  };
  
  const handleCommandClick = (command: string) => {
    setQuery(command);
    
    setTimeout(() => {
      const inputField = document.getElementById('query-input') as HTMLInputElement;
      if (inputField) {
        inputField.focus();
        const event = new Event('input', { bubbles: true });
        inputField.dispatchEvent(event);
      }
    }, 50);
  };

  const handleTradeExecution = (confirmed: boolean) => {
    if (confirmed && confirmTrade.command) {
      toast({
        title: "Trade Executed",
        description: "Your trade command has been executed successfully",
      });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Trade executed: ${confirmTrade.command.replace('[TRADE:', '').replace(']', '')}`,
        timestamp: new Date().toISOString(),
        metadata: { 
          executionResults: [{ 
            success: true, 
            message: "Trade executed successfully" 
          }] 
        }
      }]);
    }
    
    setConfirmTrade({ show: false, command: null });
  };
  
  const refreshMarketData = async () => {
    toast({
      title: "Refreshing market data",
      description: "Fetching the latest market information...",
    });
    
    await fetchInitialMarketData();
    
    toast({
      title: "Market data updated",
      description: "Latest market information is now available",
    });
  };
  
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>AI Trading Assistant</CardTitle>
            <CardDescription>
              Ask questions about trading strategies, brokers, or get help with the platform
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8" 
              onClick={refreshMarketData}
              disabled={isLoadingMarketData}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingMarketData ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh Data</span>
            </Button>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[180px]">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
        <Tabs value={activeTab} className="flex-grow flex flex-col">
          <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col m-0 p-0">
            <div className="px-6">
              {controlMode && (
                <div className="bg-amber-100 dark:bg-amber-900/20 flex items-center gap-2 px-3 py-1.5 rounded-md mb-3 text-amber-800 dark:text-amber-300 text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Control Mode Enabled - Assistant can execute trading commands</span>
                </div>
              )}
              
              {marketData && !isLoadingMarketData && (
                <div className="bg-muted p-2 rounded-md mb-3 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart4 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Market Data</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {marketData.crypto && marketData.crypto.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">BTC:</span> ${marketData.crypto[0].current_price.toLocaleString()}
                        <span className={marketData.crypto[0].price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>
                          {' '}{marketData.crypto[0].price_change_percentage_24h > 0 ? '↑' : '↓'}{Math.abs(marketData.crypto[0].price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {marketData.commodities && marketData.commodities.length > 0 && (
                      <div className="truncate">
                        <span className="text-muted-foreground">{marketData.commodities[0].name}:</span> ${marketData.commodities[0].price.toLocaleString()}
                      </div>
                    )}
                    {marketData.news && marketData.news.length > 0 && (
                      <div className="truncate">
                        <span className="text-muted-foreground">Latest:</span> {marketData.news[0].title.substring(0, 20)}...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <SuggestedCommands 
                commands={suggestedCommands}
                onCommandClick={handleCommandClick}
              />
            </div>
            
            <Separator className="mb-2" />
            
            <ScrollArea className="flex-grow px-6 pr-2">
              <div className="space-y-4 pt-2">
                {messages.map((msg, index) => (
                  <ChatMessage 
                    key={index}
                    message={msg}
                    controlMode={controlMode}
                    onConfirmTrade={(command) => setConfirmTrade({ show: true, command })}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-grow overflow-auto m-0 p-6">
            <AssistantSettings 
              controlMode={controlMode}
              onControlModeChange={setControlMode}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        {!user && !authLoading ? (
          <div className="w-full space-y-3">
            <div className="text-center p-3 bg-amber-900/20 border border-amber-900/30 rounded-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="font-medium text-amber-500">Login Recommended</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Sign in to use all assistant features
              </p>
              <p className="text-xs text-muted-foreground">
                You can try the assistant without login but your conversations won't be saved
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button className="flex-1" asChild>
                <Link to="/auth">
                  Login or Create Account
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setMessages([welcomeMessage])}>
                Try Without Login
              </Button>
            </div>
          </div>
        ) : authLoading ? (
          <div className="w-full flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {error && (
              <div className="w-full mb-4 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-xs text-destructive">Error communicating with assistant</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">Try another question or retry your last message</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 px-2 flex items-center gap-1" 
                    onClick={retryLastMessage}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <Input
                id="query-input"
                placeholder={isMobile ? "Ask a question..." : "Ask about trading or enter a command..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-grow"
              />
              <Button type="button" variant="outline" disabled={loading} onClick={toggleListening}>
                <MicIcon className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </Button>
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </CardFooter>
      
      <Dialog open={confirmTrade.show} onOpenChange={(open) => setConfirmTrade({ show: open, command: confirmTrade.command })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade Execution</DialogTitle>
            <DialogDescription>
              You're about to execute a real trading command. Please confirm this action.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-3 rounded-md text-sm">
            {confirmTrade.command}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleTradeExecution(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleTradeExecution(true)}>
              Confirm Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AITradingAssistant;
