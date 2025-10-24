-- =====================================================
-- SUPABASE STORAGE SETUP
-- Create buckets and policies for restaurant images
-- =====================================================

-- Create bucket for restaurant images (items, logos, categories)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  'restaurant-images',
  true, -- Public bucket (images are publicly accessible)
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR restaurant-images BUCKET
-- =====================================================

-- Policy 1: Allow public READ access to all images
CREATE POLICY "Public read access for restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Policy 2: Allow authenticated INSERT (upload)
-- Only authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant-images');

-- Policy 3: Allow authenticated UPDATE
-- Only authenticated users can update images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'restaurant-images')
WITH CHECK (bucket_id = 'restaurant-images');

-- Policy 4: Allow authenticated DELETE
-- Only authenticated users can delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'restaurant-images');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'restaurant-images';

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%restaurant images%';
