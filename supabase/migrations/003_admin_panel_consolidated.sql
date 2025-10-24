-- =====================================================
-- Migration 003: Panel de Control Maestro (Consolidated)
-- Author: Dr. Curiosity + Claude Code
-- Date: 2025-01-24
-- Purpose:
--   1. Add is_admin column to restaurants table
--   2. Create index for fast admin lookups
--   3. Insert master admin user (restoranmaestroadmin)
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Add is_admin column
-- =====================================================
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN restaurants.is_admin IS 'TRUE if this is the master admin account';

-- =====================================================
-- STEP 2: Create index for admin lookups
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_restaurants_is_admin ON restaurants(is_admin);

-- =====================================================
-- STEP 3: Insert master admin user
-- =====================================================
-- Password: restoranmaestroadmin4155231
-- Hash generated with: bcrypt.hash('restoranmaestroadmin4155231', 10)
INSERT INTO restaurants (
  slug,
  name,
  password_hash,
  subscription_plan,
  subscription_status,
  theme_id,
  currency,
  timezone,
  is_admin,
  is_demo,
  created_at,
  updated_at
) VALUES (
  'restoranmaestroadmin',
  'Panel de Control Maestro',
  '$2b$10$mQmm7FuBj55MQDm7Jv6hP.GkLm1jNIrT6e970tIE9A480Xwvfxp1G',
  'premium',
  'active',
  'elegant',
  'CLP',
  'America/Santiago',
  TRUE,
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- =====================================================
-- Post-Migration Verification
-- =====================================================
-- Run this query to verify the migration was successful:
--
-- SELECT slug, name, is_admin, subscription_status
-- FROM restaurants
-- WHERE is_admin = TRUE;
--
-- Expected result:
--   slug: restoranmaestroadmin
--   name: Panel de Control Maestro
--   is_admin: true
--   subscription_status: active
-- =====================================================
