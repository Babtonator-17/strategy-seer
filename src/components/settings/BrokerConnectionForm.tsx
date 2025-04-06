
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrokerType, connectToBroker } from '@/services/brokerService';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BrokerConnectionForm = () => {
  const { toast } = useToast();
  const [selectedBroker, setSelectedBroker] = useState<BrokerType | ''>('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    server: '',
    apiKey: '',
    apiSecret: '',
    accountId: '',
    login: '',
    password: '',
  });

  const handleBrokerChange = (value: BrokerType) => {
    setSelectedBroker(value);
    setConnectionError(null);
    setConnected(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConnect = async () => {
    if (!selectedBroker) return;
    
    setConnecting(true);
    setConnectionError(null);

    try {
      const result = await connectToBroker({
        type: selectedBroker as BrokerType,
        ...formData,
      });

      if (result) {
        setConnected(true);
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${selectedBroker} broker.`,
        });
      } else {
        setConnectionError("Failed to connect. Please check your credentials and try again.");
      }
    } catch (error) {
      setConnectionError((error as Error).message || "An unexpected error occurred");
    } finally {
      setConnecting(false);
    }
  };

  const renderFields = () => {
    switch (selectedBroker) {
      case BrokerType.MT4:
      case BrokerType.MT5:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="server">Server</Label>
              <Input
                id="server"
                name="server"
                value={formData.server}
                onChange={handleInputChange}
                placeholder="broker.metatrader.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••••"
              />
            </div>
          </>
        );
      
      case BrokerType.BINANCE:
      case BrokerType.ALPACA:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="Your API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                name="apiSecret"
                type="password"
                value={formData.apiSecret}
                onChange={handleInputChange}
                placeholder="••••••••••"
              />
            </div>
          </>
        );
      
      case BrokerType.OANDA:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="Your API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                name="accountId"
                value={formData.accountId}
                onChange={handleInputChange}
                placeholder="Your account ID"
              />
            </div>
          </>
        );
      
      case BrokerType.DEMO:
        return (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              The demo broker uses simulated data for testing purposes. No credentials required.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broker Connection</CardTitle>
        <CardDescription>
          Connect to your preferred trading broker to enable live trading
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="broker-select">Select Broker</Label>
            <Select 
              value={selectedBroker} 
              onValueChange={(value) => handleBrokerChange(value as BrokerType)}
            >
              <SelectTrigger id="broker-select">
                <SelectValue placeholder="Select a broker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BrokerType.DEMO}>Demo (Simulated Data)</SelectItem>
                <SelectItem value={BrokerType.MT4}>MetaTrader 4</SelectItem>
                <SelectItem value={BrokerType.MT5}>MetaTrader 5</SelectItem>
                <SelectItem value={BrokerType.BINANCE}>Binance</SelectItem>
                <SelectItem value={BrokerType.OANDA}>Oanda</SelectItem>
                <SelectItem value={BrokerType.ALPACA}>Alpaca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedBroker && (
            <div className="space-y-4">
              {renderFields()}
              
              {connectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}
              
              {connected && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Successfully connected to {selectedBroker} broker.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleConnect} 
          disabled={!selectedBroker || connecting || connected}
        >
          {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {connected ? 'Connected' : connecting ? 'Connecting...' : 'Connect'}
        </Button>
      </CardFooter>
    </Card>
  );
};
