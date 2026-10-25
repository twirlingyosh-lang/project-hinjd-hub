import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, logToolCall } from "../supabase";

export default defineTool({
  name: "list_quote_requests",
  title: "List BeltSaver quote requests",
  description:
    "List BeltSaver quote requests and leads submitted from the public quote page, newest first. Only admin accounts can see them.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Maximum requests to return (default 25)."),
    status: z.string().trim().min(1).max(50).optional().describe("Filter by status, e.g. 'new' or 'contacted'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    await logToolCall(supabase, "list_quote_requests");
    let query = supabase
      .from("quote_requests")
      .select("id, created_at, name, email, company, phone, belt_width, quantity, message, status")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { quotes: data ?? [] },
    };
  },
});
