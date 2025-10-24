-- =====================================================
-- MIGRATION: Supabase Storage + Ingredient Categories
-- =====================================================
-- This script must be executed in Supabase SQL Editor
-- It adds two critical features:
-- 1. Storage bucket for restaurant images
-- 2. Ingredient categories field in restaurants table
-- =====================================================

-- =====================================================
-- PART 1: Create Storage Bucket for Restaurant Images
-- =====================================================

-- Create public bucket for restaurant images (max 5MB per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  'restaurant-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy 1: Public read access
CREATE POLICY "Public read access for restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Storage Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant-images');

-- Storage Policy 3: Authenticated users can update
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'restaurant-images')
WITH CHECK (bucket_id = 'restaurant-images');

-- Storage Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'restaurant-images');

-- =====================================================
-- PART 2: Add Ingredient Categories to Restaurants
-- =====================================================

-- Add JSONB column to store custom ingredient category names
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS ingredient_categories JSONB DEFAULT '{}'::jsonb;

-- Populate existing restaurants with default Spanish categories
UPDATE restaurants
SET ingredient_categories = '{
  "CARNES": "Carnes",
  "PESCADOS": "Pescados y Mariscos",
  "VEGETALES": "Vegetales",
  "LACTEOS": "Lácteos",
  "CEREALES": "Cereales y Granos",
  "FRUTAS": "Frutas",
  "CONDIMENTOS": "Condimentos y Especias",
  "OTROS": "Otros"
}'::jsonb
WHERE ingredient_categories IS NULL OR ingredient_categories = '{}'::jsonb;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify storage bucket was created
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'restaurant-images';

-- Verify storage policies were created (should return 4 rows)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%restaurant images%';

-- Verify ingredient_categories field was added
SELECT
  id,
  name,
  ingredient_categories
FROM restaurants
LIMIT 5;

-- Show column details
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'restaurants'
AND column_name = 'ingredient_categories';
