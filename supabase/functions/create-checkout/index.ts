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

// Hardcoded Stripe price IDs
const PRICE_IDS = {
  pro: "price_1SkSvRApXzGOpOgg3YvtNViL",
  enterprise: "price_1SkSvKApXzGOpOgg8flgnodS",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  // Log without PII (no user IDs or emails)
  const safeDetails = details ? Object.fromEntries(
    Object.entries(details).filter(([key]) => !['userId', 'email', 'user_id'].includes(key))
  ) : undefined;
  const detailsStr = safeDetails && Object.keys(safeDetails).length > 0 ? ` - ${JSON.stringify(safeDetails)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const { tier } = await req.json();
    if (!tier || !PRICE_IDS[tier as keyof typeof PRICE_IDS]) {
      throw new Error("Valid tier (pro or enterprise) is required");
    }
    
    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];
    logStep("Tier and price ID determined", { tier, priceId });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create new one");
    }

    const requestOrigin = req.headers.get("origin") || allowedOrigins[0];
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${requestOrigin}/aggregate-opps?checkout=success`,
      cancel_url: `${requestOrigin}/aggregate-opps?checkout=canceled`,
      metadata: {
        user_id: user.id,
        tier: tier,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
