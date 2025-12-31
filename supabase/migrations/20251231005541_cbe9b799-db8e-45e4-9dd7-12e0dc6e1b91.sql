-- Drop existing policies that allow anonymous access on subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Recreate policies restricted to authenticated users only
CREATE POLICY "Authenticated users can view their own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);