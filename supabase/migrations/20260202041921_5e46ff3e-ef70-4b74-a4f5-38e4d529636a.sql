-- Fix security issue: Restrict equipment_dealers to admin-only viewing for sensitive contact data
-- Regular users will access dealer info through controlled edge functions if needed
DROP POLICY IF EXISTS "Auth users can view dealers" ON public.equipment_dealers;

CREATE POLICY "Admins can view dealers"
ON public.equipment_dealers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix security issue: Restrict dealer_inventory to admin-only viewing
-- Inventory levels are sensitive business intelligence
DROP POLICY IF EXISTS "Auth users can view dealer inventory" ON public.dealer_inventory;

CREATE POLICY "Admins can view dealer inventory"
ON public.dealer_inventory
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix security issue: Restrict equipment_parts catalog to admin-only viewing
-- Parts pricing and catalog data is proprietary information
DROP POLICY IF EXISTS "Auth users can view parts" ON public.equipment_parts;

CREATE POLICY "Admins can view parts"
ON public.equipment_parts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));