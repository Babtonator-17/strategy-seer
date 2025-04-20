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
import { brokerConnections } from "@/utils/supabaseHelpers";
import { BrokerConnection } from '@/types/supabase';
import BrokerFieldGroups from './BrokerFieldGroups';
import SavedBrokerConnections from './SavedBrokerConnections';
import { supabase } from "@/integrations/supabase/client";

export const BrokerConnectionForm = () => {
  const { toast } = useToast();
  const [selectedBroker, setSelectedBroker] = useState<BrokerType | ''>('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [savedConnections, setSavedConnections] = useState<BrokerConnection[]>([]);
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

  useEffect(() => {
    fetchSavedConnections();
  }, []);

  const fetchSavedConnections = async () => {
    setLoadingSaved(true);
    try {
      const { data, error } = await brokerConnections.getAll();
      
      if (error) throw error;
      
      setSavedConnections(data || []);
    } catch (error) {
      console.error('Error fetching saved connections:', error);
      toast({
        title: "Failed to load saved connections",
        description: "Could not retrieve your saved broker connections",
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
      // First try to connect locally
      const localResult = await connectToBroker({
        type: selectedBroker as BrokerType,
        ...formData,
      });

      if (!localResult) {
        setConnectionError("Failed to connect locally. Please check your credentials and try again.");
        return;
      }

      // Then connect via the Supabase function
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
      
      fetchSavedConnections();
      
    } catch (error) {
      setConnectionError((error as Error).message || "An unexpected error occurred");
    } finally {
      setConnecting(false);
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
              
              <BrokerFieldGroups 
                selectedBroker={selectedBroker}
                formData={formData}
                handleInputChange={handleInputChange}
              />
              
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

          <SavedBrokerConnections connections={savedConnections} />
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

export default BrokerConnectionForm;
