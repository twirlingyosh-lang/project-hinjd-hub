-- Fix file upload validation: Add server-side restrictions to documents bucket
UPDATE storage.buckets 
SET file_size_limit = 10485760, -- 10MB in bytes
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
WHERE id = 'documents';

-- Fix avatars bucket: Require authentication to view (prevent anonymous scraping)
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Drop the unrestricted public policy
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Create policy requiring authentication to view avatars
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);