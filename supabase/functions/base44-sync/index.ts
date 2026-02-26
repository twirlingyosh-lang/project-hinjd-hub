import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Zod schemas ──────────────────────────────────────────────────────────────

const moduleAccessSchema = z.object({
  email: z.string().email().max(255),
  module_name: z.string().min(1).max(100),
  active: z.boolean(),
  expires_at: z.string().datetime().nullable().optional(),
});

const inventoryItemSchema = z.object({
  dealer_id: z.string().uuid(),
  part_id: z.string().uuid(),
  quantity: z.number().int().min(0),
});

const crmClientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

const crmDealSchema = z.object({
  title: z.string().min(1).max(255),
  client_id: z.string().uuid().nullable().optional(),
  value: z.number().min(0).nullable().optional(),
  stage: z
    .enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"])
    .optional()
    .default("lead"),
  notes: z.string().max(5000).nullable().optional(),
});

const requestSchema = z.object({
  action: z.enum([
    "sync_module_access",
    "sync_inventory",
    "sync_crm_clients",
    "sync_crm_deals",
    "pull_module_access",
    "pull_inventory",
    "pull_crm_clients",
    "pull_crm_deals",
  ]),
  data: z.array(z.unknown()).min(1).max(200).optional(),
  filters: z.record(z.unknown()).optional(),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` – ${JSON.stringify(details)}` : "";
  console.log(`[base44-sync] ${step}${d}`);
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate with API key (machine-to-machine)
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("BASE44_API_KEY");

    if (!expectedApiKey) {
      logStep("ERROR", "BASE44_API_KEY not configured");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }
    if (!apiKey || apiKey !== expectedApiKey) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Parse & validate request body
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      logStep("Validation failed", parseResult.error.flatten());
      return jsonResponse(
        { error: "Invalid request", details: parseResult.error.flatten() },
        400
      );
    }

    const { action, data, filters } = parseResult.data;
    logStep("Action", { action, itemCount: data?.length });

    // Admin client for cross-user operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── PUSH actions (Base44 → Lovable Cloud) ─────────────────────────────

    if (action === "sync_module_access") {
      const items = z.array(moduleAccessSchema).parse(data);
      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const item of items) {
        // Resolve user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users?.users?.find(
          (u) => u.email?.toLowerCase() === item.email.toLowerCase()
        );
        if (!user) {
          results.push({ email: item.email, success: false, error: "user_not_found" });
          continue;
        }
        if (item.active) {
          const { error } = await supabaseAdmin.rpc("activate_user_module", {
            p_user_id: user.id,
            p_module_name: item.module_name,
            p_expires_at: item.expires_at ?? null,
          });
          results.push({ email: item.email, success: !error, error: error?.message });
        } else {
          const { error } = await supabaseAdmin.rpc("deactivate_user_module", {
            p_user_id: user.id,
            p_module_name: item.module_name,
          });
          results.push({ email: item.email, success: !error, error: error?.message });
        }
      }
      return jsonResponse({ success: true, results });
    }

    if (action === "sync_inventory") {
      const items = z.array(inventoryItemSchema).parse(data);
      const { data: upserted, error } = await supabaseAdmin
        .from("dealer_inventory")
        .upsert(
          items.map((i) => ({
            dealer_id: i.dealer_id,
            part_id: i.part_id,
            quantity: i.quantity,
          })),
          { onConflict: "dealer_id,part_id" }
        )
        .select("id, dealer_id, part_id, quantity, status");

      if (error) {
        logStep("Inventory sync error", error);
        return jsonResponse({ error: "Inventory sync failed", details: error.message }, 500);
      }
      return jsonResponse({ success: true, synced: upserted?.length ?? 0 });
    }

    if (action === "sync_crm_clients") {
      const items = z.array(crmClientSchema).parse(data);
      // Requires a target user_id in filters
      const targetUserId = filters?.user_id;
      if (!targetUserId || typeof targetUserId !== "string") {
        return jsonResponse({ error: "filters.user_id is required for CRM sync" }, 400);
      }

      const rows = items.map((c) => ({ ...c, user_id: targetUserId }));
      const { data: inserted, error } = await supabaseAdmin
        .from("crm_clients")
        .insert(rows)
        .select("id, name, email");

      if (error) {
        logStep("CRM client sync error", error);
        return jsonResponse({ error: "CRM client sync failed", details: error.message }, 500);
      }
      return jsonResponse({ success: true, synced: inserted?.length ?? 0 });
    }

    if (action === "sync_crm_deals") {
      const items = z.array(crmDealSchema).parse(data);
      const targetUserId = filters?.user_id;
      if (!targetUserId || typeof targetUserId !== "string") {
        return jsonResponse({ error: "filters.user_id is required for CRM sync" }, 400);
      }

      const rows = items.map((d) => ({ ...d, user_id: targetUserId }));
      const { data: inserted, error } = await supabaseAdmin
        .from("crm_deals")
        .insert(rows)
        .select("id, title, stage, value");

      if (error) {
        logStep("CRM deal sync error", error);
        return jsonResponse({ error: "CRM deal sync failed", details: error.message }, 500);
      }
      return jsonResponse({ success: true, synced: inserted?.length ?? 0 });
    }

    // ── PULL actions (Lovable Cloud → Base44) ─────────────────────────────

    if (action === "pull_module_access") {
      const email = filters?.email;
      if (!email || typeof email !== "string") {
        return jsonResponse({ error: "filters.email is required" }, 400);
      }

      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users?.find(
        (u) => u.email?.toLowerCase() === (email as string).toLowerCase()
      );
      if (!user) {
        return jsonResponse({ modules: [], reason: "user_not_found" });
      }

      const { data: modules } = await supabaseAdmin
        .from("user_modules")
        .select("module_name, active, activated_at, expires_at")
        .eq("user_id", user.id);

      return jsonResponse({ modules: modules ?? [] });
    }

    if (action === "pull_inventory") {
      const dealerId = filters?.dealer_id;
      let query = supabaseAdmin
        .from("dealer_inventory")
        .select("id, dealer_id, part_id, quantity, status, last_updated");

      if (dealerId && typeof dealerId === "string") {
        query = query.eq("dealer_id", dealerId);
      }

      const { data: inventory, error } = await query.limit(200);
      if (error) {
        return jsonResponse({ error: "Pull inventory failed", details: error.message }, 500);
      }
      return jsonResponse({ inventory: inventory ?? [] });
    }

    if (action === "pull_crm_clients") {
      const userId = filters?.user_id;
      if (!userId || typeof userId !== "string") {
        return jsonResponse({ error: "filters.user_id is required" }, 400);
      }
      const { data: clients, error } = await supabaseAdmin
        .from("crm_clients")
        .select("id, name, email, phone, notes, created_at")
        .eq("user_id", userId)
        .limit(200);

      if (error) {
        return jsonResponse({ error: "Pull clients failed", details: error.message }, 500);
      }
      return jsonResponse({ clients: clients ?? [] });
    }

    if (action === "pull_crm_deals") {
      const userId = filters?.user_id;
      if (!userId || typeof userId !== "string") {
        return jsonResponse({ error: "filters.user_id is required" }, 400);
      }
      const { data: deals, error } = await supabaseAdmin
        .from("crm_deals")
        .select("id, title, stage, value, notes, expected_close_date, client_id, created_at")
        .eq("user_id", userId)
        .limit(200);

      if (error) {
        return jsonResponse({ error: "Pull deals failed", details: error.message }, 500);
      }
      return jsonResponse({ deals: deals ?? [] });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
