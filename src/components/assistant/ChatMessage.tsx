
import React from 'react';
import { User, Bot, AlertCircle, CheckCircle, Ban } from 'lucide-react';

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
            <div className="text-sm whitespace-pre-wrap">
              {controlMode && isTradeExecution ? (
                <div className="relative">
                  <div className="bg-yellow-200 dark:bg-yellow-900 p-2 rounded-md mb-2 text-black dark:text-white">
                    <div className="flex items-center gap-1 font-semibold mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Trade Execution Request</span>
                    </div>
                    <p className="text-xs mb-2">{message.content.split('[TRADE:')[0]}</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-black dark:text-white rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => onConfirmTrade(message.content.match(/\[TRADE:.*?\]/)?.[0] || null)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirm
                      </button>
                      <button 
                        className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                  <p>{message.content.replace(/\[TRADE:.*?\]/g, '')}</p>
                </div>
              ) : (
                message.content
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
