-- Add usage tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS free_uses_remaining integer NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS total_uses integer NOT NULL DEFAULT 0;

-- Create a function to decrement usage and check limits
CREATE OR REPLACE FUNCTION public.decrement_usage(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_remaining integer;
  v_has_subscription boolean;
BEGIN
  -- Check if user has an active subscription
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = p_user_id 
    AND status = 'active'
  ) INTO v_has_subscription;
  
  -- If subscribed, allow unlimited usage
  IF v_has_subscription THEN
    UPDATE public.profiles 
    SET total_uses = total_uses + 1 
    WHERE id = p_user_id;
    RETURN true;
  END IF;
  
  -- Check free uses remaining
  SELECT free_uses_remaining INTO v_free_remaining
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF v_free_remaining IS NULL OR v_free_remaining <= 0 THEN
    RETURN false;
  END IF;
  
  -- Decrement free uses
  UPDATE public.profiles 
  SET free_uses_remaining = free_uses_remaining - 1,
      total_uses = total_uses + 1
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;

-- Create a function to check usage status
CREATE OR REPLACE FUNCTION public.get_usage_status(p_user_id uuid)
RETURNS TABLE(
  free_uses_remaining integer,
  total_uses integer,
  has_active_subscription boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.free_uses_remaining,
    p.total_uses,
    COALESCE((
      SELECT true FROM public.subscriptions 
      WHERE user_id = p_user_id AND status = 'active'
      LIMIT 1
    ), false) as has_active_subscription
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;