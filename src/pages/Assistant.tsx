
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AITradingAssistant from '@/components/assistant/AITradingAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Briefcase, CircleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isBrokerConnected, getConnectionStatus } from '@/services/brokerService';

const Assistant = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [brokerStatus, setBrokerStatus] = useState({ connected: false, type: null });
  
  useEffect(() => {
    // Check broker connection status
    const status = getConnectionStatus();
    setBrokerStatus(status);
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">AI Assistant</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Get help with trading strategies, market analysis, and execute trades with voice commands
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
          
          {user && (
            <div className="flex items-center gap-2">
              <Badge variant={brokerStatus.connected ? "outline" : "secondary"} className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {brokerStatus.connected 
                  ? `${brokerStatus.type} Broker Connected` 
                  : "No Broker Connected"}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link to="/settings">
                  Manage Brokers
                </Link>
              </Button>
            </div>
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
                The assistant can answer questions, execute trades with Control Mode enabled, provide market analysis, 
                and help manage your account. Use voice commands for hands-free operation.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="text-xs p-2 bg-background rounded border">
                  "Buy 0.1 BTCUSD at market price"
                </div>
                <div className="text-xs p-2 bg-background rounded border">
                  "Show my account balance and open positions"
                </div>
                <div className="text-xs p-2 bg-background rounded border">
                  "Analyze EURUSD on the 4-hour chart"
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
