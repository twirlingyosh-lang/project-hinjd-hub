-- Fix RLS policies to require authenticated role instead of allowing anonymous access
-- Note: This changes policies from PUBLIC to AUTHENTICATED role only

-- ===========================================
-- 1. Fix belt_diagnostics policies
-- ===========================================
DROP POLICY IF EXISTS "Users can delete own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can update own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can view own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can insert own diagnostics" ON public.belt_diagnostics;

CREATE POLICY "Authenticated users can view own diagnostics"
ON public.belt_diagnostics FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own diagnostics"
ON public.belt_diagnostics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own diagnostics"
ON public.belt_diagnostics FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own diagnostics"
ON public.belt_diagnostics FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ===========================================
-- 2. Fix equipment_diagnostics policies
-- ===========================================
DROP POLICY IF EXISTS "Users can delete own diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Users can update own diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Users can view own diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Users can insert own diagnostics" ON public.equipment_diagnostics;

CREATE POLICY "Authenticated users can view own equipment diagnostics"
ON public.equipment_diagnostics FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own equipment diagnostics"
ON public.equipment_diagnostics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own equipment diagnostics"
ON public.equipment_diagnostics FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own equipment diagnostics"
ON public.equipment_diagnostics FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ===========================================
-- 3. Fix profiles policies
-- ===========================================
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can delete own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ===========================================
-- 4. Fix subscriptions policies
-- ===========================================
DROP POLICY IF EXISTS "Authenticated users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;

CREATE POLICY "Auth users can view own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Auth users can insert own subscription"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can update own subscription"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can delete own subscription"
ON public.subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ===========================================
-- 5. Fix user_modules policies (add missing INSERT, UPDATE, DELETE)
-- ===========================================
DROP POLICY IF EXISTS "Users can view their own modules" ON public.user_modules;

CREATE POLICY "Auth users can view own modules"
ON public.user_modules FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Auth users can insert own modules"
ON public.user_modules FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can update own modules"
ON public.user_modules FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can delete own modules"
ON public.user_modules FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ===========================================
-- 6. Fix dealer_inventory policies
-- ===========================================
DROP POLICY IF EXISTS "Anyone can view dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON public.dealer_inventory;

CREATE POLICY "Auth users can view dealer inventory"
ON public.dealer_inventory FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Auth users can insert dealer inventory"
ON public.dealer_inventory FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can update dealer inventory"
ON public.dealer_inventory FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete dealer inventory"
ON public.dealer_inventory FOR DELETE
TO authenticated
USING (true);

-- ===========================================
-- 7. Fix equipment_dealers policies (protect contact info)
-- ===========================================
DROP POLICY IF EXISTS "Anyone can view dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON public.equipment_dealers;

CREATE POLICY "Auth users can view dealers"
ON public.equipment_dealers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Auth users can insert dealers"
ON public.equipment_dealers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can update dealers"
ON public.equipment_dealers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete dealers"
ON public.equipment_dealers FOR DELETE
TO authenticated
USING (true);

-- ===========================================
-- 8. Fix equipment_parts policies
-- ===========================================
DROP POLICY IF EXISTS "Anyone can view parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Authenticated users can insert parts" ON public.equipment_parts;

CREATE POLICY "Auth users can view parts"
ON public.equipment_parts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Auth users can insert parts"
ON public.equipment_parts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can update parts"
ON public.equipment_parts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete parts"
ON public.equipment_parts FOR DELETE
TO authenticated
USING (true);