
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOpenPositions, getAccountInfo } from '@/services/brokerService';
import { useQuery } from '@tanstack/react-query';

// Sample data for the portfolio performance chart
const performanceData = [
  { date: 'Apr 01', value: 10000 },
  { date: 'Apr 05', value: 10150 },
  { date: 'Apr 10', value: 9950 },
  { date: 'Apr 15', value: 10300 },
  { date: 'Apr 20', value: 10450 },
  { date: 'Apr 25', value: 10200 },
  { date: 'Apr 30', value: 10550 },
  { date: 'May 05', value: 10675 },
];

const Portfolio = () => {
  // Fetch account information
  const { data: accountInfo, isLoading: accountLoading } = useQuery({
    queryKey: ['accountInfo'],
    queryFn: getAccountInfo,
  });

  // Fetch open positions
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['openPositions'],
    queryFn: getOpenPositions,
  });

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <div className="h-16 animate-pulse bg-muted rounded"></div>
            ) : (
              <div className="text-3xl font-bold">
                ${accountInfo?.balance.toLocaleString()}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Available margin: ${accountInfo?.freeMargin.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equity</CardTitle>
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <div className="h-16 animate-pulse bg-muted rounded"></div>
            ) : (
              <div className="text-3xl font-bold">
                ${accountInfo?.equity.toLocaleString()}
              </div>
            )}
            <div className="text-xs text-green-500 mt-1">
              +$245.75 today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margin Level</CardTitle>
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <div className="h-16 animate-pulse bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {accountInfo?.marginLevel.toFixed(2)}%
                </div>
                <Progress value={Math.min(accountInfo?.marginLevel / 5, 100)} className="h-2 mt-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))'
                    }}
                    formatter={(value) => [`$${value}`, 'Balance']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="profitable">Profitable</TabsTrigger>
                <TabsTrigger value="losing">Losing</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="pt-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Instrument</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Volume</th>
                          <th className="text-left p-2 font-medium">Open Price</th>
                          <th className="text-left p-2 font-medium">Current</th>
                          <th className="text-right p-2 font-medium">Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positionsLoading ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center">Loading positions...</td>
                          </tr>
                        ) : positions && positions.length > 0 ? (
                          positions.map((position) => (
                            <tr key={position.id} className="border-t hover:bg-muted/50">
                              <td className="p-2 font-medium">{position.instrument}</td>
                              <td className="p-2">
                                <span className={position.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                                  {position.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-2">{position.volume}</td>
                              <td className="p-2">{position.openPrice}</td>
                              <td className="p-2">{position.currentPrice}</td>
                              <td className={`p-2 text-right ${position.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${position.profit.toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center">No positions open</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="profitable" className="pt-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Instrument</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Volume</th>
                          <th className="text-left p-2 font-medium">Open Price</th>
                          <th className="text-left p-2 font-medium">Current</th>
                          <th className="text-right p-2 font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positionsLoading ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center">Loading positions...</td>
                          </tr>
                        ) : positions && positions.filter(p => p.profit > 0).length > 0 ? (
                          positions
                            .filter(position => position.profit > 0)
                            .map((position) => (
                              <tr key={position.id} className="border-t hover:bg-muted/50">
                                <td className="p-2 font-medium">{position.instrument}</td>
                                <td className="p-2">
                                  <span className={position.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                                    {position.type.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-2">{position.volume}</td>
                                <td className="p-2">{position.openPrice}</td>
                                <td className="p-2">{position.currentPrice}</td>
                                <td className="p-2 text-right text-green-500">
                                  ${position.profit.toFixed(2)}
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center">No profitable positions</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="losing" className="pt-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Instrument</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Volume</th>
                          <th className="text-left p-2 font-medium">Open Price</th>
                          <th className="text-left p-2 font-medium">Current</th>
                          <th className="text-right p-2 font-medium">Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positionsLoading ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center">Loading positions...</td>
                          </tr>
                        ) : positions && positions.filter(p => p.profit <= 0).length > 0 ? (
                          positions
                            .filter(position => position.profit <= 0)
                            .map((position) => (
                              <tr key={position.id} className="border-t hover:bg-muted/50">
                                <td className="p-2 font-medium">{position.instrument}</td>
                                <td className="p-2">
                                  <span className={position.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                                    {position.type.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-2">{position.volume}</td>
                                <td className="p-2">{position.openPrice}</td>
                                <td className="p-2">{position.currentPrice}</td>
                                <td className="p-2 text-right text-red-500">
                                  ${position.profit.toFixed(2)}
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center">No losing positions</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
