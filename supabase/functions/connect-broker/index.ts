
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { brokerType, credentials } = await req.json();
    
    // Validate input
    if (!brokerType || !credentials) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store broker connection in database
    const { data, error } = await supabaseClient
      .rpc('add_broker_connection', {
        p_broker_type: brokerType,
        p_broker_name: credentials.name || brokerType,
        p_server: credentials.server,
        p_api_key: credentials.apiKey,
        p_api_secret: credentials.apiSecret,
        p_account_id: credentials.accountId,
        p_login: credentials.login,
        p_metadata: credentials.metadata || {}
      });
    
    if (error) {
      console.error('Error storing broker connection:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store broker connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Simulate connecting to broker API (in a real app, this would call the actual broker APIs)
    const connectionId = data;
    
    // Test connection success - this is a mockup
    const testConnectionResult = {
      success: true,
      connectionId,
      message: `Successfully connected to ${brokerType}`,
    };
    
    return new Response(
      JSON.stringify(testConnectionResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in connect-broker function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
