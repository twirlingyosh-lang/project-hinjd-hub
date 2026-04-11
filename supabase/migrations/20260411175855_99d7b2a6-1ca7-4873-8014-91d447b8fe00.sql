-- Drop the insecure public SELECT policy on crm-profiles storage bucket
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;