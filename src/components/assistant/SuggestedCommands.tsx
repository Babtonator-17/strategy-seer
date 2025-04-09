
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { fetchMarketNews } from '@/services/aiService';

interface CommandButton {
  text: string;
  command: string;
}

interface SuggestedCommandsProps {
  commands: CommandButton[];
  onCommandClick: (command: string) => void;
}

const SuggestedCommands: React.FC<SuggestedCommandsProps> = ({ commands, onCommandClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicCommands, setDynamicCommands] = useState<CommandButton[]>([]);
  const [showDynamicCommands, setShowDynamicCommands] = useState(false);

  // Handle the click event and pass the command to the parent component
  const handleCommandClick = (command: string) => {
    // Log the command being clicked for debugging
    console.log('Command clicked:', command);
    onCommandClick(command);
  };

  // Fetch trending topics to generate dynamic commands
  useEffect(() => {
    const getTrendingTopics = async () => {
      try {
        setIsLoading(true);
        // Use the existing market news service to get trends
        const newsItems = await fetchMarketNews(undefined, 3);
        
        if (newsItems && newsItems.length > 0) {
          // Transform news into relevant commands
          const newCommands = newsItems.map(item => ({
            text: `${item.instruments?.[0] || 'Market'} Analysis`,
            command: `Analyze ${item.instruments?.[0] || 'market'} based on this news: ${item.title}`
          }));
          
          setDynamicCommands(newCommands);
          setShowDynamicCommands(true);
        }
      } catch (error) {
        console.error('Error fetching trending topics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we're showing the component
    if (commands.length > 0) {
      getTrendingTopics();
    }
  }, []);

  // Combine static and dynamic commands
  const allCommands = [...commands];
  if (showDynamicCommands && dynamicCommands.length > 0) {
    // Add up to 2 dynamic commands, prioritizing if we have a small set
    const dynamicToAdd = dynamicCommands.slice(0, commands.length < 4 ? 2 : 1);
    allCommands.push(...dynamicToAdd);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {allCommands.map((cmd, idx) => (
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
      
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default SuggestedCommands;
