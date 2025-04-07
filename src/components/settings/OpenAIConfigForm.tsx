
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { configureOpenAI, getOpenAIConfig } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OpenAIConfigForm = () => {
  const { toast } = useToast();
  const currentConfig = getOpenAIConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [model, setModel] = useState(currentConfig.model || 'gpt-4o');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSave = () => {
    try {
      configureOpenAI({
        apiKey,
        model,
        enabled: Boolean(apiKey)
      });
      
      setSuccess('OpenAI configuration saved successfully');
      setError('');
      
      toast({
        title: apiKey ? 'OpenAI Integration Enabled' : 'OpenAI Integration Disabled',
        description: apiKey ? `Using ${model} for enhanced AI analysis` : 'Using built-in analysis capabilities'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save OpenAI configuration');
      setSuccess('');
    }
  };
  
  const testConnection = async () => {
    if (!apiKey) {
      setError('API key is required for testing');
      return;
    }
    
    setTestingConnection(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.'
            },
            {
              role: 'user',
              content: 'Test connection'
            }
          ],
          max_tokens: 5
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Connection successful! OpenAI API is working.');
        toast({
          title: 'Connection Successful',
          description: 'Your OpenAI API key is valid and working.',
        });
      } else {
        setError(`Connection failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Connection failed: ${(err as Error).message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OpenAI Integration</CardTitle>
        <CardDescription>
          Enhance AI trading assistant capabilities with OpenAI's advanced language models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      
        <div className="space-y-2">
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and only used for making AI requests
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Model Selection</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            More capable models provide better analysis but may cost more API credits
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={testConnection} 
          disabled={!apiKey || testingConnection}
        >
          {testingConnection ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button onClick={handleSave}>Save Configuration</Button>
      </CardFooter>
    </Card>
  );
};

export default OpenAIConfigForm;
