
import React, { useState, useEffect } from 'react';
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
import { AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const BrokerConnectionForm = () => {
  const { toast } = useToast();
  const [selectedBroker, setSelectedBroker] = useState<BrokerType | ''>('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [savedConnections, setSavedConnections] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [formData, setFormData] = useState({
    server: '',
    apiKey: '',
    apiSecret: '',
    accountId: '',
    login: '',
    password: '',
    name: '',
  });

  // Fetch saved connections on component mount
  useEffect(() => {
    fetchSavedConnections();
  }, []);

  const fetchSavedConnections = async () => {
    setLoadingSaved(true);
    try {
      const { data, error } = await supabase
        .from('broker_connections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSavedConnections(data || []);
    } catch (error) {
      console.error('Error fetching saved connections:', error);
      toast({
        title: "Failed to load saved connections",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleBrokerChange = (value: BrokerType) => {
    setSelectedBroker(value);
    setConnectionError(null);
    setConnected(false);
    
    // Reset form data when broker changes
    setFormData({
      server: '',
      apiKey: '',
      apiSecret: '',
      accountId: '',
      login: '',
      password: '',
      name: value ? `My ${value} Account` : '',
    });
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
      // First, try to connect using the broker service
      const localResult = await connectToBroker({
        type: selectedBroker as BrokerType,
        ...formData,
      });

      if (!localResult) {
        setConnectionError("Failed to connect locally. Please check your credentials and try again.");
        return;
      }

      // If local connection is successful, store in Supabase via the edge function
      const { data: response, error } = await supabase.functions.invoke('connect-broker', {
        body: { 
          brokerType: selectedBroker,
          credentials: {
            name: formData.name || `My ${selectedBroker} Account`,
            server: formData.server,
            apiKey: formData.apiKey,
            apiSecret: formData.apiSecret,
            accountId: formData.accountId,
            login: formData.login,
            password: formData.password,
            metadata: {
              connectedAt: new Date().toISOString(),
              platform: navigator.platform,
              userAgent: navigator.userAgent
            }
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      setConnected(true);
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${selectedBroker} broker.`,
      });
      
      // Refresh saved connections
      fetchSavedConnections();
      
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
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={`My ${selectedBroker} Account`}
                />
              </div>
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

          {savedConnections.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-3">Saved Connections</h3>
              <div className="space-y-3">
                {savedConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{connection.broker_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {connection.broker_type} • Connected {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center h-6">
                        {connection.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <span className="mr-1 h-2 w-2 rounded-full bg-gray-500"></span>
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <Button 
          onClick={handleConnect} 
          disabled={!selectedBroker || connecting || connected}
        >
          {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {connected ? 'Connected' : connecting ? 'Connecting...' : 'Connect'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={fetchSavedConnections} 
          disabled={loadingSaved}
        >
          {loadingSaved ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {loadingSaved ? 'Loading...' : 'Refresh'}
        </Button>
      </CardFooter>
    </Card>
  );
};
