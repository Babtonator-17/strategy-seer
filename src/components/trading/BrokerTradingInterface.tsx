import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { placeOrder, OrderParams, getAccountInfo } from '@/services/brokerService';
import { AlertCircle, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { brokerConnections } from '@/utils/supabaseHelpers';
import { BrokerConnection } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

interface BrokerTradingInterfaceProps {
  instrumentName?: string;
  defaultInstrument?: string;
}

const instruments = [
  { name: 'BTCUSD', price: 36450.25, change: 2.5 },
  { name: 'ETHUSD', price: 2360.75, change: 1.8 },
  { name: 'EURUSD', price: 1.0882, change: -0.15 },
  { name: 'GBPUSD', price: 1.2640, change: 0.22 },
  { name: 'USDJPY', price: 151.45, change: 0.08 },
];

export const BrokerTradingInterface = ({ 
  instrumentName = 'BTC/USD',
  defaultInstrument = 'BTCUSD' 
}: BrokerTradingInterfaceProps) => {
  const { toast } = useToast();
  const [instrument, setInstrument] = useState(defaultInstrument);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [volume, setVolume] = useState('0.1');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeBrokerConnections, setActiveBrokerConnections] = useState<BrokerConnection[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  
  const currentInstrument = instruments.find(i => i.name === instrument) || instruments[0];
  
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(data.session !== null);
      
      if (data.session) {
        fetchAccountInfo();
        fetchActiveBrokerConnections();
      }
    };
    
    checkAuthAndLoadData();
  }, []);
  
  const fetchAccountInfo = async () => {
    try {
      const info = await getAccountInfo();
      setAccountInfo(info);
    } catch (err) {
      console.error('Failed to fetch account info:', err);
    }
  };
  
  const fetchActiveBrokerConnections = async () => {
    try {
      const { data, error } = await brokerConnections.getActive();
        
      if (error) throw error;
      
      setActiveBrokerConnections(data || []);
      
      if (data && data.length > 0 && !selectedBrokerId) {
        setSelectedBrokerId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch broker connections:', err);
    }
  };
  
  const handleOrderSubmit = async () => {
    setError(null);
    
    if (!isAuthenticated) {
      setError("Please log in to place trades");
      return;
    }
    
    if (!selectedBrokerId && activeBrokerConnections.length > 0) {
      setError("Please select a broker connection");
      return;
    }
    
    if (!instrument) {
      setError('Please select an instrument');
      return;
    }
    
    if (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0) {
      setError('Please enter a valid volume');
      return;
    }
    
    const orderParams: OrderParams = {
      instrument,
      type: orderType,
      volume: parseFloat(volume),
      comment: `Order placed via StrategySeer`,
    };
    
    if (!isMarketOrder && price) {
      orderParams.price = parseFloat(price);
    }
    
    if (stopLoss) {
      orderParams.stopLoss = parseFloat(stopLoss);
    }
    
    if (takeProfit) {
      orderParams.takeProfit = parseFloat(takeProfit);
    }
    
    setIsPlacingOrder(true);
    
    try {
      const result = await placeOrder(orderParams);
      
      toast({
        title: "Order Executed",
        description: `Successfully placed ${orderType} order for ${instrument}`,
      });
      
      if (!isMarketOrder) {
        setPrice('');
      }
      setStopLoss('');
      setTakeProfit('');
      
    } catch (err) {
      setError(`Failed to place order: ${(err as Error).message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Order</CardTitle>
        <CardDescription>
          Place a new trade order with your connected broker
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isAuthenticated && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access trading features
            </AlertDescription>
          </Alert>
        )}
        
        {isAuthenticated && activeBrokerConnections.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active broker connections found. Please connect a broker in Settings.
            </AlertDescription>
          </Alert>
        )}
        
        {isAuthenticated && activeBrokerConnections.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="broker-connection">Broker Connection</Label>
            <Select 
              value={selectedBrokerId || ''} 
              onValueChange={setSelectedBrokerId}
            >
              <SelectTrigger id="broker-connection">
                <SelectValue placeholder="Select a broker connection" />
              </SelectTrigger>
              <SelectContent>
                {activeBrokerConnections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    {connection.broker_name} ({connection.broker_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {accountInfo && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Account Balance</span>
              <p className="font-medium">${accountInfo.balance.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Free Margin</span>
              <p className="font-medium">${accountInfo.freeMargin.toLocaleString()}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="instrument">Instrument</Label>
          <Select value={instrument} onValueChange={setInstrument}>
            <SelectTrigger id="instrument">
              <SelectValue placeholder="Select instrument" />
            </SelectTrigger>
            <SelectContent>
              {instruments.map((inst) => (
                <SelectItem key={inst.name} value={inst.name}>
                  <div className="flex items-center justify-between w-full">
                    <span>{inst.name}</span>
                    <span className={inst.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {inst.change >= 0 ? '+' : ''}{inst.change}%
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Current Price</span>
            <p className="text-xl font-medium">{currentInstrument.price}</p>
          </div>
          <div className={`text-lg ${currentInstrument.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currentInstrument.change >= 0 ? (
              <ArrowUp className="inline mr-1 h-5 w-5" />
            ) : (
              <ArrowDown className="inline mr-1 h-5 w-5" />
            )}
            {Math.abs(currentInstrument.change)}%
          </div>
        </div>
        
        <Tabs defaultValue="buy" onValueChange={(value) => setOrderType(value as 'buy' | 'sell')}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Sell</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                placeholder="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="market-order">Market Order</Label>
              <Switch
                id="market-order"
                checked={isMarketOrder}
                onCheckedChange={setIsMarketOrder}
              />
            </div>
            
            {!isMarketOrder && (
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  placeholder={currentInstrument.price.toString()}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="stop-loss">Stop Loss (optional)</Label>
              <Input
                id="stop-loss"
                placeholder={orderType === 'buy' 
                  ? (currentInstrument.price * 0.98).toFixed(2) 
                  : (currentInstrument.price * 1.02).toFixed(2)}
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="take-profit">Take Profit (optional)</Label>
              <Input
                id="take-profit"
                placeholder={orderType === 'buy' 
                  ? (currentInstrument.price * 1.03).toFixed(2) 
                  : (currentInstrument.price * 0.97).toFixed(2)}
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
            </div>
          </div>
        </Tabs>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleOrderSubmit}
          disabled={isPlacingOrder || !isAuthenticated || activeBrokerConnections.length === 0}
          variant={orderType === 'buy' ? 'default' : 'destructive'}
        >
          {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {orderType === 'buy' ? 'Buy' : 'Sell'} {instrument} {!isMarketOrder ? 'Limit' : ''}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BrokerTradingInterface;
