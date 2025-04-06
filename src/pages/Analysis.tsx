
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Sample data for charts
const profitByInstrumentData = [
  { name: 'BTCUSD', profit: 1250 },
  { name: 'ETHUSD', profit: 850 },
  { name: 'EURUSD', profit: -320 },
  { name: 'XAUUSD', profit: 540 },
  { name: 'USDJPY', profit: -230 },
];

const tradesByTypeData = [
  { name: 'Buy', value: 65 },
  { name: 'Sell', value: 35 },
];

const COLORS = ['#0088FE', '#FF8042'];

const monthlyPerformanceData = [
  { month: 'Jan', profit: 850 },
  { month: 'Feb', profit: -320 },
  { month: 'Mar', profit: 1200 },
  { month: 'Apr', profit: 890 },
  { month: 'May', profit: -480 },
  { month: 'Jun', profit: 1450 },
];

const Analysis = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Trading Performance Analysis</h1>
        <p className="text-muted-foreground">Analyze your trading history and performance metrics</p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instruments">By Instrument</TabsTrigger>
          <TabsTrigger value="strategies">By Strategy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">+12 this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-green-500">+3% vs last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.74</div>
                <p className="text-xs text-muted-foreground">Ratio of wins to losses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">$3,590</div>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyPerformanceData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Profit/Loss']} />
                      <Bar 
                        dataKey="profit" 
                        name="Profit/Loss"
                        fill={(entry) => (entry.profit > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trade Types</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tradesByTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {tradesByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Trades']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="instruments" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit by Instrument</CardTitle>
              <CardDescription>
                Performance breakdown by trading instrument
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={profitByInstrumentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Profit/Loss']} />
                    <Bar 
                      dataKey="profit" 
                      name="Profit/Loss"
                      fill={(entry) => (entry.profit > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategies" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance</CardTitle>
              <CardDescription>
                Connect a broker account to view strategy performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">No strategy performance data available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Analysis;
