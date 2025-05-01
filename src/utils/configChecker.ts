
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ConfigStatus {
  openaiKeyValid: boolean;
  supabaseConnected: boolean;
  checkingOpenAI: boolean;
  checkingSupabase: boolean;
  error?: string;
}

/**
 * Check the configuration of the application
 * Verifies that the OpenAI API key is valid and that the Supabase connection works
 */
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
    } else {
      console.error("Supabase connection error:", error);
      status.error = "Failed to connect to Supabase database";
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
    
    if (!status.openaiKeyValid && data?.error) {
      status.error = `OpenAI API key issue: ${data.error}`;
      console.error("OpenAI key error:", data.error);
    }
  } catch (err: any) {
    console.error("OpenAI key check error:", err);
    status.error = `Error checking OpenAI key: ${err.message}`;
  } finally {
    status.checkingOpenAI = false;
  }
  
  return status;
};

/**
 * Display appropriate notifications based on configuration status
 */
export const notifyConfigurationStatus = (status: ConfigStatus): void => {
  if (!status.supabaseConnected && !status.checkingSupabase) {
    toast({
      title: "Database Connection Issue",
      description: "Could not connect to the database. Some features may be unavailable.",
      variant: "destructive"
    });
  }
  
  if (!status.openaiKeyValid && !status.checkingOpenAI) {
    toast({
      title: "OpenAI API Key Issue",
      description: "The OpenAI API key is missing or invalid. AI features will not work properly.",
      variant: "destructive"
    });
  }
};
