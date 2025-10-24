-- ========================================
-- PASO 1: Agregar columna is_admin
-- ========================================

-- Solo agregar la columna is_admin
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Verificación del Paso 1:
-- Ejecuta esto para confirmar que la columna se creó:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'restaurants' AND column_name = 'is_admin';
-- Debe devolver: is_admin
