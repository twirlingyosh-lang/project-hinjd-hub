import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    // If webhook secret is configured, verify the signature
    if (webhookSecret && signature) {
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
      // For testing without webhook secret
      event = JSON.parse(body);
      logStep('Processing without signature verification');
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
      logStep('Checkout completed', { sessionId: session.id });

      if (session.payment_intent) {
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
