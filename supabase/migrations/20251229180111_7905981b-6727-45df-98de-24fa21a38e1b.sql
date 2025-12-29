-- Fix avatars bucket: Make private to prevent anonymous scraping
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Fix documents bucket: Add server-side file size and MIME type restrictions
UPDATE storage.buckets 
SET file_size_limit = 10485760,
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

-- Update avatars policies to require authentication
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;

CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');