import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    // Use service role to access all fleet units
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Optional: authenticate caller (admin or cron)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const { data: { user } } = await anonClient.auth.getUser(token);
      if (user) {
        const { data: hasRole } = await anonClient.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        if (!hasRole) throw new Error("Admin access required");
      }
    }

    // Get all active fleet units with monthly_revenue > 0
    const { data: units, error: unitsError } = await supabaseClient
      .from('fleet_units')
      .select('*')
      .eq('status', 'active')
      .gt('monthly_revenue', 0);

    if (unitsError) throw unitsError;
    if (!units || units.length === 0) {
      return new Response(JSON.stringify({ message: 'No active fleet units with revenue', deposited: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Group by user_id and sum revenue
    const userRevenue: Record<string, { total: number; units: string[] }> = {};
    for (const unit of units) {
      if (!userRevenue[unit.user_id]) {
        userRevenue[unit.user_id] = { total: 0, units: [] };
      }
      userRevenue[unit.user_id].total += Number(unit.monthly_revenue);
      userRevenue[unit.user_id].units.push(unit.unit_name);
    }

    let totalDeposited = 0;
    const results = [];

    for (const [userId, data] of Object.entries(userRevenue)) {
      // Apply 80/20 split
      const businessRevenue = data.total * 0.8;
      const scholarshipFund = data.total * 0.2;

      // Update treasury metrics
      const { data: metrics } = await supabaseClient
        .from('treasury_metrics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (metrics) {
        await supabaseClient
          .from('treasury_metrics')
          .update({
            total_wealth: Number(metrics.total_wealth) + businessRevenue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', metrics.id);
      }

      // Log activity
      await supabaseClient.from('treasury_activity').insert({
        user_id: userId,
        activity_type: 'fleet_auto_deposit',
        amount: businessRevenue,
        description: `Auto-deposit from ${data.units.length} fleet unit(s): ${data.units.join(', ')} — Total: $${data.total.toFixed(2)} (80% business: $${businessRevenue.toFixed(2)}, 20% scholarship: $${scholarshipFund.toFixed(2)})`,
        status: 'success',
        metadata: { units: data.units, total_gross: data.total, business: businessRevenue, scholarship: scholarshipFund },
      });

      // Log HQ transaction
      await supabaseClient.from('hq_transactions').insert({
        user_id: userId,
        amount: data.total,
        business_revenue: businessRevenue,
        scholarship_fund: scholarshipFund,
        transaction_type: 'fleet_revenue',
        description: `Fleet auto-deposit: ${data.units.join(', ')}`,
        status: 'completed',
      });

      totalDeposited += businessRevenue;
      results.push({ user_id: userId, deposited: businessRevenue, units: data.units.length });
    }

    return new Response(JSON.stringify({
      success: true,
      total_deposited: totalDeposited,
      users_processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[FLEET-AUTO-DEPOSIT] ERROR:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
