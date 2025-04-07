
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AITradingAssistant from '@/components/assistant/AITradingAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
            <Button asChild>
              <Link to="/auth">Login to Save Conversations</Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <AITradingAssistant />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
