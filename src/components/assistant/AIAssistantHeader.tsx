
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfigStatus } from '@/utils/configChecker';

interface AIAssistantHeaderProps {
  autoRefreshEnabled: boolean;
  isLoadingMarketData: boolean;
  onToggleAutoRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  configStatus?: ConfigStatus;
}

const AIAssistantHeader: React.FC<AIAssistantHeaderProps> = ({
  autoRefreshEnabled,
  isLoadingMarketData,
  onToggleAutoRefresh,
  activeTab,
  setActiveTab,
  configStatus
}) => (
  <CardHeader className="pb-2">
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>Advanced AI Assistant</CardTitle>
        <CardDescription>
          Ask me anything about trading, markets, or any topic you're interested in
        </CardDescription>
        
        {configStatus && !configStatus.checkingOpenAI && !configStatus.checkingSupabase && (
          <div className="flex gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={configStatus.supabaseConnected ? "outline" : "destructive"} className="flex items-center gap-1">
                    {configStatus.supabaseConnected 
                      ? <CheckCircle2 className="h-3 w-3 text-green-500" /> 
                      : <AlertTriangle className="h-3 w-3" />
                    }
                    <span>Database</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {configStatus.supabaseConnected 
                    ? "Database connection is working" 
                    : "Database connection issue"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={configStatus.openaiKeyValid ? "outline" : "destructive"} className="flex items-center gap-1">
                    {configStatus.openaiKeyValid 
                      ? <CheckCircle2 className="h-3 w-3 text-green-500" /> 
                      : <AlertTriangle className="h-3 w-3" />
                    }
                    <span>OpenAI</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {configStatus.openaiKeyValid 
                    ? "OpenAI API key is valid" 
                    : "OpenAI API key is missing or invalid"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border-amber-500/50">
                    <span className="font-medium">DEMO MODE</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  The application is running in demo mode. Trades are simulated.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8" 
          onClick={onToggleAutoRefresh}
          title={autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingMarketData ? 'animate-spin' : ''} ${autoRefreshEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="ml-2 hidden sm:inline">{autoRefreshEnabled ? "Auto" : "Manual"}</span>
        </Button>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[180px]">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  </CardHeader>
);

export default AIAssistantHeader;
