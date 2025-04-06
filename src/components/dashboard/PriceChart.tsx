
import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Maximize2, PanelRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPriceData } from '@/services/marketDataService';

const timeframes = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
];

const instruments = [
  { value: 'BTCUSD', label: 'BTC/USD' },
  { value: 'ETHUSD', label: 'ETH/USD' },
  { value: 'EURUSD', label: 'EUR/USD' },
  { value: 'USDJPY', label: 'USD/JPY' },
  { value: 'GBPUSD', label: 'GBP/USD' },
];

const PriceChart = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('1d');
  const [selectedInstrument, setSelectedInstrument] = useState('BTCUSD');
  const [priceData, setPriceData] = useState<any[]>([]);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPriceData(selectedInstrument, activeTimeframe);
      setPriceData(data);
    };
    
    loadData();
  }, [selectedInstrument, activeTimeframe]);

  const latestPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : 0;
  const previousPrice = priceData.length > 1 ? priceData[priceData.length - 2].price : 0;
  const priceDelta = latestPrice - previousPrice;
  const isPriceUp = priceDelta >= 0;

  return (
    <Card className="col-span-3 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger className="w-32 sm:w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((instrument) => (
                  <SelectItem key={instrument.value} value={instrument.value}>
                    {instrument.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1">
              <span className="text-lg">
                {latestPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span className={isPriceUp ? 'text-profit' : 'text-loss'}>
                {isPriceUp ? '▲' : '▼'} 
                {Math.abs(priceDelta).toFixed(2)}
              </span>
            </div>
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={chartType} onValueChange={setChartType} className="hidden sm:flex">
            <TabsList className="bg-background">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="candle">Candle</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="hidden sm:flex">
            {/* Fixed: Wrapped TabsList in Tabs component */}
            <Tabs value={activeTimeframe} onValueChange={setActiveTimeframe}>
              <TabsList className="bg-background">
                {timeframes.map((timeframe) => (
                  <TabsTrigger
                    key={timeframe.value}
                    value={timeframe.value}
                  >
                    {timeframe.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <Select value={activeTimeframe} onValueChange={setActiveTimeframe}>
            <SelectTrigger className="w-16 bg-background sm:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((timeframe) => (
                <SelectItem key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="hidden sm:flex">
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="hidden lg:flex">
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pl-0 pr-2 pb-1">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }} 
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => [
                  parseFloat(value as string).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }),
                  selectedInstrument
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }} 
              />
              <ReferenceLine 
                y={latestPrice} 
                stroke="#888" 
                strokeDasharray="3 3" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
