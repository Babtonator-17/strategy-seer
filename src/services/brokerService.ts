
// Re-export all broker service methods and types
export * from './broker';

// Add additional mobile-compatible utilities
export const isBrokerConnected = (): boolean => {
  try {
    const brokerConnections = localStorage.getItem('brokerConnections');
    if (!brokerConnections) return false;
    
    const connections = JSON.parse(brokerConnections);
    return Array.isArray(connections) && connections.length > 0;
  } catch (error) {
    console.error('Error checking broker connection status:', error);
    return false;
  }
};

export const getActiveConnection = () => {
  try {
    const brokerConnections = localStorage.getItem('brokerConnections');
    if (!brokerConnections) return null;
    
    const connections = JSON.parse(brokerConnections);
    return Array.isArray(connections) && connections.length > 0 ? connections[0] : null;
  } catch (error) {
    console.error('Error getting active connection:', error);
    return null;
  }
};
