-- Fix 1: Remove overly permissive INSERT policy on hq_transactions
-- Edge functions use service role key which bypasses RLS, so this policy is unnecessary and dangerous
DROP POLICY IF EXISTS "Service can insert transactions" ON public.hq_transactions;

-- Fix 2: Add authenticated user SELECT policies for dealer/parts tables
-- These tables need to be readable by all authenticated users for the app to function
-- Admin-only INSERT/UPDATE/DELETE policies remain in place for data protection

-- equipment_dealers: Allow authenticated users to view (read-only)
DROP POLICY IF EXISTS "Admins can view dealers" ON public.equipment_dealers;
CREATE POLICY "Auth users can view dealers"
ON public.equipment_dealers
FOR SELECT
TO authenticated
USING (true);

-- dealer_inventory: Allow authenticated users to view (read-only)
DROP POLICY IF EXISTS "Admins can view dealer inventory" ON public.dealer_inventory;
CREATE POLICY "Auth users can view dealer inventory"
ON public.dealer_inventory
FOR SELECT
TO authenticated
USING (true);

-- equipment_parts: Allow authenticated users to view (read-only)
DROP POLICY IF EXISTS "Admins can view parts" ON public.equipment_parts;
CREATE POLICY "Auth users can view parts"
ON public.equipment_parts
FOR SELECT
TO authenticated
USING (true);