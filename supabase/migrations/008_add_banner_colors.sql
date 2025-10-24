-- =====================================================
-- Migration 008: Add Color Columns to Promotion Banners
-- Author: Dr. Curiosity + Claude Code
-- Date: 2025-01-24
-- Purpose:
--   Add background_color and text_color columns to promotion_banners table
--   to allow customization of banner appearance
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Add color columns to promotion_banners
-- =====================================================
ALTER TABLE promotion_banners
  ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FF9500',
  ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#FFFFFF';

-- =====================================================
-- STEP 2: Set default colors for existing banners
-- =====================================================
UPDATE promotion_banners
SET
  background_color = COALESCE(background_color, '#FF9500'),
  text_color = COALESCE(text_color, '#FFFFFF')
WHERE background_color IS NULL OR text_color IS NULL;

-- =====================================================
-- STEP 3: Add comments for documentation
-- =====================================================
COMMENT ON COLUMN promotion_banners.background_color IS 'Hex color code for banner background (e.g., #FF9500)';
COMMENT ON COLUMN promotion_banners.text_color IS 'Hex color code for banner text (e.g., #FFFFFF)';

COMMIT;

-- =====================================================
-- Post-Migration Verification
-- =====================================================
-- Run this query to verify columns were added:
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'promotion_banners'
--   AND column_name IN ('background_color', 'text_color');
--
-- Expected result: 2 rows with VARCHAR(7) type
-- =====================================================
