-- ========================================
-- PASO 2: Crear Usuario Maestro e Índice
-- Script ajustado a la estructura real de la tabla
-- ========================================

-- 1. Crear índice para búsquedas rápidas de admin
CREATE INDEX IF NOT EXISTS idx_restaurants_is_admin ON restaurants(is_admin);

-- 2. Insertar usuario maestro
-- Contraseña: restoranmaestroadmin4155231
-- Hash bcrypt generado
INSERT INTO restaurants (
  id,
  slug,
  name,
  password_hash,
  subscription_status,
  is_admin,
  is_demo,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'restoranmaestroadmin',
  'Panel de Control Maestro',
  '$2b$10$mQmm7FuBj55MQDm7Jv6hP.GkLm1jNIrT6e970tIE9A480Xwvfxp1G',
  'active',
  TRUE,
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- VERIFICACIÓN DEL PASO 2
-- ========================================
-- Ejecuta esto para confirmar que el usuario se creó:
SELECT slug, name, is_admin, subscription_status
FROM restaurants
WHERE is_admin = TRUE;

-- Debe devolver:
-- slug: restoranmaestroadmin
-- name: Panel de Control Maestro
-- is_admin: true
-- subscription_status: active
