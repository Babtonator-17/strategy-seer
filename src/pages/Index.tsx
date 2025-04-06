
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PriceChart from '@/components/dashboard/PriceChart';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import TradingStrategies from '@/components/dashboard/TradingStrategies';
import TradeHistory from '@/components/dashboard/TradeHistory';
import AiAdvisor from '@/components/dashboard/AiAdvisor';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top row */}
        <PriceChart />
        
        {/* Right column */}
        <div className="flex flex-col gap-6">
          <PortfolioSummary />
          <AiAdvisor />
        </div>
        
        {/* Bottom row */}
        <div className="lg:col-span-2">
          <TradingStrategies />
        </div>
        <div>
          <TradeHistory />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
