
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const AiAdvisor = () => {
  return (
    <Card className="h-full bg-sidebar">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-md font-medium">AI Trading Advisor</CardTitle>
          </div>
          <Badge variant="outline" className="animate-pulse-subtle bg-primary/10 text-primary border-primary/20">
            Live Analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-3 bg-card/50">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <TrendingUp className="h-5 w-5 text-profit" />
              </div>
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Buy opportunity: BTC/USD
                  <Badge variant="outline" className="bg-profit/10 text-profit border-profit/20">
                    Strong
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Multiple technical indicators suggest a bullish trend is forming. RSI shows oversold conditions with positive divergence.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Buy zone: $36,200 - $36,500</Badge>
                  <Badge variant="secondary" className="text-xs">Target: $38,750</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-3 bg-card/50">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Market volatility alert: EUR/USD
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Upcoming ECB announcement may cause significant volatility. Consider reducing position sizes or widening stop losses.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Event: 14:30 UTC</Badge>
                  <Badge variant="secondary" className="text-xs">Expected impact: High</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-3 bg-card/50">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <TrendingDown className="h-5 w-5 text-loss" />
              </div>
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Sell opportunity: ETH/USD
                  <Badge variant="outline" className="bg-loss/10 text-loss border-loss/20">
                    Moderate
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Price rejected at key resistance level. MACD showing bearish crossover with decreasing volume on recent rallies.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Sell zone: $2,380 - $2,420</Badge>
                  <Badge variant="secondary" className="text-xs">Target: $2,250</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiAdvisor;
