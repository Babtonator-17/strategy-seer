
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types/supabase";

/**
 * Helper functions to safely interact with Supabase tables
 * Use these functions to avoid TypeScript errors when working with tables
 */

// Define allowed table names as a type for type safety
type TableName = "assistant_conversations" | "broker_connections" | "trade_history" | "users";

// Type assertion helper for tables
export function table<T = any>(tableName: TableName) {
  return supabase.from(tableName) as any;
}

// Assistant conversation helpers
export const assistantConversations = {
  async getAll() {
    return table('assistant_conversations').select('*');
  },
  async getOne(id: string) {
    return table('assistant_conversations').select('*').eq('id', id).single();
  },
  async getLatest() {
    return table('assistant_conversations').select('*').order('updated_at', { ascending: false }).limit(1);
  },
  async insert(data: any) {
    return table('assistant_conversations').insert(data);
  },
  async update(id: string, data: any) {
    return table('assistant_conversations').update(data).eq('id', id);
  }
};

// Broker connections helpers
export const brokerConnections = {
  async getAll() {
    return table('broker_connections').select('*');
  },
  async getActive() {
    return table('broker_connections').select('*').eq('is_active', true);
  },
  async getById(id: string) {
    return table('broker_connections').select('*').eq('id', id).single();
  },
  async update(id: string, data: any) {
    return table('broker_connections').update(data).eq('id', id);
  },
  async setInactive(id: string) {
    return table('broker_connections').update({ is_active: false }).eq('id', id);
  }
};

// Trade history helpers
export const tradeHistory = {
  async getOpenPositions() {
    return table('trade_history').select('*').eq('status', 'open').order('open_time', { ascending: false });
  },
  async getClosedTrades(startDate?: string, endDate?: string) {
    let query = table('trade_history').select('*').eq('status', 'closed');
    
    if (startDate) {
      query = query.gte('open_time', startDate);
    }
    
    if (endDate) {
      query = query.lte('open_time', endDate);
    }
    
    return query.order('close_time', { ascending: false });
  },
  async getById(id: string) {
    return table('trade_history').select('*').eq('id', id).single();
  },
  async insert(data: any) {
    return table('trade_history').insert(data);
  },
  async update(id: string, data: any) {
    return table('trade_history').update(data).eq('id', id);
  },
  async closePosition(id: string, closeData: any) {
    return table('trade_history').update({
      status: 'closed',
      close_time: new Date().toISOString(),
      ...closeData
    }).eq('id', id);
  }
};
