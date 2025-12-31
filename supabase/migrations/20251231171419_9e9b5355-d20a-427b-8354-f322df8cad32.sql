-- Fix: Remove NULL user_id option from belt_diagnostics INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create diagnostics" ON public.belt_diagnostics;

-- Ensure INSERT policy requires user_id to match auth.uid()
-- The existing "Users can insert diagnostics" policy already handles this correctly

-- Add DELETE policy for subscriptions (GDPR compliance)
CREATE POLICY "Users can delete their own subscription" 
ON public.subscriptions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);