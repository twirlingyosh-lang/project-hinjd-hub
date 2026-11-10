DROP POLICY IF EXISTS "Anon submit lead" ON public.email_leads;
CREATE POLICY "Anon submit validated lead"
ON public.email_leads FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND char_length(email) <= 255
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND (name IS NULL OR char_length(name) <= 100)
  AND (company IS NULL OR char_length(company) <= 100)
  AND source = 'free_diagnostic_trial'
  AND (status IS NULL OR status = 'new')
);

DROP POLICY IF EXISTS "Auth view dealers" ON public.equipment_dealers;
CREATE POLICY "Auth view verified dealers"
ON public.equipment_dealers FOR SELECT
TO authenticated
USING (is_verified = true OR public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.equipment_master
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS equipment_master_user_id_idx ON public.equipment_master(user_id);

DROP POLICY IF EXISTS "Auth view equipment master" ON public.equipment_master;
CREATE POLICY "Auth view own equipment master"
ON public.equipment_master FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));