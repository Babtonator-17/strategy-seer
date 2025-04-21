
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIAssistantHeaderProps {
  autoRefreshEnabled: boolean;
  isLoadingMarketData: boolean;
  onToggleAutoRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AIAssistantHeader: React.FC<AIAssistantHeaderProps> = ({
  autoRefreshEnabled,
  isLoadingMarketData,
  onToggleAutoRefresh,
  activeTab,
  setActiveTab
}) => (
  <CardHeader className="pb-2">
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>Advanced AI Assistant</CardTitle>
        <CardDescription>
          Ask me anything about trading, markets, or any topic you're interested in
        </CardDescription>
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
