-- Fix user_modules policies: Users should ONLY be able to SELECT their modules
-- INSERT, UPDATE, DELETE should only happen via RPC functions with service role
-- This prevents users from granting themselves premium features

DROP POLICY IF EXISTS "Auth users can view own modules" ON public.user_modules;
DROP POLICY IF EXISTS "Auth users can insert own modules" ON public.user_modules;
DROP POLICY IF EXISTS "Auth users can update own modules" ON public.user_modules;
DROP POLICY IF EXISTS "Auth users can delete own modules" ON public.user_modules;

-- Only allow SELECT for authenticated users
CREATE POLICY "Auth users can view own modules"
ON public.user_modules FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No INSERT, UPDATE, DELETE policies for regular users
-- Module management happens through:
-- 1. activate_user_module() RPC function (SECURITY DEFINER)
-- 2. deactivate_user_module() RPC function (SECURITY DEFINER)
-- 3. Service role in check-subscription edge function