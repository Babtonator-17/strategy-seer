
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
  // Handle the click event and pass the command to the parent component
  const handleCommandClick = (command: string) => {
    // Log the command being clicked for debugging
    console.log('Command clicked:', command);
    onCommandClick(command);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
      {commands.map((cmd, idx) => (
        <Button 
          key={idx} 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs truncate hover:bg-accent" 
          onClick={() => handleCommandClick(cmd.command)}
        >
          {cmd.text}
        </Button>
      ))}
    </div>
  );
};

export default SuggestedCommands;
