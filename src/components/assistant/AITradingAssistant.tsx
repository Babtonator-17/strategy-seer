
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssistantConversation } from '@/types/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSpeechRecognition from '@/hooks/use-speech-recognition';
import { fetchMarketNews } from '@/services/aiService';
import { fetchTechnicalAnalysis, fetchCryptoMarketData, fetchCommodityPrices } from '@/services/marketApiService';

import MessageList from './MessageList';
import SuggestedCommands from './SuggestedCommands';
import AssistantSettings from './AssistantSettings';
import ControlModeAlert from './ControlModeAlert';
import MarketDataDisplay from './MarketDataDisplay';
import QueryInput from './QueryInput';
import LoginPrompt from './LoginPrompt';
import TradeConfirmationDialog from './TradeConfirmationDialog';
import { useMarketData } from './useMarketData';

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
  
  const { 
    marketData, 
    isLoadingMarketData, 
    refreshMarketData,
    updateSuggestedCommands: updateCommandsHelper
  } = useMarketData(setSuggestedCommands);
  
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
  }, [user]);
  
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
          // Make sure to pass an array of strings here
          marketContextData.cryptoData = await fetchCryptoMarketData(['bitcoin', 'ethereum', 'ripple', 'solana', 'cardano']);
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
          
          // Pass an array for the symbol parameter
          marketContextData.marketNews = await fetchMarketNews(symbol ? [symbol] : undefined);
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
      
      const updatedCommands = updateCommandsHelper(suggestedCommands, data.response);
      setSuggestedCommands(updatedCommands);
      
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
  
  const handleRefreshMarketData = async () => {
    toast({
      title: "Refreshing market data",
      description: "Fetching the latest market information...",
    });
    
    await refreshMarketData();
    
    toast({
      title: "Market data updated",
      description: "Latest market information is now available",
    });
  };
  
  const handleTryWithoutLogin = () => {
    setMessages([welcomeMessage]);
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
              onClick={handleRefreshMarketData}
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
              <ControlModeAlert enabled={controlMode} />
              
              <MarketDataDisplay 
                marketData={marketData} 
                isLoading={isLoadingMarketData} 
              />
              
              <SuggestedCommands 
                commands={suggestedCommands}
                onCommandClick={handleCommandClick}
              />
            </div>
            
            <MessageList
              messages={messages}
              controlMode={controlMode}
              onConfirmTrade={(command) => setConfirmTrade({ show: true, command })}
            />
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
          <LoginPrompt 
            loading={authLoading}
            onTryWithoutLogin={handleTryWithoutLogin}
          />
        ) : authLoading ? (
          <LoginPrompt 
            loading={authLoading}
            onTryWithoutLogin={handleTryWithoutLogin}
          />
        ) : (
          <QueryInput
            query={query}
            setQuery={setQuery}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            isListening={isListening}
            toggleListening={toggleListening}
            retryLastMessage={retryLastMessage}
            isMobile={isMobile}
          />
        )}
      </CardFooter>
      
      <TradeConfirmationDialog
        show={confirmTrade.show}
        command={confirmTrade.command}
        onOpenChange={(open) => setConfirmTrade({ show: open, command: confirmTrade.command })}
        onConfirm={handleTradeExecution}
      />
    </Card>
  );
};

export default AITradingAssistant;
