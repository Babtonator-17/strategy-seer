
import React from 'react';
import ControlModeAlert from './ControlModeAlert';
import MarketDataDisplay from './MarketDataDisplay';
import SuggestedCommands from './SuggestedCommands';
import MessageList from './MessageList';

interface AIAssistantMessagesProps {
  controlMode: boolean;
  marketData: any;
  isLoadingMarketData: boolean;
  onRefreshMarketData: () => void;
  marketDataCollapsed: boolean;
  toggleMarketDataCollapsed: () => void;
  suggestedCommands: any[];
  onCommandClick: (command: string) => void;
  messages: any[];
  onConfirmTrade: (command: string | null) => void;
}

const AIAssistantMessages: React.FC<AIAssistantMessagesProps> = ({
  controlMode,
  marketData,
  isLoadingMarketData,
  onRefreshMarketData,
  marketDataCollapsed,
  toggleMarketDataCollapsed,
  suggestedCommands,
  onCommandClick,
  messages,
  onConfirmTrade
}) => (
  <div className="px-6">
    <ControlModeAlert enabled={controlMode} />
    <MarketDataDisplay
      marketData={marketData}
      isLoading={isLoadingMarketData}
      onRefresh={onRefreshMarketData}
      collapsed={marketDataCollapsed}
      toggleCollapsed={toggleMarketDataCollapsed}
    />
    <SuggestedCommands commands={suggestedCommands} onCommandClick={onCommandClick} />
    <MessageList
      messages={messages}
      controlMode={controlMode}
      onConfirmTrade={onConfirmTrade}
    />
  </div>
);

export default AIAssistantMessages;
