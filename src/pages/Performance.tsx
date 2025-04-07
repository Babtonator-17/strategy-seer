
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock performance data
const monthlyPerformance = [
  { month: 'Jan', profit: 1250, drawdown: -450 },
  { month: 'Feb', profit: 1800, drawdown: -320 },
  { month: 'Mar', profit: -950, drawdown: -1200 },
  { month: 'Apr', profit: 2100, drawdown: -480 },
  { month: 'May', profit: 1450, drawdown: -650 },
  { month: 'Jun', profit: -750, drawdown: -900 },
  { month: 'Jul', profit: 1900, drawdown: -400 },
  { month: 'Aug', profit: 2200, drawdown: -300 },
];

const equityCurve = [
  { date: '2025-01-01', equity: 10000 },
  { date: '2025-01-15', equity: 10450 },
  { date: '2025-02-01', equity: 11200 },
  { date: '2025-02-15', equity: 10800 },
  { date: '2025-03-01', equity: 11500 },
  { date: '2025-03-15', equity: 11200 },
  { date: '2025-04-01', equity: 12300 },
  { date: '2025-04-15', equity: 12100 },
  { date: '2025-05-01', equity: 13400 },
];

const instrumentPerformance = [
  { name: 'BTC/USD', value: 45 },
  { name: 'ETH/USD', value: 28 },
  { name: 'EUR/USD', value: 15 },
  { name: 'GBP/USD', value: 7 },
  { name: 'XAU/USD', value: 5 },
];

const strategyPerformance = [
  { name: 'Trend Following', trades: 45, winRate: 68, profit: 3200, expectancy: 1.2 },
  { name: 'Breakout', trades: 32, winRate: 52, profit: 1800, expectancy: 0.9 },
  { name: 'Mean Reversion', trades: 28, winRate: 74, profit: 2450, expectancy: 1.4 },
  { name: 'Scalping', trades: 120, winRate: 65, profit: 1950, expectancy: 0.8 },
];

// Pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Custom tooltip for the charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value > 0 ? '+$' : '-$'}${Math.abs(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const Performance = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instruments">Instruments</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Monthly profit and drawdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={monthlyPerformance}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="profit" 
                      name="Profit" 
                      fill="hsl(var(--success))" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="drawdown" 
                      name="Max Drawdown" 
                      fill="hsl(var(--destructive))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Equity Curve */}
            <Card>
              <CardHeader>
                <CardTitle>Equity Curve</CardTitle>
                <CardDescription>Growth of account equity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={equityCurve}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-profit">+$5,450</div>
                  <p className="text-muted-foreground text-sm">+24.8% return</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">65.2%</div>
                  <p className="text-muted-foreground text-sm">149/234 trades</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Profit Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.86</div>
                  <p className="text-muted-foreground text-sm">Good risk-reward ratio</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="instruments" className="space-y-4 mt-4">
            {/* Instrument Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="md:row-span-2">
                <CardHeader>
                  <CardTitle>Performance by Instrument</CardTitle>
                  <CardDescription>Distribution of trading profits by instrument</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={instrumentPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {instrumentPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Contribution']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Instrument Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Instruments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <span>BTC/USD</span>
                        <span className="text-profit">+$2,450</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>42 trades</span>
                        <span>Win rate: 72%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>ETH/USD</span>
                        <span className="text-profit">+$1,820</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>35 trades</span>
                        <span>Win rate: 68%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>EUR/USD</span>
                        <span className="text-profit">+$980</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>58 trades</span>
                        <span>Win rate: 62%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Worst Performing Instruments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <span>USD/JPY</span>
                        <span className="text-loss">-$340</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>15 trades</span>
                        <span>Win rate: 46%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>XRP/USD</span>
                        <span className="text-loss">-$280</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>12 trades</span>
                        <span>Win rate: 41%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>GBP/JPY</span>
                        <span className="text-loss">-$150</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>8 trades</span>
                        <span>Win rate: 50%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4 mt-4">
            {/* Strategy Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Strategy</CardTitle>
                <CardDescription>Comparison of trading strategies</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Strategy</th>
                      <th className="text-right py-3 px-4">Trades</th>
                      <th className="text-right py-3 px-4">Win Rate</th>
                      <th className="text-right py-3 px-4">Net Profit</th>
                      <th className="text-right py-3 px-4">Expectancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategyPerformance.map((strategy, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3 px-4">{strategy.name}</td>
                        <td className="text-right py-3 px-4">{strategy.trades}</td>
                        <td className="text-right py-3 px-4">{strategy.winRate}%</td>
                        <td className={`text-right py-3 px-4 ${strategy.profit > 0 ? 'text-profit' : 'text-loss'}`}>
                          {strategy.profit > 0 ? '+' : '-'}${Math.abs(strategy.profit)}
                        </td>
                        <td className="text-right py-3 px-4">{strategy.expectancy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            {/* Strategy Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Best Strategy: Mean Reversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="text-lg font-medium">74%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Profit Factor</div>
                        <div className="text-lg font-medium">2.3</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Max Drawdown</div>
                        <div className="text-lg font-medium">-12.8%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Avg Hold Time</div>
                        <div className="text-lg font-medium">4.3 days</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Win/Loss Ratio</div>
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div className="bg-green-500" style={{ width: '74%' }}></div>
                        <div className="bg-red-500" style={{ width: '26%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>21 wins</span>
                        <span>7 losses</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Mean Reversion</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider tightening stop losses by 15% to improve risk-reward ratio.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Breakout</h4>
                    <p className="text-sm text-muted-foreground">
                      Add volume confirmation to reduce false breakouts. Currently has 35% false signal rate.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Trend Following</h4>
                    <p className="text-sm text-muted-foreground">
                      Perform best on 4h timeframe vs current 1h. Consider adjusting parameters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4 mt-4">
            {/* Detailed Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
                <CardDescription>Key performance metrics for your trading account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Profitability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Net Profit</span>
                        <span className="font-medium text-profit">+$5,450</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Return</span>
                        <span className="font-medium">+24.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">CAGR</span>
                        <span className="font-medium">18.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Profit Factor</span>
                        <span className="font-medium">1.86</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Risk</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                        <span className="font-medium text-loss">-14.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Drawdown</span>
                        <span className="font-medium">-6.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <span className="font-medium">1.42</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sortino Ratio</span>
                        <span className="font-medium">1.68</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Trade Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Trades</span>
                        <span className="font-medium">234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <span className="font-medium">65.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Winner</span>
                        <span className="font-medium text-profit">+$108.24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Loser</span>
                        <span className="font-medium text-loss">-$84.16</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
