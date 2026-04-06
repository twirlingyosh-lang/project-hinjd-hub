
-- 1. DROP the public-readable "Anyone can view profile pictures" policy (ERROR finding)
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;

-- 2. Fix public-role storage policies → replace with authenticated role
-- crm-contracts: drop public-role policies and recreate as authenticated
DROP POLICY IF EXISTS "Users can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own contracts" ON storage.objects;

CREATE POLICY "Auth upload contracts" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crm-contracts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Auth delete own contracts storage" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crm-contracts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- crm-invoices: drop public-role policies and recreate as authenticated
DROP POLICY IF EXISTS "Users can upload invoice PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own invoice PDFs" ON storage.objects;

CREATE POLICY "Auth upload invoices storage" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crm-invoices' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Auth delete own invoice storage" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crm-invoices' AND (storage.foldername(name))[1] = auth.uid()::text);

-- crm-profiles: drop public-role policies and recreate as authenticated
DROP POLICY IF EXISTS "Users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile pictures" ON storage.objects;

CREATE POLICY "Auth upload crm profile pics" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crm-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Auth delete crm profile pics" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crm-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Auth update crm profile pics" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'crm-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Drop unrestricted equipment image upload policy
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
