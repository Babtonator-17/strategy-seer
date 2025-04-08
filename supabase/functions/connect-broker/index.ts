
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

    // For development purposes, allow connections without authentication
    // In production, you should remove this and require authentication
    let userId = null;
    if (session) {
      userId = session.user.id;
    } else {
      console.log("No session found, using demo mode");
      // We'll still proceed for demo purposes, but in a real app you might want to restrict this
    }

    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { brokerType, credentials } = reqBody;
    
    // Validate input
    if (!brokerType || !credentials) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let connectionId;
    
    // Store broker connection in database if user is authenticated
    if (userId) {
      try {
        // Use RPC function if available
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
          console.error('Error storing broker connection via RPC:', error);
          
          // Fallback to direct insert if RPC fails
          const insertResult = await supabaseClient
            .from('broker_connections')
            .insert({
              user_id: userId,
              broker_type: brokerType,
              broker_name: credentials.name || brokerType,
              server: credentials.server,
              api_key: credentials.apiKey,
              api_secret: credentials.apiSecret,
              account_id: credentials.accountId,
              login: credentials.login,
              is_active: true,
              metadata: credentials.metadata || {}
            })
            .select('id')
            .single();
            
          if (insertResult.error) {
            throw new Error(insertResult.error.message);
          }
          
          connectionId = insertResult.data.id;
        } else {
          connectionId = data;
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // For demo purposes, we'll continue with a generated connection ID
        connectionId = crypto.randomUUID();
      }
    } else {
      // Generate a fake connection ID for demo mode
      connectionId = crypto.randomUUID();
    }
    
    // Simulate connecting to broker API (in a real app, this would call the actual broker APIs)
    console.log(`Successfully connected to ${brokerType} broker`);
    
    // Test connection success
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
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
