import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const allowedOrigins = [
  'https://hinjd-ecosystem-hub.lovable.app',
  'https://id-preview--8a90f329-1999-4f92-9e0a-6730f7f00d7a.lovable.app',
  'https://zpslppxkrwjxsfotypdp.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com') || origin.endsWith('.lovable.app')
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  // Log without PII (no user IDs or emails)
  const safeDetails = details ? Object.fromEntries(
    Object.entries(details).filter(([key]) => !['userId', 'email', 'user_id'].includes(key))
  ) : undefined;
  const detailsStr = safeDetails && Object.keys(safeDetails).length > 0 ? ` - ${JSON.stringify(safeDetails)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user. Please subscribe first.");
    }
    
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const requestOrigin = req.headers.get("origin") || allowedOrigins[0];
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${requestOrigin}/aggregate-opps`,
    });
    
    logStep("Customer portal session created", { sessionId: portalSession.id });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
