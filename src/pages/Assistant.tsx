
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AITradingAssistant from '@/components/assistant/AITradingAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Briefcase, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isBrokerConnected, getConnectionStatus } from '@/services/brokerService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { checkConfiguration } from '@/utils/configChecker';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Assistant = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [brokerStatus, setBrokerStatus] = useState({ connected: false, type: null });
  const { toast } = useToast();
  const [configError, setConfigError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check configuration on load
    const verifyConfig = async () => {
      try {
        const configStatus = await checkConfiguration();
        if (!configStatus.openaiKeyValid && !configStatus.checkingOpenAI) {
          setConfigError("OpenAI API key is missing or invalid. The AI assistant may not work properly.");
        }
      } catch (err) {
        console.error("Error checking configuration:", err);
      }
    };
    
    verifyConfig();
    
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
  }, [toast]);
  
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
        
        {configError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Issue</AlertTitle>
            <AlertDescription>{configError}</AlertDescription>
          </Alert>
        )}
        
        <Alert className="bg-amber-500/20 border-amber-500/30">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Demo Mode</AlertTitle>
          <AlertDescription className="text-amber-400">
            This assistant is running in demo mode. All trades are simulated and no real orders will be placed.
          </AlertDescription>
        </Alert>
        
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
                The assistant can answer questions on any topic (like ChatGPT), while specializing in trading, market analysis, and financial insights. 
                When Control Mode is enabled, it can execute trades for you. Use voice commands for hands-free operation.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-2 text-xs justify-start"
                  onClick={() => {
                    const inputField = document.getElementById('query-input') as HTMLInputElement;
                    if (inputField) {
                      inputField.value = "Analyze Bitcoin price trend";
                      inputField.focus();
                      
                      // Dispatch an input event to trigger React state changes
                      const event = new Event('input', { bubbles: true });
                      inputField.dispatchEvent(event);
                      
                      console.log("Command clicked: Analyze BTC price trend");
                    }
                  }}
                >
                  "Analyze Bitcoin price trend"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-2 text-xs justify-start"
                  onClick={() => {
                    const inputField = document.getElementById('query-input') as HTMLInputElement;
                    if (inputField) {
                      inputField.value = "Show my account balance and positions";
                      inputField.focus();
                      
                      // Dispatch an input event to trigger React state changes
                      const event = new Event('input', { bubbles: true });
                      inputField.dispatchEvent(event);
                      
                      console.log("Command clicked: Show account balance");
                    }
                  }}
                >
                  "Show my account balance and positions"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-2 text-xs justify-start"
                  onClick={() => {
                    const inputField = document.getElementById('query-input') as HTMLInputElement;
                    if (inputField) {
                      inputField.value = "Explain the RSI indicator";
                      inputField.focus();
                      
                      // Dispatch an input event to trigger React state changes
                      const event = new Event('input', { bubbles: true });
                      inputField.dispatchEvent(event);
                      
                      console.log("Command clicked: Explain RSI");
                    }
                  }}
                >
                  "Explain the RSI indicator"
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
