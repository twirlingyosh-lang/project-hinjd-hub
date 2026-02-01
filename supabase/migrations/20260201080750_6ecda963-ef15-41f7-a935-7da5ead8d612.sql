-- Security Fix 1: Make crm-profiles bucket private and update policies
UPDATE storage.buckets SET public = false WHERE id = 'crm-profiles';

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;

-- Create authenticated-only policy for viewing profile pictures
-- Users can view profile pictures for clients they own
CREATE POLICY "Users can view own client profile pictures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'crm-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload profile pictures" ON storage.objects;
CREATE POLICY "Users can upload own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'crm-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own uploads
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
CREATE POLICY "Users can update own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'crm-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'crm-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own uploads
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'crm-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Security Fix 2: Restrict equipment_dealers modifications to admin only
DROP POLICY IF EXISTS "Auth users can insert dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth users can update dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth users can delete dealers" ON public.equipment_dealers;

CREATE POLICY "Admins can insert dealers"
ON public.equipment_dealers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dealers"
ON public.equipment_dealers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dealers"
ON public.equipment_dealers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Security Fix 3: Restrict equipment_parts modifications to admin only
DROP POLICY IF EXISTS "Auth users can insert parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth users can update parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth users can delete parts" ON public.equipment_parts;

CREATE POLICY "Admins can insert parts"
ON public.equipment_parts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update parts"
ON public.equipment_parts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete parts"
ON public.equipment_parts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Security Fix 4: Restrict dealer_inventory modifications to admin only
DROP POLICY IF EXISTS "Auth users can insert dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth users can update dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth users can delete dealer inventory" ON public.dealer_inventory;

CREATE POLICY "Admins can insert dealer inventory"
ON public.dealer_inventory FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dealer inventory"
ON public.dealer_inventory FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dealer inventory"
ON public.dealer_inventory FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));