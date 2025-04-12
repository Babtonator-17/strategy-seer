
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bot, Shield, RefreshCw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssistantSettingsProps {
  controlMode: boolean;
  onControlModeChange: (value: boolean) => void;
  autoRefresh?: boolean;
  onAutoRefreshChange?: (value: boolean) => void;
}

const AssistantSettings: React.FC<AssistantSettingsProps> = ({ 
  controlMode, 
  onControlModeChange,
  autoRefresh = true,
  onAutoRefreshChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Assistant Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how the AI assistant behaves and what capabilities it has access to.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="control-mode" className="font-medium">Control Mode</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[220px] text-xs">
                      When enabled, the AI can execute trading commands and access your account data. All commands will require your confirmation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">
              Allow the AI to execute trades and access your account
            </p>
          </div>
          <Switch
            id="control-mode"
            checked={controlMode}
            onCheckedChange={onControlModeChange}
          />
        </div>
        
        {onAutoRefreshChange && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-refresh" className="font-medium">Auto Refresh</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[220px] text-xs">
                        Automatically refresh market data every 30 seconds to keep information current.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep market data fresh with automatic updates
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
            />
          </div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Security</h3>
        </div>
        
        <div className="rounded-md border p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Demo Mode Active</h4>
          <p className="text-sm text-muted-foreground">
            You're currently using a demo account. All trading activity is simulated and no real funds are at risk.
            To connect a real broker account, visit the Settings page.
          </p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Performance</h3>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            The AI responds based on market data, news, and your trading history to provide the most relevant assistance.
            All processing is done securely on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantSettings;
