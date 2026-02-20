-- Revoke execute on module management functions from authenticated and anon roles
-- These should only be callable by service_role (from edge functions)
REVOKE EXECUTE ON FUNCTION public.activate_user_module(uuid, text, timestamp with time zone) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.activate_user_module(uuid, text, timestamp with time zone) FROM anon;
REVOKE EXECUTE ON FUNCTION public.deactivate_user_module(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.deactivate_user_module(uuid, text) FROM anon;