
-- 1. Add FK constraints to tables missing them
ALTER TABLE public.treasury_metrics
  ADD CONSTRAINT fk_treasury_metrics_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.fleet_units
  ADD CONSTRAINT fk_fleet_units_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.treasury_activity
  ADD CONSTRAINT fk_treasury_activity_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.crm_clients
  ADD CONSTRAINT fk_crm_clients_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.crm_deals
  ADD CONSTRAINT fk_crm_deals_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.crm_invoices
  ADD CONSTRAINT fk_crm_invoices_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.crm_messages
  ADD CONSTRAINT fk_crm_messages_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.workflow_runs
  ADD CONSTRAINT fk_workflow_runs_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.code_snippets
  ADD CONSTRAINT fk_code_snippets_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_modules
  ADD CONSTRAINT fk_user_modules_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
  ADD CONSTRAINT fk_user_roles_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Make public storage buckets private (avatars, crm-profiles)
UPDATE storage.buckets SET public = false WHERE id IN ('avatars', 'crm-profiles');

-- 3. Revoke direct execute on activate/deactivate module functions from authenticated role
-- These should only be called via service role from edge functions
REVOKE EXECUTE ON FUNCTION public.activate_user_module FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.deactivate_user_module FROM authenticated;

-- 4. Fix hq_transactions conflicting "Deny anonymous access" policy if it exists
DROP POLICY IF EXISTS "Deny anonymous access" ON public.hq_transactions;
