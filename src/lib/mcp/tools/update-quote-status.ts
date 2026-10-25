import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, logToolCall } from "../supabase";

export default defineTool({
  name: "update_quote_status",
  title: "Update quote request status",
  description: "Change the status of a BeltSaver quote request (admin accounts only).",
  inputSchema: {
    id: z.string().uuid().describe("Quote request id."),
    status: z.enum(["new", "contacted", "quoted", "won", "lost"]).describe("New status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    await logToolCall(supabase, "update_quote_status");
    const { data, error } = await supabase
      .from("quote_requests")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Quote not found or not permitted." }], isError: true };
    return { content: [{ type: "text", text: `Quote ${id} set to ${status}.` }], structuredContent: { quote: data } };
  },
});
