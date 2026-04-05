import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    // Verify admin role
    const { data: hasRole } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });
    if (!hasRole) throw new Error("Admin access required");

    const { amount, destination } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid withdrawal amount");
    if (!destination || !['bank', 'cashapp'].includes(destination)) {
      throw new Error("Invalid destination. Use 'bank' or 'cashapp'");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const amountCents = Math.round(amount * 100);

    // Check Stripe balance
    const balance = await stripe.balance.retrieve();
    const availableUsd = balance.available.find(b => b.currency === 'usd');
    const availableAmount = availableUsd?.amount || 0;

    if (amountCents > availableAmount) {
      return new Response(JSON.stringify({
        success: false,
        code: 'INSUFFICIENT_BALANCE',
        error: `Insufficient Stripe balance. Available: $${(availableAmount / 100).toFixed(2)}`,
        available_balance: availableAmount / 100,
        requested_amount: amount,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create payout to default external account (bank)
    const payout = await stripe.payouts.create({
      amount: amountCents,
      currency: 'usd',
      description: `HINJD withdrawal — ${destination === 'bank' ? 'Sutton Bank' : 'Cash App'}`,
      metadata: {
        user_id: user.id,
        destination,
        initiated_at: new Date().toISOString(),
      },
    });

    // Log the withdrawal as a treasury activity
    await supabaseClient.from('treasury_activity').insert({
      user_id: user.id,
      activity_type: 'withdrawal',
      amount: amount,
      description: `Payout of $${amount.toFixed(2)} to ${destination === 'bank' ? 'Sutton Bank' : 'Cash App'} (${payout.id})`,
      status: payout.status,
    });

    return new Response(JSON.stringify({
      success: true,
      payout_id: payout.id,
      amount: amount,
      status: payout.status,
      estimated_arrival: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toLocaleDateString()
        : 'Processing',
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[WITHDRAW-FUNDS] ERROR:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
