-- Make equipment-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'equipment-images';

-- Drop the old public access policy
DROP POLICY IF EXISTS "Anyone can view equipment images" ON storage.objects;

-- Create new policy requiring authentication for viewing
CREATE POLICY "Authenticated users can view equipment images" 
ON storage.objects 
FOR SELECT TO authenticated
USING (bucket_id = 'equipment-images');