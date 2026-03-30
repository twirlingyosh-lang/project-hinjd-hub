import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RequestSchema = z.object({
  unit_id: z.string().uuid(),
  amount: z.number().positive().max(100000),
  description: z.string().max(500).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user?.email) throw new Error("Not authenticated");

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { unit_id, amount, description } = parsed.data;

    // Verify fleet unit exists and belongs to user or user is admin
    const { data: unit, error: unitError } = await supabaseClient
      .from('fleet_units')
      .select('*')
      .eq('id', unit_id)
      .single();

    if (unitError || !unit) throw new Error("Fleet unit not found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for fleet lease payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Fleet Lease: ${unit.unit_name}`,
            description: description || `Monthly lease payment for ${unit.unit_name}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get("origin") || 'https://hinjd-ecosystem-hub.lovable.app'}/app/dashboard?payment=success&unit=${unit_id}`,
      cancel_url: `${req.headers.get("origin") || 'https://hinjd-ecosystem-hub.lovable.app'}/app/dashboard?payment=canceled`,
      metadata: {
        user_id: user.id,
        unit_id,
        unit_name: unit.unit_name,
        payment_type: 'fleet_lease',
      },
    });

    // Log pending payment activity
    await supabaseClient.from('treasury_activity').insert({
      user_id: user.id,
      activity_type: 'fleet_payment',
      amount,
      description: `Lease payment initiated: ${unit.unit_name} — $${amount.toFixed(2)}`,
      status: 'pending',
      metadata: { unit_id, session_id: session.id },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[FLEET-COLLECT-PAYMENT] ERROR:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
