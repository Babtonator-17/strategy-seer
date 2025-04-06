
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownRight, ArrowUpRight, CalendarIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Trade {
  id: string;
  instrument: string;
  type: 'buy' | 'sell';
  openTime: string;
  closeTime: string;
  profit: number;
  pips: number;
  volume: number;
  strategy: string | null;
}

const trades: Trade[] = [
  {
    id: '1',
    instrument: 'BTC/USD',
    type: 'buy',
    openTime: '2025-04-03 10:22:15',
    closeTime: '2025-04-05 14:45:30',
    profit: 172.50,
    pips: 1725,
    volume: 0.15,
    strategy: 'AI Trend Follower',
  },
  {
    id: '2',
    instrument: 'EUR/USD',
    type: 'sell',
    openTime: '2025-04-03 12:05:22',
    closeTime: '2025-04-05 12:30:45',
    profit: -47.25,
    pips: -42,
    volume: 0.5,
    strategy: null,
  },
  {
    id: '3',
    instrument: 'GBP/USD',
    type: 'buy',
    openTime: '2025-04-04 09:17:32',
    closeTime: '2025-04-05 10:12:18',
    profit: 68.30,
    pips: 54,
    volume: 0.3,
    strategy: 'Breakout Hunter',
  },
  {
    id: '4',
    instrument: 'USD/JPY',
    type: 'sell',
    openTime: '2025-04-05 05:34:11',
    closeTime: '2025-04-05 08:45:33',
    profit: -22.15,
    pips: -18,
    volume: 0.25,
    strategy: null,
  },
];

const formatDateTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TradeHistory = () => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-md font-medium">Trade History</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <CalendarIcon className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FilterIcon className="h-4 w-4" />
          </Button>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="All trades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trades</SelectItem>
              <SelectItem value="profit">Profitable</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="ai">AI-generated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {trades.map((trade) => (
            <div 
              key={trade.id} 
              className="flex flex-col p-3 border border-border rounded-md bg-card"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${
                      trade.type === 'buy' ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}
                  >
                    {trade.type === 'buy' ? 'BUY' : 'SELL'}
                  </Badge>
                  <span className="font-medium">{trade.instrument}</span>
                  {trade.strategy && (
                    <Badge variant="outline" className="text-xs">
                      {trade.strategy}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {trade.profit > 0 ? (
                    <div className="flex items-center text-profit">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="font-medium">+${trade.profit.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-loss">
                      <ArrowDownRight className="h-4 w-4" />
                      <span className="font-medium">${trade.profit.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <div>
                  <span>{formatDateTime(trade.openTime)} → {formatDateTime(trade.closeTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Vol: {trade.volume}</span>
                  <span className={trade.pips > 0 ? "text-profit" : "text-loss"}>
                    {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" className="w-full text-muted-foreground text-sm">
            Show more trades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeHistory;
