-- =====================================================
-- Add ingredient_categories field to restaurants table
-- Run this if you already have the storage bucket configured
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
-- VERIFICATION
-- =====================================================

-- Verify ingredient_categories field was added and populated
SELECT
  id,
  name,
  slug,
  ingredient_categories
FROM restaurants;

-- Show column details
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'restaurants'
AND column_name = 'ingredient_categories';
