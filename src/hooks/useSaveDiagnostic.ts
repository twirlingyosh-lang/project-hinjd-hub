import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { DiagnosticNode } from "@/data/crusher_logic";

export function useSaveDiagnostic(equipmentType: string) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (history: DiagnosticNode[], finalNode: DiagnosticNode) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save diagnostic results.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const path = history
        .filter((n) => n.question)
        .map((n) => n.question)
        .join(" → ");

      const { error } = await supabase.from("equipment_diagnostics").insert({
        user_id: user.id,
        equipment_type: equipmentType,
        symptoms: path || "Direct result",
        diagnosis: finalNode.action || "No action",
        status: "resolved",
      });

      if (error) throw error;

      setSaved(true);
      toast({ title: "Saved", description: "Diagnostic result saved to your records." });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetSaved = () => setSaved(false);

  return { save, saving, saved, resetSaved };
}
