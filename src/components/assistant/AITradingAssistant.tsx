
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, AlertCircle, RefreshCw, MicIcon, ShieldCheck, CheckCircle, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssistantConversation } from '@/types/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
  
  // Speech recognition setup
  const [isListening, setIsListening] = useState(false);
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  const setupSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      
      if (speechRecognition.current) {
        speechRecognition.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
        };
        
        speechRecognition.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Voice Input Error",
            description: "Could not recognize speech. Please try again or type your query.",
            variant: "destructive"
          });
        };
        
        speechRecognition.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  };
  
  const toggleListening = () => {
    if (!speechRecognition.current) {
      setupSpeechRecognition();
    }
    
    if (speechRecognition.current) {
      if (isListening) {
        speechRecognition.current.stop();
        setIsListening(false);
      } else {
        speechRecognition.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your query now",
        });
      }
    } else {
      toast({
        title: "Voice Input Not Available",
        description: "Your browser doesn't support voice input. Please type your query instead.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    // Initialize with welcome message if no messages
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    
    // Scroll to bottom whenever messages update
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Reset error when user logs in/out
    setError(null);
    
    // Fetch conversation history if authenticated
    const fetchConversation = async () => {
      if (!user) return;
      
      try {
        // Get the most recent conversation
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
          
          // Only set messages if we have some in the DB
          if (conversation.messages && conversation.messages.length > 0) {
            setMessages(conversation.messages as Message[]);
          }
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };
    
    fetchConversation();
    
    // Setup speech recognition
    setupSpeechRecognition();
    
    // Clean up speech recognition on unmount
    return () => {
      if (speechRecognition.current && isListening) {
        speechRecognition.current.stop();
      }
    };
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setQuery('');
    setLoading(true);
    setError(null);
    
    try {
      // Call the edge function to get AI response
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: userMessage.content,
          conversationId,
          controlMode
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data.error) throw new Error(data.error);
      
      // Update conversation ID if it's a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add AI response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.executionResults ? { executionResults: data.executionResults } : undefined
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Check if there are any suggested commands to update based on context
      updateSuggestedCommands(data.response);
      
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      setError(error.message || "Failed to get response from the assistant");
      
      toast({
        title: "Error",
        description: error.message || "Failed to get response from the assistant",
        variant: "destructive"
      });
      
      // Add error message
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
    // Analyze response to provide contextually relevant command suggestions
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
    
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    // Get the actual index in the original array
    const actualIndex = messages.length - 1 - lastUserMessageIndex;
    const lastUserMessage = messages[actualIndex];
    
    // Set the query and remove the last assistant message (if it exists)
    setQuery(lastUserMessage.content);
    setMessages(messages.slice(0, actualIndex + 1));
  };
  
  const handleCommandClick = (command: string) => {
    setQuery(command);
    setTimeout(() => {
      document.getElementById('query-input')?.focus();
    }, 100);
  };
  
  const renderMessage = (msg: Message, index: number) => {
    const isTradeExecution = msg.content.includes('[TRADE:') && msg.role === 'assistant';
    
    return (
      <div 
        key={index}
        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div 
          className={`
            ${msg.role === 'user' 
              ? 'bg-primary text-primary-foreground ml-6 md:ml-12' 
              : 'bg-muted text-foreground mr-6 md:mr-12'
            } 
            rounded-lg p-3 max-w-[85%] md:max-w-[80%]
          `}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              {msg.role === 'user' 
                ? <User className="h-5 w-5 text-primary-foreground opacity-70" /> 
                : <Bot className="h-5 w-5 text-foreground opacity-70" />
              }
            </div>
            <div>
              <div className="text-sm whitespace-pre-wrap">
                {controlMode && isTradeExecution ? (
                  <div className="relative">
                    <div className="bg-yellow-200 dark:bg-yellow-900 p-2 rounded-md mb-2 text-black dark:text-white">
                      <div className="flex items-center gap-1 font-semibold mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>Trade Execution Request</span>
                      </div>
                      <p className="text-xs mb-2">{msg.content.split('[TRADE:')[0]}</p>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => setConfirmTrade({ 
                            show: true,
                            command: msg.content.match(/\[TRADE:.*?\]/)?.[0] || null
                          })}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <p>{msg.content.replace(/\[TRADE:.*?\]/g, '')}</p>
                  </div>
                ) : (
                  msg.content
                )}
                
                {msg.metadata?.executionResults && (
                  <div className="mt-2 p-2 bg-background rounded border">
                    <p className="text-xs font-medium">Trade Execution Results:</p>
                    {msg.metadata.executionResults.map((result: any, i: number) => (
                      <div key={i} className="text-xs mt-1">
                        <span className={`font-semibold ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                          {result.success ? '✓ ' : '✗ '}
                        </span>
                        {result.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.timestamp && (
                <p className="text-xs opacity-50 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
          <Tabs defaultValue="chat" onValueChange={setActiveTab} className="w-[180px]">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
        <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col m-0 p-0">
          <div className="px-6">
            {controlMode && (
              <div className="bg-amber-100 dark:bg-amber-900/20 flex items-center gap-2 px-3 py-1.5 rounded-md mb-3 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Control Mode Enabled - Assistant can execute trading commands</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {suggestedCommands.map((cmd, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs truncate" 
                  onClick={() => handleCommandClick(cmd.command)}
                >
                  {cmd.text}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator className="mb-2" />
          
          <ScrollArea className="flex-grow px-6 pr-2">
            <div className="space-y-4 pt-2">
              {messages.map((msg, index) => renderMessage(msg, index))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-grow overflow-auto m-0 p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium">Assistant Settings</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="control-mode">Control Mode</Label>
                  <p className="text-xs text-muted-foreground">Allow the assistant to execute trading commands</p>
                </div>
                <Switch 
                  id="control-mode" 
                  checked={controlMode} 
                  onCheckedChange={setControlMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-commands">Voice Commands</Label>
                  <p className="text-xs text-muted-foreground">Enable speech-to-text input</p>
                </div>
                <Switch id="voice-commands" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expert-mode">Expert Mode</Label>
                  <p className="text-xs text-muted-foreground">Get more technical and detailed responses</p>
                </div>
                <Switch id="expert-mode" />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="font-medium">Connected Broker <Badge variant="outline">Demo</Badge></h3>
              <p className="text-sm text-muted-foreground">
                You're currently using a demo broker connection. All trades are simulated with virtual funds.
              </p>
              <Button variant="outline" className="w-full">
                Connect Real Broker
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="font-medium">Conversation Management</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  New Conversation
                </Button>
                <Button variant="outline" size="sm">
                  Clear History
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
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
