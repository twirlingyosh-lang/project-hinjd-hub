-- Create user_modules table to track module access
CREATE TABLE public.user_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_name)
);

-- Enable RLS
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

-- Users can view their own modules
CREATE POLICY "Users can view their own modules"
ON public.user_modules
FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_modules_updated_at
BEFORE UPDATE ON public.user_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to activate a module for a user (called by edge functions after payment)
CREATE OR REPLACE FUNCTION public.activate_user_module(
  p_user_id UUID,
  p_module_name TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_modules (user_id, module_name, active, activated_at, expires_at)
  VALUES (p_user_id, p_module_name, true, now(), p_expires_at)
  ON CONFLICT (user_id, module_name)
  DO UPDATE SET 
    active = true,
    activated_at = COALESCE(user_modules.activated_at, now()),
    expires_at = p_expires_at,
    updated_at = now();
  RETURN true;
END;
$$;

-- Function to deactivate a module
CREATE OR REPLACE FUNCTION public.deactivate_user_module(
  p_user_id UUID,
  p_module_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_modules
  SET active = false, updated_at = now()
  WHERE user_id = p_user_id AND module_name = p_module_name;
  RETURN true;
END;
$$;

-- Function to check if user has module access
CREATE OR REPLACE FUNCTION public.has_module_access(p_module_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active BOOLEAN;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT active, expires_at INTO v_active, v_expires_at
  FROM public.user_modules
  WHERE user_id = auth.uid() AND module_name = p_module_name;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if expired
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    RETURN false;
  END IF;
  
  RETURN v_active;
END;
$$;