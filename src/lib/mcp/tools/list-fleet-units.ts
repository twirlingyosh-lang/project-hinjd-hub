import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_fleet_units",
  title: "List fleet units",
  description:
    "List the signed-in user's fleet units with status and monthly revenue, optionally filtered by status.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Maximum units to return (default 25)."),
    status: z.string().trim().min(1).max(50).optional().describe("Filter by unit status, e.g. 'active'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("fleet_units")
      .select("id, unit_name, unit_type, status, monthly_revenue, acquisition_date, notes")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const totalMonthlyRevenue = (data ?? []).reduce(
      (sum, unit) => sum + Number(unit.monthly_revenue ?? 0),
      0,
    );
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ units: data ?? [], totalMonthlyRevenue }, null, 2),
        },
      ],
      structuredContent: { units: data ?? [], totalMonthlyRevenue },
    };
  },
});
