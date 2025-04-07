
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock trade performance data
const tradeData = [
  { name: 'Mon', profit: 120, loss: -45 },
  { name: 'Tue', profit: 85, loss: -20 },
  { name: 'Wed', profit: 0, loss: -65 },
  { name: 'Thu', profit: 145, loss: 0 },
  { name: 'Fri', profit: 60, loss: -30 },
];

// Mock strategy performance data
const strategyData = [
  { name: 'Trend Following', winRate: 68, profitFactor: 1.8, trades: 45 },
  { name: 'Breakout', winRate: 52, profitFactor: 1.4, trades: 32 },
  { name: 'Mean Reversion', winRate: 74, profitFactor: 2.1, trades: 28 },
  { name: 'Scalping', winRate: 65, profitFactor: 1.6, trades: 120 },
];

// Mock market sentiment data
const sentimentData = [
  { market: 'Crypto', bullish: 65, bearish: 35 },
  { market: 'Forex', bullish: 45, bearish: 55 },
  { market: 'Stocks', bullish: 58, bearish: 42 },
  { market: 'Commodities', bullish: 52, bearish: 48 },
];

// Custom tooltip for the bar charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value > 0 ? '+' : ''}${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const Analysis = () => {
  const [timeframe, setTimeframe] = useState('weekly');

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Trade Performance</CardTitle>
                <CardDescription>Analysis of your trading performance over time</CardDescription>
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tradeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  name="Profit" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="loss" 
                  name="Loss" 
                  fill="hsl(var(--destructive))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Additional analysis cards */}
        <Card>
          <CardHeader>
            <CardTitle>Strategy Analysis</CardTitle>
            <CardDescription>Performance metrics by strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategyData.map((strategy, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{strategy.name}</span>
                    <span className="text-muted-foreground">{strategy.trades} trades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Win Rate:</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${strategy.winRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{strategy.winRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Profit Factor:</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(strategy.profitFactor/3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{strategy.profitFactor}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
            <CardDescription>Current market sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentData.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.market}</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${item.bullish}%` }}
                    ></div>
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${item.bearish}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Bullish {item.bullish}%</span>
                    <span>Bearish {item.bearish}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analysis;
