
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Markets = () => {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="crypto" className="w-full">
              <TabsList>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="forex">Forex</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="commodities">Commodities</TabsTrigger>
              </TabsList>
              <TabsContent value="crypto" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Bitcoin / USD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$36,450.25</div>
                      <p className="text-xs text-muted-foreground">+2.5% from yesterday</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Ethereum / USD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$2,360.75</div>
                      <p className="text-xs text-muted-foreground">+1.8% from yesterday</p>
                    </CardContent>
                  </Card>
                  {/* Add more cryptocurrency cards here */}
                </div>
              </TabsContent>
              <TabsContent value="forex" className="pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">EUR / USD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1.0882</div>
                      <p className="text-xs text-muted-foreground">-0.15% from yesterday</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">GBP / USD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1.2640</div>
                      <p className="text-xs text-muted-foreground">+0.22% from yesterday</p>
                    </CardContent>
                  </Card>
                  {/* Add more forex cards here */}
                </div>
              </TabsContent>
              <TabsContent value="stocks" className="pt-4">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Connect to a broker to view stocks data</p>
                </div>
              </TabsContent>
              <TabsContent value="commodities" className="pt-4">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Connect to a broker to view commodities data</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Markets;
