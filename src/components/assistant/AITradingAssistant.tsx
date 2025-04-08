
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssistantConversation } from '@/types/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
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
  
  const welcomeMessage: Message = {
    role: 'assistant',
    content: 'Hello! I\'m your AI trading assistant. I can help you with trading strategies, broker connections, and market analysis. How can I assist you today?',
    timestamp: new Date().toISOString()
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
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Don't proceed if not authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant",
        variant: "destructive"
      });
      return;
    }
    
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
          conversationId
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
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
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
          content: "I'm sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
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
    setMessages(messages.slice(0, actualIndex));
  };
  
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>AI Trading Assistant</CardTitle>
        <CardDescription>
          Ask questions about trading strategies, brokers, or get help with the platform
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
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
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter>
        {!user && !authLoading ? (
          <div className="w-full space-y-3">
            <div className="text-center p-3 bg-amber-900/20 border border-amber-900/30 rounded-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="font-medium text-amber-500">Login Required</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Please sign in to use the AI assistant
              </p>
            </div>
            <Button className="w-full" asChild>
              <Link to="/auth">
                Login or Create Account
              </Link>
            </Button>
          </div>
        ) : authLoading ? (
          <div className="w-full flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {error && (
              <div className="w-full mb-4 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-xs text-destructive">Error: {error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-1 text-xs h-7 px-2" 
                  onClick={retryLastMessage}
                >
                  Try Again
                </Button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <Input
                placeholder={isMobile ? "Ask a question..." : "Ask a question about trading..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-grow"
              />
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AITradingAssistant;
