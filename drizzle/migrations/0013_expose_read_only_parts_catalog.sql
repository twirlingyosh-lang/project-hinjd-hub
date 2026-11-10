DROP POLICY IF EXISTS "Auth view parts" ON public.equipment_parts;
CREATE POLICY "Auth admins view parts"
ON public.equipment_parts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.equipment_parts_catalog
WITH (security_invoker = false) AS
SELECT id, part_number, name, description, category, equipment_types, makes, avg_price, image_url
FROM public.equipment_parts;

REVOKE ALL ON public.equipment_parts_catalog FROM anon, authenticated;
GRANT SELECT ON public.equipment_parts_catalog TO authenticated;
GRANT SELECT ON public.equipment_parts_catalog TO service_role;

COMMENT ON VIEW public.equipment_parts_catalog IS 'Read-only public catalog fields; base equipment_parts table is admin-only.';