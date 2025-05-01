
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { checkConfiguration, notifyConfigurationStatus } from '@/utils/configChecker';

import AIAssistantHeader from './AIAssistantHeader';
import AIAssistantMessages from './AIAssistantMessages';
import AIAssistantInput from './AIAssistantInput';
import AssistantSettings from './AssistantSettings';
import TradeConfirmationDialog from './TradeConfirmationDialog';
import { AIAssistantProvider, useAIAssistant } from '@/contexts/AIAssistantContext';

const AITradingAssistantContent = () => {
  const {
    controlMode,
    marketData,
    isLoadingMarketData,
    refreshMarketData,
    marketDataCollapsed,
    toggleMarketDataCollapsed,
    suggestedCommands,
    handleCommandClick,
    messages,
    confirmTrade,
    setConfirmTrade,
    handleTradeExecution,
    autoRefreshEnabled,
    isListening,
    loading,
    error,
    query,
    setQuery,
    handleSubmit,
    toggleListening,
    retryLastMessage,
    activeTab,
    setActiveTab,
    setControlMode,
    setAutoRefreshEnabled,
    handleTryWithoutLogin
  } = useAIAssistant();
  
  const { toast } = useToast();
  const [configStatus, setConfigStatus] = useState({
    openaiKeyValid: true,
    supabaseConnected: true,
    checkingOpenAI: true,
    checkingSupabase: true
  });
  
  // Check configuration on component mount
  useEffect(() => {
    const checkConfig = async () => {
      const status = await checkConfiguration();
      setConfigStatus(status);
      
      // Display notifications based on config status
      notifyConfigurationStatus(status);
    };
    
    checkConfig();
  }, [toast]);

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <AIAssistantHeader
        autoRefreshEnabled={autoRefreshEnabled}
        isLoadingMarketData={isLoadingMarketData}
        onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        configStatus={configStatus}
      />
      <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
        <Tabs value={activeTab} className="flex-grow flex flex-col">
          <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col m-0 p-0">
            <AIAssistantMessages
              controlMode={controlMode}
              marketData={marketData}
              isLoadingMarketData={isLoadingMarketData}
              onRefreshMarketData={refreshMarketData}
              marketDataCollapsed={marketDataCollapsed}
              toggleMarketDataCollapsed={toggleMarketDataCollapsed}
              suggestedCommands={suggestedCommands}
              onCommandClick={handleCommandClick}
              messages={messages}
              onConfirmTrade={(command) => setConfirmTrade({ show: true, command })}
            />
          </TabsContent>
          <TabsContent value="settings" className="flex-grow overflow-auto m-0 p-6">
            <AssistantSettings
              controlMode={controlMode}
              onControlModeChange={setControlMode}
              autoRefresh={autoRefreshEnabled}
              onAutoRefreshChange={setAutoRefreshEnabled}
              configStatus={configStatus}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <AIAssistantInput
          user={null}
          authLoading={false}
          loading={loading}
          error={error}
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isListening={isListening}
          toggleListening={toggleListening}
          retryLastMessage={retryLastMessage}
          isMobile={false}
          onTryWithoutLogin={handleTryWithoutLogin}
        />
      </CardFooter>
      <TradeConfirmationDialog
        show={confirmTrade.show}
        command={confirmTrade.command}
        onOpenChange={(open) =>
          setConfirmTrade({ show: open, command: confirmTrade.command })}
        onConfirm={handleTradeExecution}
      />
    </Card>
  );
};

export const AITradingAssistant = () => {
  return (
    <AIAssistantProvider>
      <AITradingAssistantContent />
    </AIAssistantProvider>
  );
};

export default AITradingAssistant;
