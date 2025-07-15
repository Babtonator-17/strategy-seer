
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ConfigStatus } from '@/utils/configChecker';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Wrench, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AssistantSettingsProps {
  controlMode: boolean;
  onControlModeChange: (value: boolean) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  configStatus?: ConfigStatus;
}

const AssistantSettings: React.FC<AssistantSettingsProps> = ({
  controlMode,
  onControlModeChange,
  autoRefresh,
  onAutoRefreshChange,
  configStatus
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assistant Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how the AI assistant behaves and interacts with your account
        </p>
      </div>
      
      <Separator />
      
      {/* System Status */}
      <div>
        <h4 className="text-sm font-medium mb-3">System Status</h4>
        
        <div className="space-y-3">
          {configStatus?.checkingOpenAI && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Checking OpenRouter Configuration</AlertTitle>
              <AlertDescription>
                Verifying OpenRouter API connectivity...
              </AlertDescription>
            </Alert>
          )}
          
          {configStatus?.checkingSupabase && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Checking Database Connection</AlertTitle>
              <AlertDescription>
                Verifying the connection to the database...
              </AlertDescription>
            </Alert>
          )}
        
          {configStatus && !configStatus.openaiKeyValid && !configStatus.checkingOpenAI && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Configuration Required</AlertTitle>
              <AlertDescription>
                <p>OpenRouter API key is not configured. The AI assistant requires an OpenRouter API key to function properly.</p>
                <p className="mt-2">Please contact your administrator to configure the API key in Supabase Edge Function secrets.</p>
              </AlertDescription>
            </Alert>
          )}
          
          {configStatus && !configStatus.supabaseConnected && !configStatus.checkingSupabase && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Database Connection Issue</AlertTitle>
              <AlertDescription>
                Unable to connect to the database. Login, conversation history, and other features may be unavailable.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Running in Demo Mode</AlertTitle>
            <AlertDescription>
              This assistant is running in demo mode. All trades will be simulated and no real orders will be placed.
            </AlertDescription>
          </Alert>
          
          {configStatus && configStatus.openaiKeyValid && !configStatus.checkingOpenAI && (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>OpenRouter Connection Active</AlertTitle>
              <AlertDescription className="text-green-400">
                OpenRouter API is properly configured and the assistant can process requests.
                Using models: DeepSeek Qwen3 8B (Primary) with Mixtral 8x7B (Fallback).
              </AlertDescription>
            </Alert>
          )}
          
          {configStatus && configStatus.supabaseConnected && !configStatus.checkingSupabase && (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Database Connected</AlertTitle>
              <AlertDescription className="text-green-400">
                Successfully connected to the database. User data and conversation history will be saved.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Control Mode */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="control-mode">Control Mode</Label>
            <div className="text-sm text-muted-foreground">
              Allow the assistant to execute trades on your behalf when enabled
            </div>
          </div>
          <Switch 
            id="control-mode" 
            checked={controlMode} 
            onCheckedChange={onControlModeChange} 
          />
        </div>
        
        {controlMode && (
          <Alert>
            <Wrench className="h-4 w-4" />
            <AlertTitle>Control Mode Enabled</AlertTitle>
            <AlertDescription>
              The assistant can now execute trades when you request it. All trades will be simulated in demo mode.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Separator />
      
      {/* Auto Refresh */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-refresh">Auto Refresh Market Data</Label>
            <div className="text-sm text-muted-foreground">
              Automatically refresh market data every 30 seconds
            </div>
          </div>
          <Switch 
            id="auto-refresh" 
            checked={autoRefresh} 
            onCheckedChange={onAutoRefreshChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default AssistantSettings;
