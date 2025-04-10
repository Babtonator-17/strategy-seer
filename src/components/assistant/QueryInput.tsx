
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, MicIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isListening: boolean;
  toggleListening: () => void;
  retryLastMessage: () => void;
  isMobile: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({
  query,
  setQuery,
  loading,
  error,
  onSubmit,
  isListening,
  toggleListening,
  retryLastMessage,
  isMobile
}) => {
  return (
    <>
      {error && (
        <div className="w-full mb-4 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-xs text-destructive">Error communicating with assistant</p>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">Try another question or retry your last message</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2 flex items-center gap-1" 
              onClick={retryLastMessage}
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="w-full flex gap-2">
        <Input
          id="query-input"
          placeholder={isMobile ? "Ask a question..." : "Ask about trading or enter a command..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="flex-grow"
        />
        <Button type="button" variant="outline" disabled={loading} onClick={toggleListening}>
          <MicIcon className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
        </Button>
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </>
  );
};

export default QueryInput;
