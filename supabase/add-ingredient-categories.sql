-- =====================================================
-- Add ingredient_categories field to restaurants table
-- Stores custom ingredient category names per restaurant
-- =====================================================

-- Add JSONB column to store ingredient categories
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS ingredient_categories JSONB DEFAULT '{}'::jsonb;

-- Update existing restaurants with default categories
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

-- Verify
SELECT id, name, ingredient_categories
FROM restaurants
LIMIT 5;
