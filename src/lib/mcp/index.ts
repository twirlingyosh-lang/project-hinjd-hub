import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBeltDiagnostics from "./tools/list-belt-diagnostics";
import createBeltDiagnostic from "./tools/create-belt-diagnostic";
import listEquipmentDiagnostics from "./tools/list-equipment-diagnostics";
import searchParts from "./tools/search-parts";
import listFleetUnits from "./tools/list-fleet-units";

// Built from the project ref (never SUPABASE_URL) so the issuer matches the
// discovery document Supabase publishes.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "project-hinjd-hub",
  title: "Project Hinjd Hub",
  version: "0.1.0",
  instructions:
    "Tools for Project Hinjd Hub, an industrial equipment and conveyor operations platform. Use `list_belt_diagnostics` and `create_belt_diagnostic` for conveyor belt tracking issues, `list_equipment_diagnostics` for heavy equipment diagnostic history, `search_parts` to look up parts and pricing, and `list_fleet_units` for fleet status and revenue. All tools act as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listBeltDiagnostics,
    createBeltDiagnostic,
    listEquipmentDiagnostics,
    searchParts,
    listFleetUnits,
  ],
});
