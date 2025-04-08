import { supabase } from "@/integrations/supabase/client";
import { BrokerConnectionParams, BrokerType } from "./types";
import { storeBrokerConnection } from "../brokerService";

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
  
  // Store in localStorage for persistence across sessions
  storeBrokerConnection(connectionId, type);
};

/**
 * Connect to a broker
 */
export const connectToBroker = async (params: BrokerConnectionParams): Promise<boolean> => {
  try {
    // In a real app, this would connect to the actual broker API
    console.log(`Connecting to ${params.type} broker...`);
    
    // Simulate API connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo or paper, always return success locally
    if (params.type === BrokerType.DEMO || params.type === BrokerType.PAPER) {
      console.log(`Connected to ${params.type} broker successfully`);
      currentBrokerType = params.type;
      
      // Generate a local connection ID for demo/paper accounts
      const localConnectionId = `${params.type}_${Date.now().toString(36)}`;
      setCurrentBrokerConnection(params.type, localConnectionId);
      
      // Try to store in Supabase if user is logged in, but don't fail if it doesn't work
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session) {
          const { data, error } = await supabase.functions.invoke('connect-broker', {
            body: { 
              brokerType: params.type,
              credentials: {
                name: params.name || `My ${params.type} Account`,
                server: params.server,
                apiKey: params.apiKey,
                apiSecret: params.apiSecret,
                accountId: params.accountId,
                login: params.login,
                password: params.password,
                metadata: {
                  connectedAt: new Date().toISOString(),
                  platform: navigator.platform,
                  userAgent: navigator.userAgent
                }
              }
            }
          });
          
          if (error) {
            console.warn('Edge function error, but continuing with local demo mode:', error);
          } else if (data?.connectionId) {
            // If we got a connection ID from the server, use that instead
            setCurrentBrokerConnection(params.type, data.connectionId);
          }
        }
      } catch (error) {
        console.warn('Failed to store broker connection in database, but continuing with local demo mode:', error);
      }
      
      return true;
    }
    
    // For real brokers, validate credentials
    if (!params.apiKey && !params.login) {
      console.error('API key or login credentials required');
      return false;
    }
    
    // Try to connect using Supabase edge function
    try {
      const { data, error } = await supabase.functions.invoke('connect-broker', {
        body: { 
          brokerType: params.type,
          credentials: {
            name: params.name || params.type,
            server: params.server,
            apiKey: params.apiKey,
            apiSecret: params.apiSecret,
            accountId: params.accountId,
            login: params.login,
            password: params.password,
            metadata: {
              connectedAt: new Date().toISOString(),
              platform: navigator.platform,
              userAgent: navigator.userAgent
            }
          }
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data.error) throw new Error(data.error);
      
      // Set as current connection
      setCurrentBrokerConnection(params.type, data.connectionId);
      
      console.log('Connected to broker successfully');
      currentBrokerType = params.type;
      return true;
      
    } catch (error) {
      console.error('Failed to connect to broker via edge function:', error);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to broker:', error);
    return false;
  }
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
      // Try to update the database
      await supabase
        .from('broker_connections')
        .update({ is_active: false })
        .eq('id', currentBrokerConnectionId);
        
      // Also update localStorage
      try {
        const storedConnections = JSON.parse(localStorage.getItem('brokerConnections') || '[]');
        const updatedConnections = storedConnections.map((conn: any) => {
          if (conn.id === currentBrokerConnectionId) {
            return { ...conn, isActive: false };
          }
          return conn;
        });
        localStorage.setItem('brokerConnections', JSON.stringify(updatedConnections));
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
    } catch (error) {
      console.error('Error updating broker connection status:', error);
      // Continue with disconnection even if the database update fails
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
  // For demo purposes, return realistic mock data based on broker type
  if (currentBrokerType === BrokerType.DEMO) {
    return {
      balance: 10000,
      equity: 10245.75,
      marginLevel: 324.5,
      freeMargin: 9800,
      currency: 'USD',
      leverage: 100,
      accountType: 'Demo',
      server: 'Demo Server',
      name: 'Demo Trading Account'
    };
  } else if (currentBrokerType === BrokerType.PAPER) {
    return {
      balance: 50000,
      equity: 49875.32,
      marginLevel: 412.8,
      freeMargin: 48500,
      currency: 'USD',
      leverage: 50,
      accountType: 'Paper',
      server: 'Paper Trading',
      name: 'Paper Trading Account'
    };
  }
  
  // For real brokers, try to get info from the server
  try {
    // This would make an actual API call in a real implementation
    // For now, return more mock data based on the broker type
    switch (currentBrokerType) {
      case BrokerType.MT4:
      case BrokerType.MT5:
        return {
          balance: 25000,
          equity: 24890.75,
          marginLevel: 287.3,
          freeMargin: 23750,
          currency: 'USD',
          leverage: 200,
          accountType: 'Standard',
          server: 'MT5 Live Server',
          name: `My ${currentBrokerType.toUpperCase()} Account`
        };
      case BrokerType.BINANCE:
        return {
          balance: 1.25,
          equity: 1.28,
          marginLevel: 500,
          freeMargin: 1.2,
          currency: 'BTC',
          leverage: 20,
          accountType: 'Futures',
          server: 'Binance',
          name: 'My Binance Account'
        };
      case BrokerType.OANDA:
        return {
          balance: 15000,
          equity: 15120.50,
          marginLevel: 350.2,
          freeMargin: 14500,
          currency: 'EUR',
          leverage: 30,
          accountType: 'Premium',
          server: 'Oanda-EU',
          name: 'My Oanda Account'
        };
      case BrokerType.ALPACA:
        return {
          balance: 35000,
          equity: 36250.75,
          marginLevel: 410.5,
          freeMargin: 34000,
          currency: 'USD',
          leverage: 4,
          accountType: 'Margin',
          server: 'Alpaca Securities',
          name: 'My Alpaca Account'
        };
      default:
        return {
          balance: 10000,
          equity: 10000,
          marginLevel: 100,
          freeMargin: 10000,
          currency: 'USD',
          error: 'Failed to fetch account information'
        };
    }
  } catch (error) {
    console.error('Error fetching account info:', error);
    // Return fallback data in case of an error
    return {
      balance: 10000,
      equity: 10000,
      marginLevel: 100,
      freeMargin: 10000,
      currency: 'USD',
      error: 'Failed to fetch account information'
    };
  }
};
