-- ============================================
-- MIGRACIÓN: Convertir IDs de ingredientes de UUID a slugs legibles
-- Fecha: 2025-10-24
-- Descripción: Convierte los UUIDs de ingredientes a IDs legibles tipo "carne-de-cerdo"
-- ============================================

-- PASO 1: Crear función auxiliar para generar slugs
CREATE OR REPLACE FUNCTION slugify(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convertir a minúsculas
  slug := LOWER(text_input);

  -- Reemplazar caracteres especiales
  slug := TRANSLATE(slug,
    'áéíóúàèìòùäëïöüâêîôûñç',
    'aeiouaeiouaeiouaeiounñc'
  );

  -- Reemplazar espacios y caracteres no alfanuméricos con guiones
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Remover guiones al inicio y final
  slug := TRIM(BOTH '-' FROM slug);

  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- PASO 2: Crear tabla temporal para mapear UUIDs antiguos a nuevos slugs
CREATE TEMP TABLE ingredient_id_mapping AS
SELECT
  id AS old_id,
  slugify(name) AS new_id,
  restaurant_id,
  name
FROM ingredients;

-- PASO 3: Resolver conflictos de IDs duplicados agregando sufijos numéricos
WITH duplicates AS (
  SELECT new_id, COUNT(*) as count
  FROM ingredient_id_mapping
  GROUP BY new_id
  HAVING COUNT(*) > 1
),
numbered_duplicates AS (
  SELECT
    m.old_id,
    m.new_id,
    m.restaurant_id,
    m.name,
    ROW_NUMBER() OVER (PARTITION BY m.new_id, m.restaurant_id ORDER BY m.old_id) as row_num
  FROM ingredient_id_mapping m
  INNER JOIN duplicates d ON m.new_id = d.new_id
)
UPDATE ingredient_id_mapping m
SET new_id = nd.new_id || '-' || nd.row_num
FROM numbered_duplicates nd
WHERE m.old_id = nd.old_id AND nd.row_num > 1;

-- PASO 4: Agregar nueva columna new_id a la tabla ingredients
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS new_id TEXT;

-- PASO 5: Poblar la nueva columna con los slugs generados
UPDATE ingredients i
SET new_id = m.new_id
FROM ingredient_id_mapping m
WHERE i.id = m.old_id;

-- PASO 6: Actualizar las referencias en la tabla items
-- Los ingredientes están almacenados como array de strings en la columna ingredients
DO $$
DECLARE
  item_record RECORD;
  old_ingredient_id TEXT;
  new_ingredient_id TEXT;
  new_ingredients TEXT[];
BEGIN
  -- Iterar sobre cada item que tiene ingredientes
  FOR item_record IN
    SELECT id, ingredients
    FROM items
    WHERE ingredients IS NOT NULL AND jsonb_array_length(ingredients::jsonb) > 0
  LOOP
    new_ingredients := ARRAY[]::TEXT[];

    -- Iterar sobre cada ingrediente del item
    FOR i IN 0 .. (jsonb_array_length(item_record.ingredients::jsonb) - 1)
    LOOP
      old_ingredient_id := item_record.ingredients::jsonb->>i;

      -- Buscar el nuevo ID correspondiente
      SELECT m.new_id INTO new_ingredient_id
      FROM ingredient_id_mapping m
      WHERE m.old_id::TEXT = old_ingredient_id;

      -- Si encontramos el mapeo, usar el nuevo ID, sino mantener el original
      IF new_ingredient_id IS NOT NULL THEN
        new_ingredients := array_append(new_ingredients, new_ingredient_id);
      ELSE
        new_ingredients := array_append(new_ingredients, old_ingredient_id);
      END IF;
    END LOOP;

    -- Actualizar el item con el nuevo array de ingredientes
    UPDATE items
    SET ingredients = to_jsonb(new_ingredients)
    WHERE id = item_record.id;
  END LOOP;
END $$;

-- PASO 7: Cambiar el tipo de la columna id (requiere dropear y recrear constraints)
-- Primero, eliminar la primary key
ALTER TABLE ingredients DROP CONSTRAINT IF EXISTS ingredients_pkey CASCADE;

-- Cambiar el tipo de columna id de uuid a text
ALTER TABLE ingredients ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Actualizar los IDs con los nuevos slugs
UPDATE ingredients i
SET id = i.new_id;

-- Recrear la primary key
ALTER TABLE ingredients ADD PRIMARY KEY (id);

-- PASO 8: Eliminar la columna temporal new_id
ALTER TABLE ingredients DROP COLUMN IF EXISTS new_id;

-- PASO 9: Remover el default gen_random_uuid() ya que ahora usaremos slugs
ALTER TABLE ingredients ALTER COLUMN id DROP DEFAULT;

-- PASO 10: Limpiar
DROP FUNCTION IF EXISTS slugify(TEXT);

-- VERIFICACIÓN: Mostrar algunos ingredientes actualizados
SELECT
  id,
  name,
  category,
  restaurant_id
FROM ingredients
ORDER BY restaurant_id, category, name
LIMIT 20;

-- Mostrar los items que fueron actualizados
SELECT
  i.id,
  i.name,
  i.ingredients,
  r.slug as restaurant_slug
FROM items i
JOIN restaurants r ON i.restaurant_id = r.id
WHERE i.ingredients IS NOT NULL
  AND jsonb_array_length(i.ingredients::jsonb) > 0
LIMIT 10;

COMMENT ON COLUMN ingredients.id IS 'Slug generado del nombre del ingrediente (ej: carne-de-cerdo)';
