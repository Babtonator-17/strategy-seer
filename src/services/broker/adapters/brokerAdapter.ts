
import { OrderParams } from "../types";

export interface AccountInfo {
  balance: number;
  currency: string;
  equity?: number;
  margin?: number;
  freeMargin?: number;
  leverage?: number;
}

export interface Position {
  id: string;
  instrument: string;
  type: 'buy' | 'sell';
  openPrice: number;
  currentPrice: number;
  volume: number;
  profit: number;
  openTime: Date | string;
  swap?: number;
  commission?: number;
}

export interface BrokerAdapter {
  /**
   * Tests the connection to the broker
   * @returns Promise resolving to a boolean indicating success
   */
  testConnection(): Promise<boolean>;

  /**
   * Gets account information
   * @returns Promise resolving to account information
   */
  getAccountInfo(): Promise<AccountInfo>;

  /**
   * Gets open positions
   * @returns Promise resolving to an array of positions
   */
  getPositions(): Promise<Position[]>;

  /**
   * Places an order
   * @param order Order parameters
   * @returns Promise resolving to order result
   */
  placeOrder(order: OrderParams): Promise<any>;
}

/**
 * Mock implementation of the BrokerAdapter
 */
export class MockBrokerAdapter implements BrokerAdapter {
  private readonly accountId: string;

  constructor(accountId: string = 'demo') {
    this.accountId = accountId;
  }

  async testConnection(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return true;
  }

  async getAccountInfo(): Promise<AccountInfo> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    return {
      balance: 10000 + Math.random() * 500,
      currency: 'USD',
      equity: 10500 + Math.random() * 700,
      margin: 1200 + Math.random() * 300,
      freeMargin: 9300 + Math.random() * 400,
      leverage: 100
    };
  }

  async getPositions(): Promise<Position[]> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'pos_btc_1',
        instrument: 'BTCUSD',
        type: 'buy',
        openPrice: 36200,
        currentPrice: 36450,
        volume: 0.15,
        profit: 37.5,
        openTime: hourAgo.toISOString()
      },
      {
        id: 'pos_eth_1',
        instrument: 'ETHUSD',
        type: 'buy',
        openPrice: 2250,
        currentPrice: 2280,
        volume: 0.5,
        profit: 15,
        openTime: dayAgo.toISOString()
      },
      {
        id: 'pos_eur_1',
        instrument: 'EURUSD',
        type: 'sell',
        openPrice: 1.092,
        currentPrice: 1.088,
        volume: 1000,
        profit: 4,
        openTime: hourAgo.toISOString()
      }
    ];
  }

  async placeOrder(order: OrderParams): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;
    const executionPrice = order.price || (Math.random() > 0.5 ? 
      order.type === 'buy' ? order.price * 1.001 : order.price * 0.999 :
      order.price);
    
    console.log(`[MockBroker] Placing order: ${order.type} ${order.volume} ${order.instrument} at ${executionPrice}`);
    
    return {
      orderId,
      instrument: order.instrument,
      type: order.type,
      volume: order.volume,
      price: executionPrice,
      status: 'executed',
      openTime: new Date().toISOString(),
    };
  }
}

// Factory function to create appropriate broker adapter
export function createBrokerAdapter(type: string, credentials: any): BrokerAdapter {
  switch (type.toLowerCase()) {
    case 'demo':
      return new MockBrokerAdapter(credentials?.accountId);
    // Additional adapters can be added here for real broker integrations
    default:
      console.warn(`No adapter available for broker type: ${type}, using mock adapter`);
      return new MockBrokerAdapter();
  }
}
