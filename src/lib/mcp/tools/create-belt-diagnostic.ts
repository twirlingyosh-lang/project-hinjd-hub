import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_belt_diagnostic",
  title: "Create belt diagnostic",
  description:
    "Save a new conveyor belt diagnostic record for the signed-in user, including cause and recommendations.",
  inputSchema: {
    location: z.string().trim().min(1).max(200).describe("Where on the conveyor the issue was observed."),
    tracking_direction: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .describe("Direction the belt is mistracking, e.g. 'left', 'right', 'none'."),
    severity: z.string().trim().min(1).max(50).describe("Severity, e.g. 'low', 'medium', 'high', 'critical'."),
    cause: z.string().trim().min(1).max(1000).describe("Diagnosed root cause."),
    recommendations: z
      .array(z.string().trim().min(1).max(500))
      .min(1)
      .max(20)
      .describe("Recommended corrective actions."),
    belt_saver_benefits: z
      .array(z.string().trim().min(1).max(500))
      .max(20)
      .optional()
      .describe("How BeltSaver would address this issue."),
    notes: z.string().trim().max(2000).optional().describe("Additional free-form notes."),
    status: z.string().trim().min(1).max(50).optional().describe("Record status (default 'open')."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("belt_diagnostics")
      .insert({
        user_id: ctx.getUserId(),
        location: input.location,
        tracking_direction: input.tracking_direction,
        severity: input.severity,
        cause: input.cause,
        recommendations: input.recommendations,
        belt_saver_benefits: input.belt_saver_benefits ?? [],
        notes: input.notes ?? null,
        status: input.status ?? "open",
      })
      .select()
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Diagnostic saved (id ${data.id}).` }],
      structuredContent: { diagnostic: data },
    };
  },
});
