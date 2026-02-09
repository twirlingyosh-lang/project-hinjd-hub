
-- =============================================
-- FIX 1: user_roles - CRITICAL privilege escalation
-- Prevent users from self-assigning admin roles
-- =============================================

-- Admin-only INSERT on user_roles
CREATE POLICY "Only admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin-only UPDATE on user_roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only DELETE on user_roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FIX 2: user_modules - Prevent users from activating premium modules
-- =============================================

-- Admin-only INSERT on user_modules
CREATE POLICY "Only admins can activate modules"
ON public.user_modules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin-only UPDATE on user_modules
CREATE POLICY "Only admins can update modules"
ON public.user_modules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only DELETE on user_modules
CREATE POLICY "Only admins can deactivate modules"
ON public.user_modules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FIX 3: hq_transactions - Restrict financial transaction creation
-- =============================================

-- Admin-only INSERT on hq_transactions
CREATE POLICY "Only admins can create transactions"
ON public.hq_transactions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin-only UPDATE on hq_transactions
CREATE POLICY "Only admins can update transactions"
ON public.hq_transactions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only DELETE on hq_transactions
CREATE POLICY "Only admins can delete transactions"
ON public.hq_transactions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FIX 4: email_leads - Protect lead integrity
-- =============================================

-- Admin-only UPDATE on email_leads
CREATE POLICY "Only admins can update leads"
ON public.email_leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only DELETE on email_leads
CREATE POLICY "Only admins can delete leads"
ON public.email_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
