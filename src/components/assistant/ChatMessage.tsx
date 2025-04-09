
import React from 'react';
import { User, Bot, AlertCircle, CheckCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: any;
}

interface ChatMessageProps {
  message: Message;
  controlMode: boolean;
  onConfirmTrade: (command: string | null) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, controlMode, onConfirmTrade }) => {
  const isTradeExecution = message.content.includes('[TRADE:') && message.role === 'assistant';
  
  // Extract trade command
  const extractTradeCommand = () => {
    const match = message.content.match(/\[TRADE:.*?\]/);
    return match ? match[0] : null;
  };
  
  // Format message content - highlight key terms and values
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Don't process trade execution blocks that will be rendered separately
    if (controlMode && isTradeExecution) {
      return content.replace(/\[TRADE:.*?\]/g, '');
    }
    
    // Highlight numbers and percentages
    let formattedContent = content.replace(
      /(\$[\d,]+\.?\d*|[\d,]+\.?\d*%|[\d,]+\.?\d* (BTC|ETH|XAU|USD))/g, 
      '<span class="font-semibold text-primary">$1</span>'
    );
    
    // Highlight instrument names
    formattedContent = formattedContent.replace(
      /(BTCUSD|ETHUSD|EURUSD|GBPUSD|XAUUSD|USDJPY)/g,
      '<span class="font-semibold">$1</span>'
    );
    
    // Handle code blocks
    formattedContent = formattedContent.replace(
      /\*\*(.*?)\*\*/g,
      '<span class="font-bold">$1</span>'
    );
    
    return formattedContent;
  };
  
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`
          ${message.role === 'user' 
            ? 'bg-primary text-primary-foreground ml-6 md:ml-12' 
            : 'bg-muted text-foreground mr-6 md:mr-12'
          } 
          rounded-lg p-3 max-w-[85%] md:max-w-[80%]
        `}
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            {message.role === 'user' 
              ? <User className="h-5 w-5 text-primary-foreground opacity-70" /> 
              : <Bot className="h-5 w-5 text-foreground opacity-70" />
            }
          </div>
          <div>
            <div className="text-sm">
              {controlMode && isTradeExecution ? (
                <div className="space-y-2">
                  <div className="bg-yellow-200 dark:bg-yellow-900 p-2.5 rounded-md mb-2 text-black dark:text-white">
                    <div className="flex items-center gap-1 font-semibold mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Trade Execution Request</span>
                    </div>
                    <p className="text-xs mb-3">{message.content.split('[TRADE:')[0].trim()}</p>
                    <div className="flex justify-between items-center border-t pt-2 border-yellow-300 dark:border-yellow-800">
                      <span className="text-xs font-medium">
                        Command: {extractTradeCommand()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs px-2 flex items-center"
                          onClick={() => onConfirmTrade(extractTradeCommand())}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 flex items-center"
                          onClick={() => {}}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: formatContent(message.content.replace(/\[TRADE:.*?\]/g, ''))
                    }} 
                  />
                </div>
              ) : (
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(message.content)
                  }} 
                />
              )}
              
              {message.metadata?.executionResults && (
                <div className="mt-2 p-2 bg-background rounded border">
                  <p className="text-xs font-medium">Trade Execution Results:</p>
                  {message.metadata.executionResults.map((result: any, i: number) => (
                    <div key={i} className="text-xs mt-1">
                      <span className={`font-semibold ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                        {result.success ? '✓ ' : '✗ '}
                      </span>
                      {result.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {message.timestamp && (
              <p className="text-xs opacity-50 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
