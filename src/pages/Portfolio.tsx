
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import BrokerTradingInterface from '@/components/trading/BrokerTradingInterface';
import { getOpenPositions, closePosition, modifyPosition } from '@/services/brokerService';
import { useToast } from '@/hooks/use-toast';
import { ArrowDownUp, Ban, ChevronDown, ChevronUp, Edit, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Portfolio = () => {
  const { toast } = useToast();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifyingPosition, setModifyingPosition] = useState<any | null>(null);
  const [newStopLoss, setNewStopLoss] = useState('');
  const [newTakeProfit, setNewTakeProfit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('positions');

  // Calculate portfolio stats
  const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
  const openPositions = positions.length;
  const profitablePositions = positions.filter(pos => pos.profit > 0).length;
  const winRate = openPositions > 0 ? (profitablePositions / openPositions) * 100 : 0;

  // Fetch open positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const data = await getOpenPositions();
        setPositions(data);
      } catch (error) {
        console.error('Failed to fetch positions', error);
        toast({
          title: "Error",
          description: "Failed to load positions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [toast]);

  // Handle position close
  const handleClosePosition = async (positionId: string) => {
    try {
      await closePosition(positionId);
      setPositions(positions.filter(pos => pos.id !== positionId));
      toast({
        title: "Position Closed",
        description: "Position has been closed successfully",
      });
    } catch (error) {
      console.error('Failed to close position', error);
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive",
      });
    }
  };

  // Open modify position dialog
  const openModifyDialog = (position: any) => {
    setModifyingPosition(position);
    setNewStopLoss(position.stopLoss?.toString() || '');
    setNewTakeProfit(position.takeProfit?.toString() || '');
  };

  // Handle position modification
  const handleModifyPosition = async () => {
    if (!modifyingPosition) return;

    setIsSubmitting(true);
    try {
      await modifyPosition(modifyingPosition.id, {
        stopLoss: newStopLoss ? parseFloat(newStopLoss) : undefined,
        takeProfit: newTakeProfit ? parseFloat(newTakeProfit) : undefined,
      });

      // Update the position in the local state
      const updatedPositions = positions.map(pos => {
        if (pos.id === modifyingPosition.id) {
          return {
            ...pos,
            stopLoss: newStopLoss ? parseFloat(newStopLoss) : pos.stopLoss,
            takeProfit: newTakeProfit ? parseFloat(newTakeProfit) : pos.takeProfit,
          };
        }
        return pos;
      });

      setPositions(updatedPositions);
      setModifyingPosition(null);

      toast({
        title: "Position Updated",
        description: "Stop loss and take profit levels have been updated",
      });
    } catch (error) {
      console.error('Failed to modify position', error);
      toast({
        title: "Error",
        description: "Failed to update position",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Manage your active positions and place new trades</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Open Positions</span>
              <span className="text-2xl font-bold">{openPositions}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Unrealized P&L</span>
              <span className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="text-2xl font-bold">{winRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm text-muted-foreground">Profitable Positions</span>
              <span className="text-2xl font-bold">{profitablePositions}/{openPositions}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Positions */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="positions">Open Positions</TabsTrigger>
                <TabsTrigger value="orders">Pending Orders</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="positions">
              <Card>
                <CardContent className="p-4">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : positions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-3 text-left font-medium">Symbol</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-right font-medium">Volume</th>
                            <th className="px-4 py-3 text-right font-medium">Open Price</th>
                            <th className="px-4 py-3 text-right font-medium">Current</th>
                            <th className="px-4 py-3 text-right font-medium">P&L</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((position) => (
                            <tr key={position.id} className="border-b">
                              <td className="px-4 py-4">{position.instrument}</td>
                              <td className={`px-4 py-4 capitalize ${position.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                {position.type}
                              </td>
                              <td className="px-4 py-4 text-right">{position.volume}</td>
                              <td className="px-4 py-4 text-right">{position.openPrice}</td>
                              <td className="px-4 py-4 text-right">{position.currentPrice}</td>
                              <td className={`px-4 py-4 text-right ${position.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {position.profit >= 0 ? '+' : ''}{position.profit}
                                <span className="text-xs ml-1 text-muted-foreground">({position.pips} pips)</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModifyDialog(position)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleClosePosition(position.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ArrowDownUp className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-medium">No Open Positions</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use the trading panel to open new positions
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No Pending Orders</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Any limit orders you place will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Trading History</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your closed trades will appear here
                    </p>
                    <Button className="mt-4">
                      View Complete History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Trading Interface */}
        <div className="lg:col-span-1">
          <BrokerTradingInterface />
        </div>
      </div>

      {/* Modify Position Dialog */}
      <Dialog open={!!modifyingPosition} onOpenChange={() => setModifyingPosition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Position</DialogTitle>
            <DialogDescription>
              Update the stop loss and take profit levels for your position
            </DialogDescription>
          </DialogHeader>

          {modifyingPosition && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{modifyingPosition.instrument} {modifyingPosition.type.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">Open: {modifyingPosition.openPrice} | Current: {modifyingPosition.currentPrice}</p>
                  </div>
                  <div className={`text-right ${modifyingPosition.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="font-medium">
                      {modifyingPosition.profit >= 0 ? '+' : ''}{modifyingPosition.profit}
                    </p>
                    <p className="text-sm">
                      {modifyingPosition.pips >= 0 ? '+' : ''}{modifyingPosition.pips} pips
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stop-loss">Stop Loss</Label>
                  <Input
                    id="stop-loss"
                    value={newStopLoss}
                    onChange={(e) => setNewStopLoss(e.target.value)}
                    placeholder="Enter stop loss price"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="take-profit">Take Profit</Label>
                  <Input
                    id="take-profit"
                    value={newTakeProfit}
                    onChange={(e) => setNewTakeProfit(e.target.value)}
                    placeholder="Enter take profit price"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModifyingPosition(null)}>
                  Cancel
                </Button>
                <Button onClick={handleModifyPosition} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Portfolio;
