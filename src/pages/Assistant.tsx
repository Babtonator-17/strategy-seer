
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AITradingAssistant from '@/components/assistant/AITradingAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot } from 'lucide-react';

const Assistant = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">AI Assistant</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Get help with trading strategies, market analysis, and platform navigation
            </p>
          </div>
          
          {!user && (
            <Button asChild size={isMobile ? "sm" : "default"} className="flex gap-1">
              <Link to="/auth">
                Login to Save Conversations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <AITradingAssistant />
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-md border">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">How to use the AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                The assistant can answer questions about trading strategies, market analysis, 
                platform features, and more. Try asking about specific indicators, trading concepts, 
                or how to use different features of the platform.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="text-xs p-2 bg-background rounded border">
                  "What is a good risk management strategy?"
                </div>
                <div className="text-xs p-2 bg-background rounded border">
                  "How do I connect a new broker account?"
                </div>
                <div className="text-xs p-2 bg-background rounded border">
                  "Explain how MACD indicator works"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
