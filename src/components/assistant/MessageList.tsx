
import React, { useRef, useEffect } from 'react';
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

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  controlMode, 
  onConfirmTrade 
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <>
      <Separator className="mb-2" />
      
      <ScrollArea className="flex-grow px-6 pr-2">
        <div className="space-y-4 pt-2">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index}
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

export default MessageList;
