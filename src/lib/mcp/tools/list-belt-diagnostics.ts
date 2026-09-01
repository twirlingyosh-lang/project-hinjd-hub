import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_belt_diagnostics",
  title: "List belt diagnostics",
  description:
    "List the signed-in user's saved conveyor belt diagnostic records, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Maximum records to return (default 10)."),
    status: z.string().trim().min(1).max(50).optional().describe("Filter by record status, e.g. 'open'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("belt_diagnostics")
      .select("id, created_at, location, tracking_direction, severity, cause, status, notes")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (status) query = query.eq("status", status);

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
