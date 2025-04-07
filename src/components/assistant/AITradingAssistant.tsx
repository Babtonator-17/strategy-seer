
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const AITradingAssistant = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const welcomeMessage: Message = {
    role: 'assistant',
    content: 'Hello! I\'m your AI trading assistant. I can help you with trading strategies, broker connections, and market analysis. How can I assist you today?',
    timestamp: new Date().toISOString()
  };
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    // Initialize with welcome message if no messages
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    
    // Scroll to bottom whenever messages update
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Fetch conversation history if authenticated
    const fetchConversation = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Get the most recent conversation
        const { data, error } = await supabase
          .from('assistant_conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching conversation:', error);
          return;
        }
        
        if (data) {
          setConversationId(data.id);
          
          // Only set messages if we have some in the DB
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };
    
    fetchConversation();
  }, [isAuthenticated]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Don't proceed if not authenticated
    if (!isAuthenticated) {
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
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to get response from the assistant",
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
                      ? 'bg-primary text-primary-foreground ml-12' 
                      : 'bg-muted text-foreground mr-12'
                    } 
                    rounded-lg p-3 max-w-[80%]
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
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            placeholder="Ask a question about trading..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading || !isAuthenticated}
          />
          <Button type="submit" disabled={loading || !query.trim() || !isAuthenticated}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AITradingAssistant;
