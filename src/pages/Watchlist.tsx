
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Star, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const watchlistItems = [
  { 
    id: 1, 
    symbol: 'BTCUSD', 
    name: 'Bitcoin',
    price: 36450.25,
    change: 2.5,
    favorite: true
  },
  { 
    id: 2, 
    symbol: 'ETHUSD', 
    name: 'Ethereum',
    price: 2360.75,
    change: 1.8,
    favorite: true
  },
  { 
    id: 3, 
    symbol: 'EURUSD', 
    name: 'Euro',
    price: 1.0882,
    change: -0.15,
    favorite: false
  },
  { 
    id: 4, 
    symbol: 'GBPUSD', 
    name: 'British Pound',
    price: 1.2640,
    change: 0.22,
    favorite: false
  },
  { 
    id: 5, 
    symbol: 'USDJPY', 
    name: 'Japanese Yen',
    price: 151.45,
    change: -0.32,
    favorite: false
  }
];

const Watchlist = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground">Keep track of your favorite instruments</p>
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Input 
            placeholder="Search instruments..." 
            className="max-w-[300px]" 
          />
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Instrument
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Watchlist Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-10 p-2"></th>
                    <th className="text-left p-2 font-medium">Symbol</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-right p-2 font-medium">Price</th>
                    <th className="text-right p-2 font-medium">Change</th>
                    <th className="w-10 p-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistItems.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/50">
                      <td className="p-2 text-center">
                        <Star 
                          className={`h-4 w-4 mx-auto ${item.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      </td>
                      <td className="p-2 font-medium">{item.symbol}</td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">
                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-2 text-right ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </td>
                      <td className="p-2 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Watchlist;
