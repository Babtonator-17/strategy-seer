
import { supabase } from '@/integrations/supabase/client';

export interface ConfigStatus {
  openaiKeyValid: boolean;
  supabaseConnected: boolean;
  checkingOpenAI: boolean;
  checkingSupabase: boolean;
  error?: string;
}

export const checkConfiguration = async (): Promise<ConfigStatus> => {
  const status: ConfigStatus = {
    openaiKeyValid: false,
    supabaseConnected: false,
    checkingOpenAI: true,
    checkingSupabase: true
  };
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('broker_connections').select('id').limit(1);
    if (!error) {
      status.supabaseConnected = true;
    }
  } catch (err) {
    status.error = "Failed to connect to Supabase";
    console.error("Supabase connection error:", err);
  } finally {
    status.checkingSupabase = false;
  }
  
  // Check OpenAI key
  try {
    const { data, error } = await supabase.functions.invoke('check-openai-key');
    if (error) {
      throw new Error(error.message);
    }
    status.openaiKeyValid = data?.valid || false;
  } catch (err: any) {
    console.error("OpenAI key check error:", err);
  } finally {
    status.checkingOpenAI = false;
  }
  
  return status;
};
