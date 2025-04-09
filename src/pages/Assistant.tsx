
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AITradingAssistant from '@/components/assistant/AITradingAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isBrokerConnected, getConnectionStatus } from '@/services/brokerService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const Assistant = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [brokerStatus, setBrokerStatus] = useState({ connected: false, type: null });
  const { toast } = useToast();
  
  useEffect(() => {
    // Check broker connection status
    const checkBrokerStatus = () => {
      const status = getConnectionStatus();
      setBrokerStatus(status);
      console.log("Broker status:", status);
    };
    
    checkBrokerStatus();
    
    // Check again if connections change
    const interval = setInterval(checkBrokerStatus, 5000);
    
    return () => clearInterval(interval);
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant={brokerStatus.connected ? "outline" : "secondary"} 
                      className={`flex items-center gap-1 ${brokerStatus.connected ? 'border-green-500' : ''}`}
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      {brokerStatus.connected 
                        ? <>
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            {brokerStatus.type} Broker Connected
                          </> 
                        : <>
                            <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                            No Broker Connected
                          </>
                      }
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {brokerStatus.connected 
                      ? `You are connected to a ${brokerStatus.type} broker` 
                      : "Connect a broker to enable trading"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-2 text-xs justify-start"
                  onClick={() => {
                    const inputField = document.getElementById('query-input') as HTMLInputElement;
                    if (inputField) {
                      inputField.value = "Buy 0.1 BTCUSD at market price";
                      inputField.focus();
                      
                      // Dispatch an input event to trigger React state changes
                      const event = new Event('input', { bubbles: true });
                      inputField.dispatchEvent(event);
                    }
                  }}
                >
                  "Buy 0.1 BTCUSD at market price"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-2 text-xs justify-start"
                  onClick={() => {
                    const inputField = document.getElementById('query-input') as HTMLInputElement;
                    if (inputField) {
                      inputField.value = "Show my account balance and open positions";
                      inputField.focus();
                      
                      // Dispatch an input event to trigger React state changes
                      const event = new Event('input', { bubbles: true });
                      inputField.dispatchEvent(event);
                    }
                  }}
                >
                  "Show my account balance and open positions"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-2 text-xs justify-start"
                  onClick={() => {
                    const inputField = document.getElementById('query-input') as HTMLInputElement;
                    if (inputField) {
                      inputField.value = "Analyze EURUSD on the 4-hour chart";
                      inputField.focus();
                      
                      // Dispatch an input event to trigger React state changes
                      const event = new Event('input', { bubbles: true });
                      inputField.dispatchEvent(event);
                    }
                  }}
                >
                  "Analyze EURUSD on the 4-hour chart"
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
