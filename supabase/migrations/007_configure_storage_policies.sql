-- =====================================================
-- Migration 007: Configure Storage Policies
-- Author: Dr. Curiosity + Claude Code
-- Date: 2025-01-24
-- Purpose:
--   Configure Storage bucket policies for 'restaurant-images'
--   - Allow public read access for all images
--   - Allow authenticated users to upload/update/delete
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Enable public read access
-- =====================================================
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- =====================================================
-- STEP 2: Allow authenticated users to upload
-- =====================================================
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- STEP 3: Allow authenticated users to update
-- =====================================================
CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- STEP 4: Allow authenticated users to delete
-- =====================================================
CREATE POLICY IF NOT EXISTS "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- STEP 5: Allow service role to do everything
-- (for API routes using admin client)
-- =====================================================
CREATE POLICY IF NOT EXISTS "Service role full access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'restaurant-images'
  AND auth.jwt() ->> 'role' = 'service_role'
);

COMMIT;

-- =====================================================
-- Post-Migration Verification
-- =====================================================
-- Run this query to verify policies were created:
--
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects'
--   AND policyname LIKE '%restaurant-images%';
--
-- Expected result: 5 policies
-- =====================================================
