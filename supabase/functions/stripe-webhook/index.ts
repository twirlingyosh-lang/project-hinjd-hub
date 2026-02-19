import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Webhook received');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    // Enforce signature verification when webhook secret is configured
    if (webhookSecret) {
      if (!signature) {
        logStep('Rejected: missing stripe-signature header');
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep('Signature verified');
      } catch (err) {
        logStep('Signature verification failed', { error: err });
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    } else {
      // Fallback for development without webhook secret configured
      event = JSON.parse(body);
      logStep('WARNING: Processing without signature verification (no STRIPE_WEBHOOK_SECRET set)');
    }

    logStep('Event type', { type: event.type });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Handle payment intent succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logStep('Payment succeeded', { paymentIntentId: paymentIntent.id });

      // Update invoice status to paid
      const { data, error } = await supabase
        .from('crm_invoices')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .select();

      if (error) {
        logStep('Error updating invoice', { error: error.message });
      } else if (data && data.length > 0) {
        logStep('Invoice updated to paid', { invoiceId: data[0].id });
      } else {
        logStep('No invoice found with payment intent', { paymentIntentId: paymentIntent.id });
      }
    }

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep('Checkout completed', { sessionId: session.id, orderType: session.metadata?.order_type });

      // Handle part orders with 80/20 revenue split
      if (session.metadata?.order_type === 'part_order') {
        const businessRevenue = Number(session.metadata.business_revenue) / 100; // Convert cents to dollars
        const scholarshipFund = Number(session.metadata.scholarship_fund) / 100;
        const totalAmount = (session.amount_total || 50000) / 100;

        const { data: txData, error: txError } = await supabase
          .from('hq_transactions')
          .insert({
            user_id: session.metadata.user_id,
            amount: totalAmount,
            business_revenue: businessRevenue,
            scholarship_fund: scholarshipFund,
            transaction_type: 'part_order',
            description: `Part Order: ${session.metadata.part_name} (${session.metadata.part_number})`,
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'completed',
          })
          .select();

        if (txError) {
          logStep('Error logging part order transaction', { error: txError.message });
        } else {
          logStep('Part order transaction logged', { 
            transactionId: txData?.[0]?.id,
            amount: totalAmount,
            businessRevenue,
            scholarshipFund
          });
        }
      } else if (session.payment_intent) {
        // Handle regular invoice payments
        const { data, error } = await supabase
          .from('crm_invoices')
          .update({ 
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.metadata?.invoice_id)
          .select();

        if (error) {
          logStep('Error updating invoice from checkout', { error: error.message });
        } else if (data && data.length > 0) {
          logStep('Invoice updated from checkout', { invoiceId: data[0].id });
        }
      }
    }

    // Handle invoice paid (for subscriptions)
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      logStep('Invoice paid', { invoiceId: invoice.id });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
