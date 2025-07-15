import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { assistantConversations } from '@/utils/supabaseHelpers';
import { AssistantConversation } from '@/types/supabase';
import { useAuth } from '@/providers/AuthProvider';
import useSpeechRecognition from '@/hooks/use-speech-recognition';
import { fetchMarketNews } from '@/services/aiService';
import { fetchTechnicalAnalysis, fetchCryptoMarketData, fetchCommodityPrices } from '@/services/marketApiService';
import { useMarketData } from '@/components/assistant/useMarketData';

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

interface AIAssistantContextType {
  // State
  query: string;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isListening: boolean;
  controlMode: boolean;
  autoRefreshEnabled: boolean;
  marketDataCollapsed: boolean;
  conversationId: string | null;
  confirmTrade: { show: boolean; command: string | null };
  suggestedCommands: CommandButton[];
  marketData: any;
  isLoadingMarketData: boolean;
  activeTab: string;
  
  // Actions
  setQuery: (q: string) => void;
  setControlMode: (mode: boolean) => void;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleListening: () => void;
  toggleMarketDataCollapsed: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCommandClick: (command: string) => void;
  retryLastMessage: () => void;
  refreshMarketData: () => void;
  handleTradeExecution: (confirmed: boolean) => void;
  handleTryWithoutLogin: () => void;
  setConfirmTrade: (state: { show: boolean; command: string | null }) => void;
  clearHistory: () => void;
  startNewChat: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};

interface AIAssistantProviderProps {
  children: ReactNode;
}

export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [controlMode, setControlMode] = useState(() => {
    const saved = localStorage.getItem('controlMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [confirmTrade, setConfirmTrade] = useState<{ show: boolean; command: string | null }>({ 
    show: false, 
    command: null 
  });
  const [marketDataCollapsed, setMarketDataCollapsed] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    const saved = localStorage.getItem('autoRefreshEnabled');
    return saved ? JSON.parse(saved) : true;
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
  } = useMarketData(setSuggestedCommands, 30000);
  
  const welcomeMessage: Message = useMemo(() => ({
    role: 'assistant',
    content: "Hello! I'm your advanced AI trading assistant. I can answer questions on virtually any topic, similar to ChatGPT, while specializing in trading strategies, market analysis, and financial insights. When Control Mode is enabled, I can even execute trades for you. What would you like to know about today?",
    timestamp: new Date().toISOString()
  }), []);
  
  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Persist controlMode setting
  useEffect(() => {
    localStorage.setItem('controlMode', JSON.stringify(controlMode));
  }, [controlMode]);
  
  // Persist autoRefreshEnabled setting
  useEffect(() => {
    localStorage.setItem('autoRefreshEnabled', JSON.stringify(autoRefreshEnabled));
  }, [autoRefreshEnabled]);
  
  const { isListening, toggleListening } = useSpeechRecognition((transcript) => {
    setQuery(transcript);
  });
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [messages, welcomeMessage]);
  
  useEffect(() => {
    setError(null);
    
    const fetchConversation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await assistantConversations.getLatest();
        
        if (error) {
          console.error('Error fetching conversation:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const conversation = data[0] as AssistantConversation;
          setConversationId(conversation.id);
          
          if (conversation.messages && conversation.messages.length > 0) {
            // Only use stored messages if localStorage doesn't have messages
            const localMessages = localStorage.getItem('chatHistory');
            if (!localMessages || JSON.parse(localMessages).length === 0) {
              setMessages(conversation.messages as Message[]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };
    
    fetchConversation();
  }, [user]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('chatHistory');
    setMessages([welcomeMessage]);
    setConversationId(null);
    setError(null);
    
    toast({
      title: "Chat history cleared",
      description: "Started a new conversation"
    });
  }, [welcomeMessage, toast]);
  
  const startNewChat = useCallback(() => {
    clearHistory();
  }, [clearHistory]);
  
  useEffect(() => {
    let refreshInterval: number | null = null;
    
    if (autoRefreshEnabled && !isLoadingMarketData) {
      refreshInterval = window.setInterval(() => {
        console.log('Auto-refreshing market data...');
        refreshMarketData();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (refreshInterval !== null) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefreshEnabled, isLoadingMarketData, refreshMarketData]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
            toast({
              title: "Data Fetch Error",
              description: "Could not get technical analysis data for " + symbol,
              variant: "destructive"
            });
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
          marketContextData.cryptoData = await fetchCryptoMarketData(['bitcoin', 'ethereum', 'ripple', 'solana', 'cardano']);
        } catch (err) {
          console.error('Error fetching crypto data for context:', err);
          toast({
            title: "Data Fetch Error",
            description: "Could not get cryptocurrency market data",
            variant: "destructive"
          });
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
          toast({
            title: "Data Fetch Error",
            description: "Could not get commodity price data",
            variant: "destructive"
          });
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
          
          marketContextData.marketNews = await fetchMarketNews(symbol ? [symbol] : undefined);
        } catch (err) {
          console.error('Error fetching market news for context:', err);
          toast({
            title: "Data Fetch Error",
            description: "Could not fetch latest market news",
            variant: "destructive"
          });
        }
      }
      
      if (Object.keys(marketContextData).length === 0) {
        try {
          marketContextData.cryptoData = await fetchCryptoMarketData(['bitcoin', 'ethereum']);
          marketContextData.marketNews = await fetchMarketNews(undefined, 2);
        } catch (err) {
          console.error('Error fetching baseline market data for context:', err);
          // Don't show toast for baseline data as it's not explicitly requested
        }
      }
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          query: userMessage.content,
          conversationId,
          controlMode,
          marketContextData
        }
      });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (data.error) {
        if (data.error.includes("OpenAI")) {
          toast({
            title: "OpenAI API Error",
            description: "There was an issue with the AI service. Please try again later.",
            variant: "destructive"
          });
          throw new Error(`OpenAI error: ${data.error}`);
        }
        throw new Error(data.error);
      }
      
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
      localStorage.setItem('chatHistory', JSON.stringify([...messages, userMessage, assistantMessage]));
      
      const updatedCommands = updateCommandsHelper(suggestedCommands, data.response);
      setSuggestedCommands(updatedCommands);
      
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      setError(error.message || "Failed to get response from the assistant");
      
      toast({
        title: "AI Assistant Error",
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
  }, [query, conversationId, controlMode, toast, updateCommandsHelper, suggestedCommands, messages]);
  
  const handleCommandClick = useCallback((command: string) => {
    setQuery(command);
    
    setTimeout(() => {
      const inputField = document.getElementById('query-input') as HTMLInputElement;
      if (inputField) {
        inputField.focus();
        const event = new Event('input', { bubbles: true });
        inputField.dispatchEvent(event);
      }
    }, 50);
  }, []);

  const retryLastMessage = useCallback(() => {
    if (messages.length < 2) return;
    
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    const actualIndex = messages.length - 1 - lastUserMessageIndex;
    const lastUserMessage = messages[actualIndex];
    
    setQuery(lastUserMessage.content);
    setMessages(messages.slice(0, actualIndex));
  }, [messages]);
  
  const toggleMarketDataCollapsed = useCallback(() => {
    setMarketDataCollapsed(prev => !prev);
  }, []);
  
  const handleTradeExecution = useCallback((confirmed: boolean) => {
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
  }, [confirmTrade, toast]);
  
  const handleTryWithoutLogin = useCallback(() => {
    setMessages([welcomeMessage]);
    toast({
      title: "Demo Mode Activated",
      description: "You're now using the AI Assistant without logging in. Your conversations won't be saved.",
    });
  }, [welcomeMessage, toast]);
  
  const value = useMemo(() => ({
    // State
    query,
    messages,
    loading,
    error,
    isListening,
    controlMode,
    autoRefreshEnabled,
    marketDataCollapsed,
    conversationId,
    confirmTrade,
    suggestedCommands,
    marketData,
    isLoadingMarketData,
    activeTab,
    
    // Actions
    setQuery,
    setControlMode,
    setAutoRefreshEnabled,
    setActiveTab,
    toggleListening,
    toggleMarketDataCollapsed,
    handleSubmit,
    handleCommandClick,
    retryLastMessage,
    refreshMarketData,
    handleTradeExecution,
    handleTryWithoutLogin,
    setConfirmTrade,
    clearHistory,
    startNewChat
  }), [
    query, messages, loading, error, isListening, controlMode, 
    autoRefreshEnabled, marketDataCollapsed, conversationId, confirmTrade,
    suggestedCommands, marketData, isLoadingMarketData, activeTab,
    setQuery, setControlMode, setAutoRefreshEnabled, setActiveTab,
    toggleListening, handleSubmit, handleCommandClick, retryLastMessage,
    refreshMarketData, handleTradeExecution, handleTryWithoutLogin,
    toggleMarketDataCollapsed, clearHistory, startNewChat
  ]);

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};
