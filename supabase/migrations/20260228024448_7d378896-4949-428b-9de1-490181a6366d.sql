
-- Fix: restrict manifest uploads to service_role (webhook) and admins only
DROP POLICY "Auth admins upload manifests" ON storage.objects;

CREATE POLICY "Service role upload manifests" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'manifests' AND has_role(auth.uid(), 'admin'::app_role));
