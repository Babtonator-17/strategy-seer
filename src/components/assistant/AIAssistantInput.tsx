
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Send, Loader2, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import QueryInput from './QueryInput'; 
import { useAuth } from '@/providers/AuthProvider';
import { User } from '@supabase/supabase-js';
import LoginPrompt from './LoginPrompt';

interface AIAssistantInputProps {
  user: User | null;
  authLoading: boolean;
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isListening: boolean;
  toggleListening: () => void;
  retryLastMessage: () => void;
  isMobile: boolean;
  onTryWithoutLogin: () => void;
}

const AIAssistantInput: React.FC<AIAssistantInputProps> = ({
  user,
  authLoading,
  loading,
  error,
  query,
  setQuery,
  onSubmit,
  isListening,
  toggleListening,
  retryLastMessage,
  isMobile = false,
  onTryWithoutLogin
}) => {
  const { user: authUser, loading: authContextLoading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Determine if we should show login prompt based on auth status
  useEffect(() => {
    if (!authContextLoading && !authUser) {
      setShowLoginPrompt(true);
    } else {
      setShowLoginPrompt(false);
    }
  }, [authContextLoading, authUser]);
  
  // If showing login prompt, render it
  if (showLoginPrompt) {
    return <LoginPrompt loading={authLoading} onTryWithoutLogin={onTryWithoutLogin} />;
  }
  
  return (
    <Card className={cn("flex w-full overflow-hidden flex-shrink-0", 
      isMobile ? "border-0 rounded-none p-2" : ""
    )}>
      <form className="flex items-center w-full gap-2 px-1" onSubmit={onSubmit}>
        
        <QueryInput 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          isListening={isListening}
        />
        
        {error && (
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="flex-shrink-0 text-amber-500 hover:text-amber-600"
            onClick={retryLastMessage}
            title="Retry last message"
          >
            <Repeat className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          type="button" 
          size="icon" 
          variant={isListening ? "destructive" : "ghost"} 
          className="flex-shrink-0"
          onClick={toggleListening}
          disabled={loading}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          <Mic className={cn(
            "h-5 w-5", 
            isListening ? "animate-pulse" : ""
          )} />
        </Button>
        
        <Button 
          type="submit" 
          size="icon" 
          disabled={loading || !query.trim()}
          className="flex-shrink-0"
          variant="default"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </Card>
  );
};

export default AIAssistantInput;
