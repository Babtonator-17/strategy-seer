
// Re-export all broker service methods and types
export * from './broker';

import { createBrokerAdapter } from './broker/adapters/brokerAdapter';
import { getCurrentBroker, getCurrentBrokerConnectionId } from './broker/connectionManager';

// Add additional mobile-compatible utilities
export const isBrokerConnected = (): boolean => {
  try {
    // First check if we have an active connection in the current session
    const currentBroker = localStorage.getItem('currentBroker');
    if (currentBroker) return true;
    
    // Then check if we have any stored connections
    const brokerConnections = localStorage.getItem('brokerConnections');
    if (!brokerConnections) return false;
    
    const connections = JSON.parse(brokerConnections);
    return Array.isArray(connections) && connections.some(conn => conn.isActive === true);
  } catch (error) {
    console.error('Error checking broker connection status:', error);
    return false;
  }
};

export const getActiveConnection = () => {
  try {
    // First check current session
    const currentBroker = localStorage.getItem('currentBroker');
    if (currentBroker) {
      return JSON.parse(currentBroker);
    }
    
    // Then check stored connections
    const brokerConnections = localStorage.getItem('brokerConnections');
    if (!brokerConnections) return null;
    
    const connections = JSON.parse(brokerConnections);
    if (!Array.isArray(connections) || connections.length === 0) return null;
    
    // Return the most recently active connection
    const activeConnections = connections.filter(conn => conn.isActive === true);
    return activeConnections.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0] || null;
  } catch (error) {
    console.error('Error getting active connection:', error);
    return null;
  }
};

export const getConnectionStatus = () => {
  const connection = getActiveConnection();
  if (!connection) return { connected: false, type: null };
  return { connected: true, type: connection.type };
};

// Get account balance and info
export const getAccountInfo = async () => {
  const currentBroker = getCurrentBroker();
  const currentConnectionId = getCurrentBrokerConnectionId();
  
  if (!currentBroker || !currentConnectionId) {
    throw new Error('No active broker connection');
  }
  
  const adapter = createBrokerAdapter(currentBroker, { accountId: currentConnectionId });
  return adapter.getAccountInfo();
};

// Get open positions
export const getOpenPositions = async () => {
  const currentBroker = getCurrentBroker();
  const currentConnectionId = getCurrentBrokerConnectionId();
  
  if (!currentBroker || !currentConnectionId) {
    throw new Error('No active broker connection');
  }
  
  const adapter = createBrokerAdapter(currentBroker, { accountId: currentConnectionId });
  return adapter.getPositions();
};

// Store broker connection in localStorage for persistence across sessions
export const storeBrokerConnection = (connectionId, type, name = null) => {
  try {
    const connection = {
      id: connectionId,
      type,
      name: name || `${type} Connection`,
      timestamp: new Date().toISOString(),
      isActive: true
    };
    
    // Save as current broker
    localStorage.setItem('currentBroker', JSON.stringify(connection));
    
    // Add to connections history
    const storedConnections = JSON.parse(localStorage.getItem('brokerConnections') || '[]');
    const connectionExists = storedConnections.some((conn) => conn.id === connectionId);
    
    if (!connectionExists) {
      storedConnections.push(connection);
    } else {
      // Update existing connection
      const updatedConnections = storedConnections.map((conn) => {
        if (conn.id === connectionId) {
          return { ...conn, isActive: true, timestamp: connection.timestamp };
        }
        return conn;
      });
      storedConnections.splice(0, storedConnections.length, ...updatedConnections);
    }
    
    localStorage.setItem('brokerConnections', JSON.stringify(storedConnections));
    console.log(`Broker connection stored: ${type} (${connectionId})`);
    
    return true;
  } catch (error) {
    console.error('Error storing broker connection:', error);
    return false;
  }
};

// Helper function to get realistic demo market data
export const getMarketData = (symbol: string) => {
  const baseData: Record<string, any> = {
    BTCUSD: { price: 36450.25, change: 2.5, high: 36982.50, low: 35890.75, volume: 12450 },
    ETHUSD: { price: 2360.75, change: 1.8, high: 2395.25, low: 2330.50, volume: 8750 },
    EURUSD: { price: 1.0882, change: -0.15, high: 1.0905, low: 1.0870, volume: 124500 },
    GBPUSD: { price: 1.2640, change: 0.22, high: 1.2680, low: 1.2610, volume: 98200 },
    USDJPY: { price: 151.45, change: 0.08, high: 151.80, low: 151.10, volume: 78900 },
    XAUUSD: { price: 1982.30, change: 0.45, high: 1990.50, low: 1978.20, volume: 45600 },
    USOIL: { price: 78.25, change: -1.2, high: 79.85, low: 77.90, volume: 89700 },
    SPX500: { price: 4890.75, change: 0.65, high: 4910.25, low: 4875.50, volume: 1250000 },
    NASDAQ: { price: 17650.30, change: 0.95, high: 17700.40, low: 17580.80, volume: 950000 }
  };
  
  // Return the data for the requested symbol or a default if not found
  return baseData[symbol] || { price: 100.0, change: 0.0, high: 100.5, low: 99.5, volume: 10000 };
};

// Format numbers for display
export const formatCurrency = (value: number, currency = 'USD', digits = 2) => {
  if (currency === 'BTC' || currency === 'ETH') {
    return value.toFixed(8);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
};
