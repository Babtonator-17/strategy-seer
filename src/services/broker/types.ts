
import { Json } from "@/types/supabase";

/**
 * Different broker connection types
 */
export enum BrokerType {
  DEMO = 'demo',
  PAPER = 'paper',
  MT4 = 'mt4',
  MT5 = 'mt5',
  BINANCE = 'binance',
  OANDA = 'oanda',
  ALPACA = 'alpaca',
}

/**
 * Interface for broker connection parameters
 */
export interface BrokerConnectionParams {
  type: BrokerType;
  server?: string;
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
  login?: string;
  password?: string;
  name?: string;
}

/**
 * Interface for trade order parameters
 */
export interface OrderParams {
  instrument: string;
  type: 'buy' | 'sell';
  volume: number;
  price?: number; // Optional for market orders
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
}

/**
 * Interface for position modification parameters
 */
export interface ModifyPositionParams {
  stopLoss?: number;
  takeProfit?: number;
}

/**
 * Interface for account information
 */
export interface AccountInfo {
  balance: number;
  equity: number;
  marginLevel: number;
  freeMargin: number;
  currency: string;
}

/**
 * Interface for position details
 */
export interface Position {
  id: string;
  instrument: string;
  type: string;
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  pips: number;
  openTime: string;
  stopLoss?: number;
  takeProfit?: number;
  accountType: string;
}
