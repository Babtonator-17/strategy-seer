
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BrokerType } from '@/services/brokerService';

interface BrokerFieldsProps {
  selectedBroker: BrokerType | '';
  formData: {
    server: string;
    apiKey: string;
    apiSecret: string;
    accountId: string;
    login: string;
    password: string;
    name: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BrokerFieldGroups: React.FC<BrokerFieldsProps> = ({ 
  selectedBroker, 
  formData, 
  handleInputChange 
}) => {
  if (!selectedBroker) return null;
  
  switch (selectedBroker) {
    case BrokerType.MT4:
    case BrokerType.MT5:
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="server">Server</Label>
            <Input
              id="server"
              name="server"
              value={formData.server}
              onChange={handleInputChange}
              placeholder="broker.metatrader.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              name="login"
              value={formData.login}
              onChange={handleInputChange}
              placeholder="12345678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••••"
            />
          </div>
        </>
      );
    
    case BrokerType.BINANCE:
    case BrokerType.ALPACA:
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="Your API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              name="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={handleInputChange}
              placeholder="••••••••••"
            />
          </div>
        </>
      );
    
    case BrokerType.OANDA:
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="Your API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountId">Account ID</Label>
            <Input
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleInputChange}
              placeholder="Your account ID"
            />
          </div>
        </>
      );
    
    case BrokerType.DEMO:
      return (
        <div className="py-2">
          <p className="text-sm text-muted-foreground">
            The demo broker uses simulated data for testing purposes. No credentials required.
          </p>
        </div>
      );
      
    default:
      return null;
  }
};

export default BrokerFieldGroups;
