
import { supabase } from "@/integrations/supabase/client";
import { BrokerConnectionParams, BrokerType } from "./types";

// Track current broker connection state
let currentBrokerType: BrokerType = BrokerType.DEMO;
let currentBrokerConnectionId: string | null = null;

/**
 * Get current broker connection type
 */
export const getCurrentBroker = (): BrokerType => {
  return currentBrokerType;
};

/**
 * Get current broker connection ID
 */
export const getCurrentBrokerConnectionId = (): string | null => {
  return currentBrokerConnectionId;
};

/**
 * Set current broker connection
 */
export const setCurrentBrokerConnection = (type: BrokerType, connectionId: string): void => {
  currentBrokerType = type;
  currentBrokerConnectionId = connectionId;
  console.log(`Current broker set to ${type} (ID: ${connectionId})`);
};

/**
 * Connect to a broker
 */
export const connectToBroker = async (params: BrokerConnectionParams): Promise<boolean> => {
  // In a real app, this would connect to the actual broker API
  console.log(`Connecting to ${params.type} broker...`);
  
  // Simulate API connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo or paper, always return success
  if (params.type === BrokerType.DEMO || params.type === BrokerType.PAPER) {
    console.log(`Connected to ${params.type} broker successfully`);
    currentBrokerType = params.type;
    return true;
  }
  
  // For real brokers, validate credentials
  if (!params.apiKey && !params.login) {
    console.error('API key or login credentials required');
    return false;
  }
  
  console.log('Connected to broker successfully');
  currentBrokerType = params.type;
  return true;
};

/**
 * Disconnect from a broker
 */
export const disconnectFromBroker = async (): Promise<boolean> => {
  console.log('Disconnecting from broker...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If we have a connection ID, update the database
  if (currentBrokerConnectionId) {
    try {
      await supabase
        .from('broker_connections')
        .update({ is_active: false })
        .eq('id', currentBrokerConnectionId);
    } catch (error) {
      console.error('Error updating broker connection status:', error);
    }
  }
  
  // Reset current connection
  currentBrokerType = BrokerType.DEMO;
  currentBrokerConnectionId = null;
  
  console.log('Disconnected from broker successfully');
  return true;
};

/**
 * Get account information
 */
export const getAccountInfo = async (): Promise<any> => {
  // For demo purposes, return mock data
  return {
    balance: 10000,
    equity: 10245.75,
    marginLevel: 324.5,
    freeMargin: 9800,
    currency: 'USD',
  };
};
