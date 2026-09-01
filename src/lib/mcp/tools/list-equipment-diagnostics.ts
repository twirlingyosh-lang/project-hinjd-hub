import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_equipment_diagnostics",
  title: "List equipment diagnostics",
  description:
    "List the signed-in user's heavy equipment diagnostic sessions, newest first, optionally filtered by make or equipment type.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Maximum records to return (default 10)."),
    make: z.string().trim().min(1).max(100).optional().describe("Filter by equipment make, e.g. 'CAT'."),
    equipment_type: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .describe("Filter by equipment type, e.g. 'Excavator'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, make, equipment_type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("equipment_diagnostics")
      .select("id, created_at, equipment_type, make, model, symptoms, diagnosis, status")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (make) query = query.ilike("make", make);
    if (equipment_type) query = query.ilike("equipment_type", equipment_type);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { diagnostics: data ?? [] },
    };
  },
});
