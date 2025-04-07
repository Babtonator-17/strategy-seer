
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Bot, ArrowRight, Settings, Loader2 } from 'lucide-react';
import { getOpenPositions, BrokerType } from '@/services/brokerService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { generateAIResponse, configureOpenAI, getOpenAIConfig, AccountType } from '@/services/aiService';

// Enhanced trading assistant types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface QuickPrompt {
  title: string;
  prompt: string;
  icon: React.ReactNode;
}

const Assistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI trading assistant. How can I help you with your trading strategy today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [openAISettings, setOpenAISettings] = useState({
    apiKey: '',
    model: 'gpt-4o',
    enabled: false
  });
  const [accountType, setAccountType] = useState<AccountType>(AccountType.DEMO);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt suggestions
  const quickPrompts: QuickPrompt[] = [
    {
      title: 'Analyze BTC Trend',
      prompt: 'Can you analyze the current Bitcoin trend and suggest entry points?',
      icon: <ArrowRight className="h-4 w-4" />
    },
    {
      title: 'Optimize Portfolio',
      prompt: 'How can I optimize my current portfolio for better risk-adjusted returns?',
      icon: <ArrowRight className="h-4 w-4" />
    },
    {
      title: 'Market Overview',
      prompt: 'Give me a quick overview of today\'s market conditions.',
      icon: <ArrowRight className="h-4 w-4" />
    },
    {
      title: 'Risk Management',
      prompt: 'What risk management strategies do you recommend for my open positions?',
      icon: <ArrowRight className="h-4 w-4" />
    }
  ];

  // Fetch open positions when component mounts
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const positionsData = await getOpenPositions();
        setPositions(positionsData);
        setBrokerConnected(positionsData.length > 0);
      } catch (error) {
        console.error('Failed to fetch positions:', error);
      }
    };

    fetchPositions();
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Save OpenAI settings
  const handleSaveOpenAISettings = () => {
    configureOpenAI({
      apiKey: openAISettings.apiKey,
      model: openAISettings.model,
      enabled: Boolean(openAISettings.apiKey)
    });
    
    toast({
      title: openAISettings.apiKey ? "OpenAI Integration Enabled" : "OpenAI Integration Disabled",
      description: openAISettings.apiKey 
        ? `Using ${openAISettings.model} for enhanced analysis` 
        : "Using built-in analysis capabilities",
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and show loading state
    setInput('');
    setIsLoading(true);
    
    try {
      // Generate typing indicator effect
      const typingIndicator = setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '...',
          timestamp: new Date()
        }]);
      }, 1000);
      
      // Get AI response with context awareness
      const response = await generateAIResponse(userMessage.content);
      
      // Clear typing indicator
      clearTimeout(typingIndicator);
      
      // Update the "..." message with actual response if it exists, otherwise add new message
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content === '...') {
          return prev.slice(0, -1).concat({ 
            role: 'assistant', 
            content: response,
            timestamp: new Date()
          });
        } else {
          return [...prev, { 
            role: 'assistant', 
            content: response,
            timestamp: new Date()
          }];
        }
      });

      // Show toast notification
      toast({
        title: "Analysis Complete",
        description: "AI assistant has analyzed your query",
      });
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to generate AI response",
        variant: "destructive"
      });
      
      // Remove typing indicator if it exists
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content === '...') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  // Format timestamp for messages
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)]">
        <Card className="flex-1 h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Trading Assistant
              </CardTitle>
              <CardDescription>
                Get personalized insights, strategy suggestions, and market analysis
              </CardDescription>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assistant Settings</DialogTitle>
                  <DialogDescription>
                    Configure your AI trading assistant preferences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select 
                      value={accountType} 
                      onValueChange={(value) => setAccountType(value as AccountType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AccountType.DEMO}>Demo Account</SelectItem>
                        <SelectItem value={AccountType.PAPER}>Paper Trading</SelectItem>
                        <SelectItem value={AccountType.LIVE}>Live Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={openAISettings.apiKey}
                      onChange={(e) => setOpenAISettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your OpenAI API key"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enhance your assistant with OpenAI's advanced language model
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>OpenAI Model</Label>
                    <Select 
                      value={openAISettings.model} 
                      onValueChange={(value) => setOpenAISettings(prev => ({ ...prev, model: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select OpenAI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={handleSaveOpenAISettings}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[calc(100%-12rem)]">
            {/* Messages container */}
            <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    <div 
                      className={`rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      } ${message.content === '...' ? 'animate-pulse' : ''}`}
                    >
                      {message.content === '...' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce delay-150"></div>
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce delay-300"></div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 ml-1">
                      {message.content !== '...' && formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              
              {isLoading && !messages[messages.length - 1]?.content.includes('...') && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
                      <span className="text-sm text-muted-foreground">Analyzing market data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick prompts */}
            {messages.length < 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {quickPrompts.map((item, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-between"
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={isLoading}
                  >
                    <span>{item.title}</span>
                    {item.icon}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Input area */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about trading strategies, market analysis, or risk management..."
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground flex justify-between">
            <div>
              Account Type: {accountType}
            </div>
            <div>
              {getOpenAIConfig().enabled ? 'Enhanced with OpenAI' : 'Using built-in analysis'}
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
