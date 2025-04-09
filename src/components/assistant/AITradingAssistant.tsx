
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, AlertCircle, RefreshCw, MicIcon, ShieldCheck } from 'lucide-react';
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
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: userMessage.content,
          conversationId,
          controlMode
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
    }
  };
  
  const retryLastMessage = () => {
    if (messages.length < 2) return;
    
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    const actualIndex = messages.length - 1 - lastUserMessageIndex;
    const lastUserMessage = messages[actualIndex];
    
    setQuery(lastUserMessage.content);
    setMessages(messages.slice(0, actualIndex + 1));
  };
  
  const handleCommandClick = (command: string) => {
    setQuery(command);
    setTimeout(() => {
      document.getElementById('query-input')?.focus();
    }, 100);
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[180px]">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
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
            <Button variant="outline" onClick={() => setConfirmTrade({ show: false, command: null })}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Trade Executed",
                description: "Your trade command has been executed successfully",
              });
              setConfirmTrade({ show: false, command: null });
            }}>
              Confirm Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AITradingAssistant;
