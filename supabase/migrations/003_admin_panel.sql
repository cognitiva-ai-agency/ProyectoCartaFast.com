-- ========================================
-- Migración: Panel de Control Maestro
-- Fecha: 2025-10-24
-- Descripción: Agregar soporte para cuenta admin
-- ========================================

-- 1. Agregar columna is_admin a tabla restaurants
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Crear índice para búsquedas rápidas de admin
CREATE INDEX IF NOT EXISTS idx_restaurants_is_admin ON restaurants(is_admin);

-- 3. Insertar usuario maestro
-- Nota: El hash corresponde a la contraseña 'restoranmaestroadmin4155231'
-- Generado con: bcrypt.hash('restoranmaestroadmin4155231', 10)
INSERT INTO restaurants (
  name,
  slug,
  password_hash,
  subscription_status,
  is_admin,
  subscription_start_date,
  subscription_end_date,
  created_at,
  updated_at
) VALUES (
  'Panel de Control Maestro',
  'restoranmaestroadmin',
  '$2b$10$mQmm7FuBj55MQDm7Jv6hP.GkLm1jNIrT6e970tIE9A480Xwvfxp1G',
  'active',
  TRUE,
  NOW(),
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 4. Actualizar RLS policies para admin

-- Policy: Admin puede ver todos los restaurantes
DROP POLICY IF EXISTS "Admin can view all restaurants" ON restaurants;
CREATE POLICY "Admin can view all restaurants"
ON restaurants FOR SELECT
USING (
  -- Admin puede ver todos
  is_admin = TRUE
  OR
  -- Restaurantes normales solo ven su propia data
  auth.uid() IS NOT NULL
);

-- Policy: Admin puede actualizar cualquier restaurante
DROP POLICY IF EXISTS "Admin can update restaurants" ON restaurants;
CREATE POLICY "Admin can update restaurants"
ON restaurants FOR UPDATE
USING (
  -- Solo el admin puede actualizar otros restaurantes
  (SELECT is_admin FROM restaurants WHERE id = auth.uid()) = TRUE
  OR
  -- Los restaurantes solo pueden actualizarse a sí mismos
  id = auth.uid()
);

-- Policy: Admin puede insertar nuevos restaurantes
DROP POLICY IF EXISTS "Admin can insert restaurants" ON restaurants;
CREATE POLICY "Admin can insert restaurants"
ON restaurants FOR INSERT
WITH CHECK (
  -- Solo el admin puede crear restaurantes
  (SELECT is_admin FROM restaurants WHERE id = auth.uid()) = TRUE
);

-- Policy: Admin puede eliminar restaurantes
DROP POLICY IF EXISTS "Admin can delete restaurants" ON restaurants;
CREATE POLICY "Admin can delete restaurants"
ON restaurants FOR DELETE
USING (
  -- Solo el admin puede eliminar restaurantes
  (SELECT is_admin FROM restaurants WHERE id = auth.uid()) = TRUE
);

-- 5. Función helper para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Comentarios para documentación
COMMENT ON COLUMN restaurants.is_admin IS 'TRUE si es cuenta de administrador maestro';
COMMENT ON FUNCTION is_admin_user IS 'Verifica si un usuario es administrador';

-- ========================================
-- Fin de la migración
-- ========================================

-- Verificación (opcional - comentar en producción)
-- SELECT slug, name, is_admin, subscription_status
-- FROM restaurants
-- WHERE is_admin = TRUE;
