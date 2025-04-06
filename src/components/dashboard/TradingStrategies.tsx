
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Activity, Brain, Lightbulb, PlayCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'ai' | 'technical' | 'custom';
  status: 'active' | 'inactive';
  performance: number;
  risk: 'low' | 'medium' | 'high';
}

const strategies: Strategy[] = [
  {
    id: '1',
    name: 'AI Trend Follower',
    description: 'Uses machine learning to identify market trends',
    type: 'ai',
    status: 'active',
    performance: 4.3,
    risk: 'medium',
  },
  {
    id: '2',
    name: 'RSI + MACD Crossover',
    description: 'Technical analysis with RSI and MACD indicators',
    type: 'technical',
    status: 'inactive',
    performance: 2.7,
    risk: 'low',
  },
  {
    id: '3',
    name: 'Breakout Hunter',
    description: 'Identifies and trades breakouts from key levels',
    type: 'technical',
    status: 'inactive',
    performance: 6.1,
    risk: 'high',
  },
];

const TradingStrategies = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openStrategy, setOpenStrategy] = useState<Strategy | null>(null);

  const filteredStrategies = activeFilter === 'all' 
    ? strategies 
    : strategies.filter(s => s.type === activeFilter);

  const handleActivateStrategy = (strategyId: string) => {
    console.log(`Activating strategy ${strategyId}`);
    // In a real app, this would update the strategy status
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setOpenStrategy(strategy);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-md font-medium">Trading Strategies</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Strategies</SelectItem>
                <SelectItem value="ai">AI-Powered</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Strategy</DialogTitle>
                <DialogDescription>
                  Configure a new trading strategy for your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Name</label>
                  <Input placeholder="Enter strategy name" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Type</label>
                  <Select defaultValue="technical">
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">AI-Powered</SelectItem>
                      <SelectItem value="technical">Technical Analysis</SelectItem>
                      <SelectItem value="custom">Custom Strategy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Risk Level</label>
                    <span className="text-sm text-muted-foreground">Medium</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Strategy</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredStrategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lightbulb className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">No strategies found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new strategy to get started
              </p>
            </div>
          ) : (
            filteredStrategies.map((strategy) => (
              <div 
                key={strategy.id} 
                className="flex justify-between items-center p-3 border border-border rounded-md bg-card"
              >
                <div className="flex gap-3 items-center">
                  {strategy.type === 'ai' ? (
                    <Brain className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-md" />
                  ) : (
                    <Activity className="h-10 w-10 p-2 bg-secondary/40 text-secondary-foreground rounded-md" />
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{strategy.name}</h4>
                      {strategy.type === 'ai' && (
                        <Badge variant="secondary" className="h-5 text-xs">AI</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{strategy.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          strategy.risk === 'low' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : strategy.risk === 'medium' 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {strategy.risk.charAt(0).toUpperCase() + strategy.risk.slice(1)} Risk
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {strategy.performance > 0 ? '+' : ''}{strategy.performance}% 30d
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleEditStrategy(strategy)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Strategy</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Strategy Name</label>
                          <Input defaultValue={openStrategy?.name} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">Risk Level</label>
                            <span className="text-sm text-muted-foreground">
                              {openStrategy?.risk.charAt(0).toUpperCase() + openStrategy?.risk.slice(1)}
                            </span>
                          </div>
                          <Slider 
                            defaultValue={[
                              openStrategy?.risk === 'low' ? 25 : 
                              openStrategy?.risk === 'medium' ? 50 : 75
                            ]} 
                            max={100} 
                            step={1} 
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="flex items-center">
                    <Switch 
                      checked={strategy.status === 'active'} 
                      onCheckedChange={() => handleActivateStrategy(strategy.id)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
          
          {filteredStrategies.length > 0 && filteredStrategies.length < strategies.length && (
            <Button variant="ghost" className="w-full text-muted-foreground text-sm">
              Show {strategies.length - filteredStrategies.length} more strategies
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingStrategies;
