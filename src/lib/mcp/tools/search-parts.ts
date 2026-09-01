import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_parts",
  title: "Search equipment parts",
  description:
    "Search the equipment parts catalog by name, part number, or category and return matching parts with average pricing.",
  inputSchema: {
    query: z.string().trim().min(1).max(120).describe("Search text matched against part name and part number."),
    category: z.string().trim().min(1).max(100).optional().describe("Optional category filter."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum parts to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const escaped = query.replace(/[%,]/g, " ");
    let request = supabase
      .from("equipment_parts")
      .select("id, part_number, name, description, category, makes, equipment_types, avg_price")
      .or(`name.ilike.%${escaped}%,part_number.ilike.%${escaped}%`)
      .limit(limit ?? 10);
    if (category) request = request.ilike("category", category);

    const { data, error } = await request;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { parts: data ?? [] },
    };
  },
});
