
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  RefreshCw, 
  Settings,
  MessageSquare,
  BookPlus,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfigStatus } from '@/utils/configChecker';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface AIAssistantHeaderProps {
  autoRefreshEnabled: boolean;
  isLoadingMarketData: boolean;
  onToggleAutoRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  configStatus: ConfigStatus;
}

const AIAssistantHeader: React.FC<AIAssistantHeaderProps> = ({
  autoRefreshEnabled,
  isLoadingMarketData,
  onToggleAutoRefresh,
  activeTab,
  setActiveTab,
  configStatus
}) => {
  const { startNewChat } = useAIAssistant();
  
  return (
    <div className="flex justify-between items-center px-6 py-2 border-b">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold mr-4">Trading Assistant</h3>
        {!configStatus.openaiKeyValid && !configStatus.checkingOpenAI && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="mr-2">
                  API Key Missing
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>OpenAI API key is missing or invalid. Add it in Settings.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {activeTab === 'chat' && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={startNewChat}
                  >
                    <BookPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start a new conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleAutoRefresh}
                    className={`${autoRefreshEnabled ? 'text-green-500' : 'text-muted-foreground'}`}
                    disabled={isLoadingMarketData}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingMarketData ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{autoRefreshEnabled ? 'Disable' : 'Enable'} auto-refresh market data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        
        <TabsList className="h-8">
          <TabsTrigger value="chat" onClick={() => setActiveTab('chat')} className="px-3 h-7">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="settings" onClick={() => setActiveTab('settings')} className="px-3 h-7">
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get help with the Trading Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default AIAssistantHeader;
