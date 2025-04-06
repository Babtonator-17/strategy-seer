
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';

// Mock data for monthly performance
const monthlyPerformanceData = [
  { name: 'Jan', profit: 5400, drawdown: -720 },
  { name: 'Feb', profit: 3200, drawdown: -850 },
  { name: 'Mar', profit: 7800, drawdown: -950 },
  { name: 'Apr', profit: 4300, drawdown: -480 },
  { name: 'May', profit: 6200, drawdown: -720 },
  { name: 'Jun', profit: 8900, drawdown: -1100 },
];

// Mock data for daily profit/loss
const dailyProfitLossData = [
  { date: '06/01', value: 240 },
  { date: '06/02', value: -120 },
  { date: '06/03', value: 380 },
  { date: '06/04', value: 180 },
  { date: '06/05', value: -90 },
  { date: '06/06', value: 320 },
  { date: '06/07', value: 450 },
  { date: '06/08', value: -210 },
  { date: '06/09', value: 280 },
  { date: '06/10', value: 520 },
  { date: '06/11', value: -180 },
  { date: '06/12', value: 190 },
  { date: '06/13', value: 350 },
  { date: '06/14', value: 280 },
];

// Mock data for instrument allocation
const instrumentAllocationData = [
  { name: 'BTC/USD', value: 40 },
  { name: 'ETH/USD', value: 25 },
  { name: 'EUR/USD', value: 15 },
  { name: 'Gold', value: 10 },
  { name: 'Others', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Mock data for recent trades
const recentTradesData = [
  {
    id: '1',
    instrument: 'BTC/USD',
    type: 'buy',
    entryPrice: 36450,
    exitPrice: 36780,
    profit: 330,
    profitPercent: 0.91,
    date: '2025-04-05',
  },
  {
    id: '2',
    instrument: 'ETH/USD',
    type: 'buy',
    entryPrice: 2345,
    exitPrice: 2398,
    profit: 53,
    profitPercent: 2.26,
    date: '2025-04-05',
  },
  {
    id: '3',
    instrument: 'EUR/USD',
    type: 'sell',
    entryPrice: 1.0892,
    exitPrice: 1.0874,
    profit: 18,
    profitPercent: 0.17,
    date: '2025-04-04',
  },
  {
    id: '4',
    instrument: 'BTC/USD',
    type: 'sell',
    entryPrice: 36900,
    exitPrice: 36450,
    profit: -450,
    profitPercent: -1.22,
    date: '2025-04-04',
  },
  {
    id: '5',
    instrument: 'Gold',
    type: 'buy',
    entryPrice: 2318,
    exitPrice: 2342,
    profit: 24,
    profitPercent: 1.04,
    date: '2025-04-03',
  },
];

const Performance = () => {
  const [timeFrame, setTimeFrame] = useState('monthly');
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Performance</h1>
        <p className="text-muted-foreground">Track your trading performance and results</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Total Profit</span>
              <span className="text-2xl font-bold text-green-600">$35,800</span>
              <span className="text-xs text-green-600 flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" />
                +12.5% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="text-2xl font-bold">68.3%</span>
              <span className="text-xs text-green-600 flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" />
                +3.2% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
              <span className="text-2xl font-bold text-red-600">-$1,100</span>
              <span className="text-xs text-red-600 flex items-center">
                <ChevronDown className="h-4 w-4 mr-1" />
                +$250 from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Profit Factor</span>
              <span className="text-2xl font-bold">2.45</span>
              <span className="text-xs text-green-600 flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" />
                +0.18 from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Monthly Performance */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Performance Over Time</CardTitle>
              <div className="flex space-x-2">
                <Select defaultValue="6m">
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1M</SelectItem>
                    <SelectItem value="3m">3M</SelectItem>
                    <SelectItem value="6m">6M</SelectItem>
                    <SelectItem value="1y">1Y</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="profit" 
                  name="Profit" 
                  fill="hsl(var(--success))"
                  barSize={25}
                />
                <Bar 
                  dataKey="drawdown" 
                  name="Drawdown" 
                  fill="hsl(var(--destructive))"
                  barSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Instrument Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Instrument Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={instrumentAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {instrumentAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Performance */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Daily Profit/Loss</CardTitle>
            <Tabs defaultValue={timeFrame} onValueChange={setTimeFrame}>
              <TabsList>
                <TabsTrigger value="weekly">7D</TabsTrigger>
                <TabsTrigger value="monthly">30D</TabsTrigger>
                <TabsTrigger value="quarterly">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyProfitLossData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                name="P&L" 
                fill={(entry) => entry.value >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Trades</CardTitle>
            <Button variant="outline" size="sm">
              View All Trades
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Instrument</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-right font-medium">Entry Price</th>
                  <th className="px-4 py-3 text-right font-medium">Exit Price</th>
                  <th className="px-4 py-3 text-right font-medium">P&L</th>
                  <th className="px-4 py-3 text-right font-medium">%</th>
                  <th className="px-4 py-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTradesData.map((trade) => (
                  <tr key={trade.id} className="border-b">
                    <td className="px-4 py-3">{trade.instrument}</td>
                    <td className="px-4 py-3 capitalize">{trade.type}</td>
                    <td className="px-4 py-3 text-right">{trade.entryPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{trade.exitPrice.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profitPercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right">{trade.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Performance;
