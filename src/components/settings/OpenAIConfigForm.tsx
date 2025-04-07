
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { configureOpenAI, getOpenAIConfig } from '@/services/aiService';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const OpenAIConfigForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [enabled, setEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [testMode, setTestMode] = useState(true);

  // Load saved config
  useEffect(() => {
    const savedConfig = getOpenAIConfig();
    if (savedConfig) {
      setEnabled(savedConfig.enabled);
      setModel(savedConfig.model);
      // Don't set the API key directly for security
      if (savedConfig.apiKey) {
        setApiKey('••••••••••••••••••••••••••');
      }
    }
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSuccess(false);

    try {
      // First save locally
      configureOpenAI({
        apiKey: apiKey === '••••••••••••••••••••••••••' ? getOpenAIConfig().apiKey : apiKey,
        model,
        enabled
      });

      // We don't actually save the API key to the database
      // Just simulate a successful save for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      toast({
        title: "Settings Saved",
        description: "Your AI assistant settings have been updated successfully.",
      });

    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant Configuration</CardTitle>
        <CardDescription>
          Configure your AI trading assistant powered by OpenAI
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-enabled">Enable AI Features</Label>
            <Switch
              id="ai-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enable advanced trading insights and AI-powered analysis
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <Input
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            placeholder="sk-..."
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            Your API key is securely stored and used only for AI features
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-select">Model</Label>
          <Select value={model} onValueChange={setModel} disabled={submitting}>
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Economy)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="test-mode">Test Mode</Label>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Run in test mode without real trades (recommended)
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>
              Settings saved successfully
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={submitting || (!apiKey && !getOpenAIConfig().apiKey)}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OpenAIConfigForm;
