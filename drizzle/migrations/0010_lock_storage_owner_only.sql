DROP POLICY IF EXISTS "Auth users can view equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Auth view equip images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Auth view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth view assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;

CREATE POLICY "Owner or admin read equipment images" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'equipment-images' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Owner or admin read avatars" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Owner or admin list assets" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assets' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));