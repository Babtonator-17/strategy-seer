
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Play, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Strategies = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Strategies</h1>
        <Button>
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
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Moving Average Crossover</CardTitle>
                <CardDescription>Classic strategy using MA crossovers to generate buy/sell signals</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Beginner Friendly</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">RSI Strategy</CardTitle>
                <CardDescription>Uses Relative Strength Index to identify overbought/oversold conditions</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Intermediate</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">MACD Strategy</CardTitle>
                <CardDescription>Momentum strategy using Moving Average Convergence Divergence</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Intermediate</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
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
    </DashboardLayout>
  );
};

export default Strategies;
