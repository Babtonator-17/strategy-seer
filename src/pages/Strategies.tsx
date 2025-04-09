
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Play, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getStrategies, StrategyType, RiskLevel, createStrategy } from '@/services/strategyService';
import { useNavigate } from 'react-router-dom';

const Strategies = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isNewStrategyDialogOpen, setIsNewStrategyDialogOpen] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyPair, setNewStrategyPair] = useState('BTCUSD');
  const [newStrategyTimeframe, setNewStrategyTimeframe] = useState('4h');

  // Template strategy definitions
  const templates = [
    {
      id: 'template_ma_crossover',
      name: 'Moving Average Crossover',
      description: 'Classic strategy using MA crossovers to generate buy/sell signals',
      difficulty: 'Beginner Friendly',
      type: StrategyType.TECHNICAL,
      parameters: {
        fastMA: 9,
        slowMA: 21,
        signalMA: 9,
        timeframes: ['1h', '4h', '1d'],
      }
    },
    {
      id: 'template_rsi',
      name: 'RSI Strategy',
      description: 'Uses Relative Strength Index to identify overbought/oversold conditions',
      difficulty: 'Intermediate',
      type: StrategyType.TECHNICAL,
      parameters: {
        rsiPeriod: 14,
        overbought: 70,
        oversold: 30,
        timeframes: ['15m', '1h', '4h'],
      }
    },
    {
      id: 'template_macd',
      name: 'MACD Strategy',
      description: 'Momentum strategy using Moving Average Convergence Divergence',
      difficulty: 'Intermediate',
      type: StrategyType.TECHNICAL,
      parameters: {
        fastEMA: 12,
        slowEMA: 26,
        signalPeriod: 9,
        timeframes: ['1h', '4h', '1d'],
      }
    }
  ];

  const handleTemplateClick = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setNewStrategyName(template.name);
      setIsNewStrategyDialogOpen(true);
    }
  };

  const handleCreateNewStrategy = () => {
    setSelectedTemplate(null);
    setNewStrategyName('');
    setIsNewStrategyDialogOpen(true);
  };

  const handleCreateStrategy = async () => {
    try {
      if (!newStrategyName.trim()) {
        toast({
          title: "Error",
          description: "Strategy name is required",
          variant: "destructive"
        });
        return;
      }
      
      const template = selectedTemplate 
        ? templates.find(t => t.id === selectedTemplate) 
        : {
            name: 'Custom Strategy',
            description: 'User-defined custom trading strategy',
            type: StrategyType.CUSTOM,
            parameters: {
              timeframes: [newStrategyTimeframe],
            }
          };
      
      if (!template) {
        toast({
          title: "Error",
          description: "Template not found",
          variant: "destructive"
        });
        return;
      }
      
      const newStrategy = await createStrategy({
        name: newStrategyName,
        description: template.description,
        type: template.type,
        risk: RiskLevel.MEDIUM,
        parameters: {
          ...template.parameters,
          instrument: newStrategyPair,
          timeframe: newStrategyTimeframe
        },
        isActive: false
      });
      
      toast({
        title: "Success",
        description: `Strategy "${newStrategyName}" has been created`,
      });
      
      setIsNewStrategyDialogOpen(false);
      
      // Use setTimeout to give toast time to display before navigation
      setTimeout(() => {
        navigate("/strategies");
        // Force a reload to show the new strategy
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error("Error creating strategy:", error);
      toast({
        title: "Error",
        description: "Failed to create strategy. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Strategies</h1>
        <Button onClick={handleCreateNewStrategy}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Strategy
        </Button>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Strategies</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="backtest">Backtesting</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">Moving Average Crossover</CardTitle>
                    <CardDescription>BTCUSD - 4H</CardDescription>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-md">
                    Active
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className="text-lg font-bold text-green-600">+$345.21</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">RSI Oversold Strategy</CardTitle>
                    <CardDescription>EURUSD - 1D</CardDescription>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs px-2 py-1 rounded-md">
                    Paused
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className="text-lg font-bold text-red-600">-$42.10</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors" 
                onClick={() => handleTemplateClick(template.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">{template.difficulty}</div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="backtest" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Backtest Your Strategies</CardTitle>
              <CardDescription>Test your trading strategies against historical data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">Select a strategy to start backtesting</p>
                <Button>
                  Start Backtesting
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* New Strategy Dialog */}
      <Dialog open={isNewStrategyDialogOpen} onOpenChange={setIsNewStrategyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? `Create ${templates.find(t => t.id === selectedTemplate)?.name} Strategy` : 'Create New Strategy'}
            </DialogTitle>
            <DialogDescription>
              Configure your trading strategy and click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newStrategyName}
                onChange={(e) => setNewStrategyName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pair" className="text-right">
                Trading Pair
              </Label>
              <Select value={newStrategyPair} onValueChange={setNewStrategyPair}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select trading pair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                  <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                  <SelectItem value="EURUSD">EUR/USD</SelectItem>
                  <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                  <SelectItem value="XAUUSD">XAU/USD (Gold)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeframe" className="text-right">
                Timeframe
              </Label>
              <Select value={newStrategyTimeframe} onValueChange={setNewStrategyTimeframe}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewStrategyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStrategy}>Create Strategy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Strategies;
