import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const Body = z.object({
  quote_id: z.string().uuid(),
  amount: z.number().positive().max(1_000_000),
});

const json = (b: unknown) =>
  new Response(JSON.stringify(b), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, error: "Not signed in" });
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!u.user) return json({ success: false, error: "Not signed in" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ success: false, error: "Admin access required" });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ success: false, error: parsed.error.flatten().fieldErrors });
    const { quote_id, amount } = parsed.data;

    const { data: q, error: qe } = await supabase.from("quote_requests").select("*").eq("id", quote_id).single();
    if (qe || !q) return json({ success: false, error: "Quote not found" });

    const { data: client, error: ce } = await supabase.from("crm_clients").insert({
      user_id: u.user.id, name: q.company ? `${q.name} (${q.company})` : q.name, email: q.email, phone: q.phone,
      notes: `From BeltSaver quote request. ${q.message ?? ""}`.trim(),
    }).select("id").single();
    if (ce) return json({ success: false, error: ce.message });

    const { data: inv, error: ie } = await supabase.from("crm_invoices").insert({
      user_id: u.user.id, client_id: client.id, amount, status: "sent",
    }).select("id").single();
    if (ie) return json({ success: false, error: ie.message });

    const cents = Math.round(amount * 100);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") ?? "https://hinjd-ecosystem-hub.lovable.app";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: q.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: cents,
          product_data: { name: `BeltSaver® order${q.quantity ? ` (${q.quantity} units)` : ""}` },
        },
      }],
      metadata: {
        crm_invoice_id: inv.id, quote_id,
        split_business: String(Math.round(cents * 0.8)), split_scholarship: String(cents - Math.round(cents * 0.8)),
      },
      success_url: `${origin}/beltsaver/quote?paid=1`,
      cancel_url: `${origin}/beltsaver`,
    });

    await supabase.from("crm_invoices").update({ payment_url: session.url }).eq("id", inv.id);
    await supabase.from("quote_requests").update({ status: "quoted", invoice_id: inv.id }).eq("id", quote_id);
    return json({ success: true, url: session.url, invoice_id: inv.id });
  } catch (e) {
    console.error("[QUOTE-TO-INVOICE]", e instanceof Error ? e.message : e);
    return json({ success: false, error: e instanceof Error ? e.message : "Unexpected error" });
  }
});
