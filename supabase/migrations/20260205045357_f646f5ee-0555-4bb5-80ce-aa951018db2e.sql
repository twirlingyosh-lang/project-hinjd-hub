-- Add explicit policy to deny anonymous/public access to profiles table
-- This ensures only authenticated users can access profile data
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Add explicit policy to deny anonymous/public access to hq_transactions table  
-- This protects financial transaction data from unauthorized access
CREATE POLICY "Deny anonymous access to hq_transactions"
ON public.hq_transactions
FOR SELECT
TO anon
USING (false);