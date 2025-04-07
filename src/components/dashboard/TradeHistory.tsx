
import React, { useState } from 'react';
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

// Sample trade data
const allTrades: Trade[] = [
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
  {
    id: '5',
    instrument: 'AUD/USD',
    type: 'buy',
    openTime: '2025-04-06 09:15:42',
    closeTime: '2025-04-06 11:30:22',
    profit: 35.80,
    pips: 28,
    volume: 0.2,
    strategy: 'Momentum Trader',
  },
  {
    id: '6',
    instrument: 'ETH/USD',
    type: 'sell',
    openTime: '2025-04-06 13:45:11',
    closeTime: '2025-04-06 17:22:30',
    profit: 118.50,
    pips: 890,
    volume: 0.08,
    strategy: 'AI Trend Follower',
  },
  {
    id: '7',
    instrument: 'USD/CAD',
    type: 'sell',
    openTime: '2025-04-07 08:05:19',
    closeTime: '2025-04-07 10:15:33',
    profit: -15.75,
    pips: -14,
    volume: 0.3,
    strategy: null,
  },
  {
    id: '8',
    instrument: 'NZD/USD',
    type: 'buy',
    openTime: '2025-04-07 11:22:45',
    closeTime: '2025-04-07 14:30:12',
    profit: 42.20,
    pips: 36,
    volume: 0.25,
    strategy: 'Breakout Hunter',
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
  const [displayCount, setDisplayCount] = useState(4);
  const [filter, setFilter] = useState('all');
  
  // Filter trades based on selected filter
  const filteredTrades = allTrades.filter(trade => {
    if (filter === 'profit') return trade.profit > 0;
    if (filter === 'loss') return trade.profit < 0;
    if (filter === 'ai') return !!trade.strategy;
    return true; // 'all' filter
  });
  
  // Get trades to display based on current display count
  const tradesToDisplay = filteredTrades.slice(0, displayCount);
  
  // Handle show more button click
  const handleShowMoreClicked = () => {
    setDisplayCount(prev => Math.min(prev + 4, filteredTrades.length));
  };
  
  // Check if we've shown all trades
  const hasMoreTrades = displayCount < filteredTrades.length;

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
          
          <Select value={filter} onValueChange={setFilter}>
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
          {tradesToDisplay.length > 0 ? (
            <>
              {tradesToDisplay.map((trade) => (
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
                        <div className="flex items-center text-green-500">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="font-medium">+${trade.profit.toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
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
                      <span className={trade.pips > 0 ? "text-green-500" : "text-red-500"}>
                        {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMoreTrades && (
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground text-sm"
                  onClick={handleShowMoreClicked}
                >
                  Show more trades
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No trades matching the selected filter.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeHistory;
