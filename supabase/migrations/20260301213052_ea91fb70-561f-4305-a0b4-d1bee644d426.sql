
-- Restrict diagnostic_logic to users with equipment_diagnostics module access
DROP POLICY IF EXISTS "Auth view diagnostic logic" ON public.diagnostic_logic;
CREATE POLICY "Module users view diagnostic logic"
  ON public.diagnostic_logic FOR SELECT TO authenticated
  USING (public.has_module_access('equipment_diagnostics') OR public.has_role(auth.uid(), 'admin'::app_role));
