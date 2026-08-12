-- 1. belt_diagnostics ownership
DELETE FROM public.belt_diagnostics WHERE user_id IS NULL;
ALTER TABLE public.belt_diagnostics ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.belt_diagnostics ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. stop realtime broadcast of dealer inventory
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'dealer_inventory'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.dealer_inventory';
  END IF;
END $$;

-- 3. SECURITY DEFINER function execute privileges
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.activate_user_module(uuid, text, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.deactivate_user_module(uuid, text) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_module_access(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.decrement_usage() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_usage_status() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_module_access(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_usage_status() TO authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_module_access(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_user_module(uuid, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.deactivate_user_module(uuid, text) TO service_role;