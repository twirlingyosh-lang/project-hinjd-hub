-- Fix SECURITY DEFINER functions to use auth.uid() directly instead of accepting user_id parameter
-- This prevents any authenticated user from manipulating another user's usage data

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.decrement_usage(uuid);
DROP FUNCTION IF EXISTS public.get_usage_status(uuid);

-- Recreate decrement_usage without parameter - uses auth.uid() directly
CREATE OR REPLACE FUNCTION public.decrement_usage()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_free_remaining integer;
  v_has_subscription boolean;
BEGIN
  -- SECURITY: Require authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be authenticated';
  END IF;
  
  -- Check if user has an active subscription
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = v_user_id 
    AND status = 'active'
  ) INTO v_has_subscription;
  
  -- If subscribed, allow unlimited usage
  IF v_has_subscription THEN
    UPDATE public.profiles 
    SET total_uses = total_uses + 1 
    WHERE id = v_user_id;
    RETURN true;
  END IF;
  
  -- Check free uses remaining
  SELECT free_uses_remaining INTO v_free_remaining
  FROM public.profiles 
  WHERE id = v_user_id;
  
  IF v_free_remaining IS NULL OR v_free_remaining <= 0 THEN
    RETURN false;
  END IF;
  
  -- Decrement free uses
  UPDATE public.profiles 
  SET free_uses_remaining = free_uses_remaining - 1,
      total_uses = total_uses + 1
  WHERE id = v_user_id;
  
  RETURN true;
END;
$$;

-- Recreate get_usage_status without parameter - uses auth.uid() directly
CREATE OR REPLACE FUNCTION public.get_usage_status()
RETURNS TABLE(free_uses_remaining integer, total_uses integer, has_active_subscription boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  -- SECURITY: Require authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    p.free_uses_remaining,
    p.total_uses,
    COALESCE((
      SELECT true FROM public.subscriptions 
      WHERE user_id = v_user_id AND status = 'active'
      LIMIT 1
    ), false) as has_active_subscription
  FROM public.profiles p
  WHERE p.id = v_user_id;
END;
$$;