
import React from 'react';
import { Button } from '@/components/ui/button';

interface CommandButton {
  text: string;
  command: string;
}

interface SuggestedCommandsProps {
  commands: CommandButton[];
  onCommandClick: (command: string) => void;
}

const SuggestedCommands: React.FC<SuggestedCommandsProps> = ({ commands, onCommandClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
      {commands.map((cmd, idx) => (
        <Button 
          key={idx} 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs truncate" 
          onClick={() => onCommandClick(cmd.command)}
        >
          {cmd.text}
        </Button>
      ))}
    </div>
  );
};

export default SuggestedCommands;
