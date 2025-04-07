
export interface BrokerConnection {
  id: string;
  user_id: string;
  broker_type: string;
  broker_name: string;
  server?: string;
  api_key?: string;
  api_secret?: string;
  account_id?: string;
  login?: string;
  is_active: boolean;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface TradeHistory {
  id: string;
  user_id: string;
  broker_connection_id?: string;
  instrument: string;
  direction: string;
  volume: number;
  open_price: number;
  close_price?: number;
  profit_loss?: number;
  open_time: string;
  close_time?: string;
  status: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AssistantConversation {
  id: string;
  user_id: string;
  messages: any[];
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}
