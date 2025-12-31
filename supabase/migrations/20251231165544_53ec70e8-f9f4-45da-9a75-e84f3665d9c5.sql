-- Fix RLS policies to restrict to authenticated role only (not anon)

-- Drop and recreate belt_diagnostics policies with authenticated role only
DROP POLICY IF EXISTS "Users can view own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can update own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can delete own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can insert diagnostics" ON public.belt_diagnostics;

CREATE POLICY "Users can view own diagnostics" 
ON public.belt_diagnostics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert diagnostics" 
ON public.belt_diagnostics 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostics" 
ON public.belt_diagnostics 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnostics" 
ON public.belt_diagnostics 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Drop and recreate profiles policies with authenticated role only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- Drop and recreate subscriptions policies with authenticated role only
DROP POLICY IF EXISTS "Authenticated users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated users can update their own subscription" ON public.subscriptions;

CREATE POLICY "Authenticated users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own subscription" 
ON public.subscriptions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);