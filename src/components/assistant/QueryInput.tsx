
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isListening?: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({
  value,
  onChange,
  disabled = false,
  isListening = false,
}) => {
  return (
    <div className="flex-grow relative">
      <Input
        id="query-input"
        placeholder="Ask about trading or enter a command..."
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full pr-10"
      />
      {isListening && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        </div>
      )}
    </div>
  );
};

export default QueryInput;
