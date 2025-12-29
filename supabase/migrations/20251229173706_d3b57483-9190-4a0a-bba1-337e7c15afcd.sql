-- Add DELETE policy for profiles table (GDPR compliance)
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Update belt_diagnostics SELECT policy to remove anonymous data exposure
DROP POLICY IF EXISTS "Users can view own diagnostics or anonymous ones" ON public.belt_diagnostics;

CREATE POLICY "Users can view own diagnostics" 
ON public.belt_diagnostics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy for admins or original session to delete anonymous diagnostics
-- For now, allow authenticated users to delete anonymous diagnostics they created in their session
-- This is handled by making anonymous diagnostics deletable by any authenticated user (since we can't track session)
DROP POLICY IF EXISTS "Users can delete own diagnostics" ON public.belt_diagnostics;

CREATE POLICY "Users can delete own diagnostics" 
ON public.belt_diagnostics 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);