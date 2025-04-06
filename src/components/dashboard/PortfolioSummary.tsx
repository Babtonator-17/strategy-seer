
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart } from 'lucide-react';

const PortfolioSummary = () => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Portfolio Summary</CardTitle>
        <Badge variant="outline" className="font-normal">Demo Account</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Balance</span>
            </div>
            <span className="text-lg font-semibold">$10,000.00</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Equity</span>
            </div>
            <span className="text-lg font-semibold">$10,245.75</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Daily P/L</span>
            <div className="flex items-center gap-1 text-profit">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-medium">+$245.75 (2.46%)</span>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Margin Level</span>
              <span className="text-sm">324.5%</span>
            </div>
            <Progress value={32} className="h-2" />
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-3">Open Positions</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">BTC/USD</span>
                <span className="text-xs text-muted-foreground">0.15 Lot • Long</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-profit">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-sm font-medium">+$172.50</span>
                </div>
                <span className="text-xs text-muted-foreground">Entry: $36,450</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">EUR/USD</span>
                <span className="text-xs text-muted-foreground">0.5 Lot • Short</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-loss">
                  <ArrowDownRight className="h-3 w-3" />
                  <span className="text-sm font-medium">-$47.25</span>
                </div>
                <span className="text-xs text-muted-foreground">Entry: 1.0892</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">ETH/USD</span>
                <span className="text-xs text-muted-foreground">0.25 Lot • Long</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-profit">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-sm font-medium">+$120.50</span>
                </div>
                <span className="text-xs text-muted-foreground">Entry: $2,345</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
