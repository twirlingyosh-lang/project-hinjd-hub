
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth admins read manifests" ON storage.objects;
CREATE POLICY "Auth admins read manifests" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'manifests' AND has_role(auth.uid(), 'admin'::app_role));
