
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AssistantSettingsProps {
  controlMode: boolean;
  onControlModeChange: (checked: boolean) => void;
}

const AssistantSettings: React.FC<AssistantSettingsProps> = ({ 
  controlMode, 
  onControlModeChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium">Assistant Settings</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="control-mode">Control Mode</Label>
            <p className="text-xs text-muted-foreground">Allow the assistant to execute trading commands</p>
          </div>
          <Switch 
            id="control-mode" 
            checked={controlMode} 
            onCheckedChange={onControlModeChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="voice-commands">Voice Commands</Label>
            <p className="text-xs text-muted-foreground">Enable speech-to-text input</p>
          </div>
          <Switch id="voice-commands" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="expert-mode">Expert Mode</Label>
            <p className="text-xs text-muted-foreground">Get more technical and detailed responses</p>
          </div>
          <Switch id="expert-mode" />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <h3 className="font-medium">Connected Broker <Badge variant="outline">Demo</Badge></h3>
        <p className="text-sm text-muted-foreground">
          You're currently using a demo broker connection. All trades are simulated with virtual funds.
        </p>
        <Button variant="outline" className="w-full">
          Connect Real Broker
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <h3 className="font-medium">Conversation Management</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            New Conversation
          </Button>
          <Button variant="outline" size="sm">
            Clear History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssistantSettings;
