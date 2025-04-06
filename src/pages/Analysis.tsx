
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Mock data for strategy performance
const strategyPerformanceData = [
  { name: 'Jan', profit: 450, trades: 24 },
  { name: 'Feb', profit: -280, trades: 18 },
  { name: 'Mar', profit: 320, trades: 22 },
  { name: 'Apr', profit: 580, trades: 27 },
  { name: 'May', profit: -120, trades: 15 },
  { name: 'Jun', profit: 740, trades: 30 },
];

// Mock data for win/loss ratio
const winLossData = [
  { name: 'Mon', wins: 12, losses: 5 },
  { name: 'Tue', wins: 8, losses: 7 },
  { name: 'Wed', wins: 15, losses: 3 },
  { name: 'Thu', wins: 10, losses: 8 },
  { name: 'Fri', wins: 14, losses: 4 },
];

// Mock data for trade analysis
const tradeAnalysisData = [
  {
    strategy: "Moving Average Crossover",
    winRate: 68,
    avgProfit: 32.5,
    avgLoss: -18.2,
    totalTrades: 45,
    profitFactor: 2.4,
  },
  {
    strategy: "RSI Divergence",
    winRate: 72,
    avgProfit: 45.8,
    avgLoss: -25.3,
    totalTrades: 36,
    profitFactor: 2.8,
  },
  {
    strategy: "Breakout Strategy",
    winRate: 58,
    avgProfit: 58.2,
    avgLoss: -28.7,
    totalTrades: 52,
    profitFactor: 1.9,
  },
  {
    strategy: "Support/Resistance",
    winRate: 65,
    avgProfit: 37.9,
    avgLoss: -22.1,
    totalTrades: 48,
    profitFactor: 2.1,
  },
];

const Analysis = () => {
  const [timeFrame, setTimeFrame] = useState('weekly');
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Performance Analysis</h1>
        <p className="text-muted-foreground">Analyze your trading performance and strategy effectiveness</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strategy Performance Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Strategy Performance</CardTitle>
              <Select defaultValue="1m" className="w-[80px]">
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">1W</SelectItem>
                  <SelectItem value="1m">1M</SelectItem>
                  <SelectItem value="3m">3M</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={strategyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="profit" 
                  fill={(entry) => entry.profit >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  fillOpacity={0.8}
                  strokeWidth={1}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Win/Loss Ratio Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Win/Loss Ratio</CardTitle>
              <Tabs defaultValue={timeFrame} onValueChange={setTimeFrame}>
                <TabsList>
                  <TabsTrigger value="daily">D</TabsTrigger>
                  <TabsTrigger value="weekly">W</TabsTrigger>
                  <TabsTrigger value="monthly">M</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={winLossData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="wins" 
                  name="Wins" 
                  fill="hsl(var(--success))"
                  barSize={20}
                />
                <Bar 
                  dataKey="losses" 
                  name="Losses" 
                  fill="hsl(var(--destructive))"
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Trading Strategies Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trading Strategies Analysis</CardTitle>
          <CardDescription>Performance metrics for your active trading strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Strategy</th>
                  <th className="px-4 py-3 text-right font-medium">Win Rate</th>
                  <th className="px-4 py-3 text-right font-medium">Avg Profit</th>
                  <th className="px-4 py-3 text-right font-medium">Avg Loss</th>
                  <th className="px-4 py-3 text-right font-medium">Total Trades</th>
                  <th className="px-4 py-3 text-right font-medium">Profit Factor</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tradeAnalysisData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.strategy}</td>
                    <td className="px-4 py-3 text-right">{item.winRate}%</td>
                    <td className="px-4 py-3 text-right text-green-600">${item.avgProfit}</td>
                    <td className="px-4 py-3 text-right text-red-600">${item.avgLoss}</td>
                    <td className="px-4 py-3 text-right">{item.totalTrades}</td>
                    <td className="px-4 py-3 text-right">{item.profitFactor}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Bottom charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={strategyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--primary))" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Trading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={strategyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="trades" 
                  name="Number of Trades" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.7}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analysis;
