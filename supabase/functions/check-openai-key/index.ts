
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// Get API key from environment variables
const apiKey = Deno.env.get("OPENROUTER_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if API key is set
  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: "OpenRouter API key is not configured in Supabase secrets" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }

  try {
    // Make a simple request to OpenRouter API to verify the key
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://strategyseer.ai",
        "X-Title": "StrategySeer AI Trading Assistant"
      },
    });

    const data = await response.json();
    
    if (response.status === 200 && data.data) {
      // Key is valid
      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Key is invalid or another issue occurred
      console.error("OpenRouter API Error:", data);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: data.error?.message || "Invalid OpenRouter API key" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error verifying OpenRouter API key:", error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
