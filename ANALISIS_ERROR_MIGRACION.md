# Análisis Técnico: Error en Migración de Ingredientes

## 📋 Resumen del Error

**Error Original:**
```
ERROR: 42703: column "ingredients" does not exist
QUERY: SELECT id, ingredients
FROM items
WHERE ingredients IS NOT NULL
```

**Script Fallido:** `004_migrate_ingredients_to_slugs.sql`
**Script Corregido:** `005_migrate_ingredients_to_slugs_FINAL.sql`

---

## 🔍 Análisis del Problema

### Suposición Incorrecta

El script original asumía esta estructura:

```sql
-- ❌ ESTRUCTURA ASUMIDA (INCORRECTA)
CREATE TABLE items (
  id UUID,
  name TEXT,
  ingredients JSONB,  -- Array de ingredient IDs
  ...
)
```

Con datos como:
```json
{
  "id": "item-123",
  "name": "Plato Ejemplo",
  "ingredients": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### Estructura Real

La estructura real de Supabase usa una **tabla junction** para relaciones many-to-many:

```sql
-- ✅ ESTRUCTURA REAL (CORRECTA)
CREATE TABLE items (
  id UUID,
  name TEXT,
  category_id UUID,
  base_price DECIMAL,
  -- NO tiene columna 'ingredients'
  ...
);

CREATE TABLE item_ingredients (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  ingredient_id UUID REFERENCES ingredients(id),  -- ← Esta columna necesita migración
  is_optional BOOLEAN,
  UNIQUE(item_id, ingredient_id)
);
```

Con datos como:
```
item_ingredients:
| item_id  | ingredient_id |
|----------|---------------|
| uuid-item-1 | uuid-ing-1 |
| uuid-item-1 | uuid-ing-2 |
| uuid-item-2 | uuid-ing-3 |
```

---

## 🛠️ Por Qué Falló el Script Original

### Fragmento del Script Fallido (Líneas 72-112)

```sql
-- PASO 6: Actualizar las referencias en la tabla items
DO $$
DECLARE
  item_record RECORD;
  old_ingredient_id TEXT;
  new_ingredient_id TEXT;
  new_ingredients TEXT[];
BEGIN
  -- ❌ ERROR AQUÍ: La tabla items NO tiene columna 'ingredients'
  FOR item_record IN
    SELECT id, ingredients  -- ← Column "ingredients" does not exist
    FROM items
    WHERE ingredients IS NOT NULL AND jsonb_array_length(ingredients::jsonb) > 0
  LOOP
    new_ingredients := ARRAY[]::TEXT[];

    FOR i IN 0 .. (jsonb_array_length(item_record.ingredients::jsonb) - 1)
    LOOP
      old_ingredient_id := item_record.ingredients::jsonb->>i;

      SELECT m.new_id INTO new_ingredient_id
      FROM ingredient_id_mapping m
      WHERE m.old_id::TEXT = old_ingredient_id;

      IF new_ingredient_id IS NOT NULL THEN
        new_ingredients := array_append(new_ingredients, new_ingredient_id);
      ELSE
        new_ingredients := array_append(new_ingredients, old_ingredient_id);
      END IF;
    END LOOP;

    UPDATE items
    SET ingredients = to_jsonb(new_ingredients)
    WHERE id = item_record.id;
  END LOOP;
END $$;
```

**Problemas:**
1. ❌ `SELECT id, ingredients FROM items` - La columna no existe
2. ❌ `jsonb_array_length(ingredients::jsonb)` - No hay JSONB array
3. ❌ `UPDATE items SET ingredients = ...` - No se puede actualizar una columna que no existe

---

## ✅ Solución Implementada

### Enfoque Correcto

El script corregido trabaja con la **tabla junction `item_ingredients`**:

```sql
-- PASO 6-7: Agregar columna temporal en item_ingredients
ALTER TABLE item_ingredients ADD COLUMN IF NOT EXISTS new_ingredient_id TEXT;

-- PASO 7: Poblar con slugs correspondientes
UPDATE item_ingredients ii
SET new_ingredient_id = m.new_id
FROM ingredient_id_mapping m
WHERE ii.ingredient_id = m.old_id;

-- Verificar actualizaciones
DO $$
DECLARE
  total_rows INTEGER;
  updated_rows INTEGER;
  null_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM item_ingredients;
  SELECT COUNT(*) INTO updated_rows FROM item_ingredients WHERE new_ingredient_id IS NOT NULL;
  SELECT COUNT(*) INTO null_rows FROM item_ingredients WHERE new_ingredient_id IS NULL;

  RAISE NOTICE 'item_ingredients - Total: %, Actualizados: %, Sin actualizar: %',
    total_rows, updated_rows, null_rows;

  IF null_rows > 0 THEN
    RAISE WARNING 'Hay % registros en item_ingredients sin new_ingredient_id', null_rows;
  END IF;
END $$;
```

### Tablas Afectadas Correctamente

El script corregido actualiza **3 tablas**:

1. **`ingredients`** (tabla principal)
   ```sql
   -- Cambiar id de UUID a TEXT (slug)
   ALTER TABLE ingredients ALTER COLUMN id TYPE TEXT;
   UPDATE ingredients SET id = new_id;
   ```

2. **`item_ingredients`** (relación items ↔ ingredients)
   ```sql
   -- Cambiar ingredient_id de UUID a TEXT (slug)
   ALTER TABLE item_ingredients ALTER COLUMN ingredient_id TYPE TEXT;
   UPDATE item_ingredients SET ingredient_id = new_ingredient_id;
   ```

3. **`unavailable_ingredients`** (ingredientes temporalmente no disponibles)
   ```sql
   -- Cambiar ingredient_id de UUID a TEXT (slug)
   ALTER TABLE unavailable_ingredients ALTER COLUMN ingredient_id TYPE TEXT;
   UPDATE unavailable_ingredients SET ingredient_id = new_ingredient_id;
   ```

---

## 📊 Comparación: Antes vs Después

### Antes de la Migración (UUIDs)

```sql
-- ingredients
| id (UUID)                                | name              |
|------------------------------------------|-------------------|
| 89c4139a-b57e-4e5c-aeff-d0b88ad58d75    | Carne de Cerdo    |
| 2e7b97c9-aecb-40ae-9801-5dbf7738393c    | Pollo             |

-- item_ingredients
| item_id (UUID)                           | ingredient_id (UUID)                     |
|------------------------------------------|------------------------------------------|
| f123-4567-89ab-cdef                      | 89c4139a-b57e-4e5c-aeff-d0b88ad58d75    |
| f123-4567-89ab-cdef                      | 2e7b97c9-aecb-40ae-9801-5dbf7738393c    |
```

### Después de la Migración (Slugs)

```sql
-- ingredients
| id (TEXT)           | name              |
|---------------------|-------------------|
| carne-de-cerdo      | Carne de Cerdo    |
| pollo               | Pollo             |

-- item_ingredients
| item_id (UUID)                           | ingredient_id (TEXT)  |
|------------------------------------------|-----------------------|
| f123-4567-89ab-cdef                      | carne-de-cerdo        |
| f123-4567-89ab-cdef                      | pollo                 |
```

---

## 🎯 Lecciones Aprendidas

### 1. **Siempre Verificar el Schema Real**
   - ❌ No asumir estructuras sin verificar
   - ✅ Consultar `schema.sql` o hacer `DESCRIBE TABLE`

### 2. **Entender Relaciones Many-to-Many**
   - Many-to-many se implementa con tabla junction
   - No con arrays JSON en una sola tabla

### 3. **Usar Columnas Temporales en Migraciones**
   - Agregar `new_id`, `new_ingredient_id` temporales
   - Poblar → Verificar → Cambiar tipo → Actualizar → Eliminar temporales
   - Más seguro y fácil de debuggear

### 4. **Verificaciones en Cada Paso**
   ```sql
   DO $$
   BEGIN
     -- Verificar resultados parciales
     RAISE NOTICE 'Total actualizado: %', (SELECT COUNT(*) FROM ...);
   END $$;
   ```

### 5. **Orden Correcto en Cambios de Tipo**
   ```sql
   -- ✅ CORRECTO
   1. Eliminar foreign keys
   2. Agregar columnas temporales
   3. Poblar columnas temporales
   4. Cambiar tipos de columnas
   5. Actualizar con valores finales
   6. Recrear foreign keys
   7. Eliminar columnas temporales

   -- ❌ INCORRECTO
   1. Cambiar tipo directamente
   2. Intentar actualizar mientras hay constraints
   ```

---

## 🔧 Debugging Tips

### Cómo Investigar Schema en Supabase

```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Ver columnas de una tabla específica
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'items';

-- Ver foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Cómo Verificar Datos Antes de Migrar

```sql
-- Ver estructura de datos en items
SELECT * FROM items LIMIT 1;

-- Ver estructura de relaciones
SELECT
  i.name as item_name,
  ing.name as ingredient_name
FROM items i
JOIN item_ingredients ii ON i.id = ii.item_id
JOIN ingredients ing ON ii.ingredient_id = ing.id
LIMIT 5;
```

---

## 📝 Conclusión

**Problema:** Script de migración falló porque asumió una estructura de datos incorrecta.

**Causa:** No verificar el schema real antes de escribir la migración.

**Solución:** Reescribir script para trabajar con la tabla junction `item_ingredients`.

**Resultado:** Script corregido (`005_migrate_ingredients_to_slugs_FINAL.sql`) que:
- ✅ Funciona con la estructura real de Supabase
- ✅ Usa columnas temporales para seguridad
- ✅ Actualiza todas las tablas relacionadas
- ✅ Proporciona verificación detallada en cada paso
- ✅ Maneja errores y conflictos de duplicados

---

**Filosofía Aplicada:**
> "Vamos por parte un paso a la vez, lento pero seguro" 🐢

**Fecha:** 2025-10-24
**Autor:** Claude Code + Dr. Curiosity
**Estado:** ✅ Resuelto
