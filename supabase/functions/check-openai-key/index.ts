
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get API key from environment variables
const apiKey = Deno.env.get("OPENAI_API_KEY");

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
        error: "OpenAI API key is not configured" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }

  try {
    // Make a simple request to OpenAI API to verify the key
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
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
      console.error("OpenAI API Error:", data);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: data.error?.message || "Invalid OpenAI API key" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error verifying OpenAI API key:", error);
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
