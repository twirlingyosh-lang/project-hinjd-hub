-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view diagnostics" ON public.belt_diagnostics;

-- Create policy: users can view their own diagnostics OR anonymous diagnostics (if authenticated)
CREATE POLICY "Users can view own or anonymous diagnostics"
ON public.belt_diagnostics
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR user_id IS NULL)
);