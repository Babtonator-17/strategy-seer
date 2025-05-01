
import React, { useRef, useEffect, memo, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ChatMessage from './ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: any;
}

interface MessageListProps {
  messages: Message[];
  controlMode: boolean;
  onConfirmTrade: (command: string | null) => void;
}

const MemoizedChatMessage = memo(ChatMessage);

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  controlMode, 
  onConfirmTrade 
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <>
      <Separator className="mb-2" />
      
      <ScrollArea className="flex-grow px-6 pr-2">
        <div className="space-y-4 pt-2">
          {memoizedMessages.map((msg, index) => (
            <MemoizedChatMessage 
              key={`${index}-${msg.timestamp || Date.now()}`}
              message={msg}
              controlMode={controlMode}
              onConfirmTrade={onConfirmTrade}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </>
  );
};

export default memo(MessageList);
