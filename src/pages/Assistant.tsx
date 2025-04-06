
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Bot, ArrowRight } from 'lucide-react';
import { getOpenPositions, BrokerType } from '@/services/brokerService';
import { useToast } from '@/hooks/use-toast';

// Enhanced trading assistant types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  role: MessageRole;
  content: string;
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
      content: 'Hello! I\'m your AI trading assistant. How can I help you with your trading strategy today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [brokerConnected, setBrokerConnected] = useState(false);

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

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Clear input and show loading state
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response with different responses based on broker connection
    setTimeout(() => {
      setIsLoading(false);
      
      let responseContent = '';
      
      // Generate contextual response
      if (input.toLowerCase().includes('bitcoin') || input.toLowerCase().includes('btc')) {
        responseContent = 'Based on recent market data, Bitcoin is showing signs of bullish momentum with key resistance at $37,500. Consider entering on pullbacks to the 20-day EMA around $36,200. Set stop losses at $35,400 and consider taking profits at $38,900 and $40,500.';
      } else if (input.toLowerCase().includes('risk')) {
        responseContent = 'For your current portfolio, I recommend limiting each position to 2-5% of your capital. Your most volatile positions in crypto should have tighter stops. Consider hedging your BTC exposure with options if available through your broker.';
      } else if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('analysis')) {
        responseContent = 'I\'ve analyzed your recent trades and noticed you tend to exit profitable trades too early. Your average win is 1.2% while your average loss is 1.8%. Try letting your winners run longer by using trailing stops instead of fixed take-profit levels.';
      } else if (brokerConnected) {
        responseContent = 'I\'ve analyzed your current portfolio of ' + positions.length + ' positions. Your largest exposure is to BTC/USD which represents 45% of your portfolio risk. Consider diversifying into traditional forex pairs like EUR/USD to reduce overall volatility.';
      } else {
        responseContent = 'To provide more personalized analysis, consider connecting your broker in the Settings page. I can then analyze your actual trades and positions to give you customized recommendations based on your trading style and risk profile.';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseContent
      }]);

      // Show toast notification
      toast({
        title: "Analysis Complete",
        description: "AI assistant has analyzed your query",
      });
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <DashboardLayout>
      <Card className="h-[calc(100vh-8rem)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Trading Assistant
          </CardTitle>
          <CardDescription>
            Get personalized insights, strategy suggestions, and market analysis from your AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-8rem)]">
          {/* Messages container */}
          <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
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
          {messages.length < 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {quickPrompts.map((item, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-between"
                  onClick={() => handleQuickPrompt(item.prompt)}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Assistant;
