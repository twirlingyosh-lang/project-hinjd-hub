import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? Object.fromEntries(
    Object.entries(details).filter(([key]) => !['userId', 'email', 'user_id'].includes(key))
  ) : undefined;
  const detailsStr = safeDetails && Object.keys(safeDetails).length > 0 ? ` - ${JSON.stringify(safeDetails)}` : '';
  console.log(`[CREATE-PART-ORDER] ${step}${detailsStr}`);
};

// Fixed $500 order amount
const ORDER_AMOUNT = 50000; // $500 in cents
const BUSINESS_SPLIT = 40000; // $400 (80%)
const SCHOLARSHIP_SPLIT = 10000; // $100 (20%)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    const { partNumber, partName, faultCode } = await req.json();
    if (!partNumber || !partName) {
      throw new Error("Part number and part name are required");
    }
    logStep("Order details received", { partNumber, partName, faultCode });

    // Authenticate user
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
      logStep("Existing customer found");
    }

    const requestOrigin = req.headers.get("origin") || "https://hinjd-ecosystem-hub.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Part Order: ${partName}`,
              description: `Part #: ${partNumber}${faultCode ? ` | Fault Code: ${faultCode}` : ''}`,
            },
            unit_amount: ORDER_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${requestOrigin}/crm?order=success&part=${encodeURIComponent(partNumber)}`,
      cancel_url: `${requestOrigin}/crm?order=canceled`,
      metadata: {
        user_id: user.id,
        order_type: 'part_order',
        part_number: partNumber,
        part_name: partName,
        fault_code: faultCode || '',
        business_revenue: String(BUSINESS_SPLIT),
        scholarship_fund: String(SCHOLARSHIP_SPLIT),
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
