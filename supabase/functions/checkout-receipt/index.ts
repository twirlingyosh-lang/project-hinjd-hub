import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const Body = z.object({ session_id: z.string().regex(/^cs_[A-Za-z0-9_]+$/).max(255) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ success: false, error: "Sign in required" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sb.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return json({ success: false, error: "Sign in required" }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ success: false, error: "Invalid session" });
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const s = await stripe.checkout.sessions.retrieve(parsed.data.session_id, { expand: ["invoice", "payment_intent.latest_charge"] });
    if (s.metadata?.user_id !== user.id) return json({ success: false, error: "Not your purchase" });
    const inv = s.invoice as Stripe.Invoice | null;
    const charge = (s.payment_intent as Stripe.PaymentIntent | null)?.latest_charge as Stripe.Charge | null;
    return json({
      success: true,
      status: s.payment_status,
      tier: s.metadata?.tier ?? null,
      amount: (s.amount_total ?? 0) / 100,
      currency: s.currency,
      receipt_url: inv?.hosted_invoice_url ?? charge?.receipt_url ?? null,
      invoice_pdf: inv?.invoice_pdf ?? null,
    });
  } catch (e) {
    console.error("[CHECKOUT-RECEIPT]", e instanceof Error ? e.message : "error");
    return json({ success: false, error: "Could not load receipt" });
  }
});
