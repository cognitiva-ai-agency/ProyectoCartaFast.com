# Diagnóstico: Ingredientes No Aparecen

## 🔍 Problema Reportado

**Síntomas:**
- Solo aparecen las categorías de ingredientes
- NO aparecen los ingredientes dentro de cada categoría
- Esto ocurre en:
  - Tab "Inventario" (IngredientsManager)
  - Modal de selección al agregar/editar platos (IngredientSelector)

---

## 🕵️ Análisis de Código

### Componentes Afectados

**1. IngredientsManager** (`components/inventory/IngredientsManager.tsx`)
- Línea 60: Carga ingredientes desde API
```typescript
const res = await fetch(`/api/restaurants/${restaurantSlug}/ingredients`)
const data = await res.json()
setCategories(data.categories || {})
setIngredients(data.ingredients || [])  // ← Aquí carga los ingredientes
```

**2. IngredientSelector** (`components/editor/IngredientSelector.tsx`)
- Línea 41: También carga desde el mismo API
```typescript
const res = await fetch(`/api/restaurants/${session?.slug}/ingredients`)
const data = await res.json()
setCategories(data.categories || {})
setAllIngredients(data.ingredients || [])  // ← Aquí carga los ingredientes
```

### API de Ingredientes

**Endpoint:** `app/api/restaurants/[slug]/ingredients/route.ts`

**Método GET (líneas 54-68):**
```typescript
const { data: ingredients, error: ingredientsError } = await supabase
  .from('ingredients')
  .select('*')
  .eq('restaurant_id', restaurant.id)
  .order('category', { ascending: true })
  .order('name', { ascending: true })

const data: IngredientsData = {
  categories: customCategories,
  ingredients: (ingredients || []).map(ing => ({
    id: ing.id,
    name: ing.name,
    category: ing.category.toUpperCase(),
    isCommonAllergen: ing.is_allergen
  })),
  updated_at: new Date().toISOString()
}
```

---

## 🐛 Causas Posibles

### 1. **Migración Fallida** ⚠️ (MÁS PROBABLE)
   - Ejecutaste la migración `004_migrate_ingredients_to_slugs.sql` que FALLÓ
   - La migración completó solo pasos 1-5, pero falló en paso 6
   - Esto pudo dejar la base de datos en estado inconsistente:
     - Los ingredientes pueden tener IDs parcialmente migrados
     - Los ingredientes pueden haberse borrado accidentalmente
     - Las relaciones pueden estar rotas

### 2. **Base de Datos Vacía**
   - No hay ingredientes creados en Supabase para este restaurante
   - Los ingredientes se deben crear desde el dashboard

### 3. **Error en API**
   - El API está retornando error y el frontend lo maneja silenciosamente
   - El campo `restaurant_id` no coincide con el restaurante actual

---

## 🔧 Solución Paso a Paso

### **PASO 1: Verificar Estado de la Base de Datos** 🔍

**Ve a Supabase Dashboard → SQL Editor y ejecuta:**

```sql
-- 1. Ver cuántos ingredientes hay
SELECT COUNT(*) as total_ingredientes FROM ingredients;

-- 2. Ver tipo de columna 'id'
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'ingredients' AND column_name = 'id';

-- 3. Ver muestra de ingredientes
SELECT
  id,
  name,
  category,
  restaurant_id,
  is_allergen
FROM ingredients
LIMIT 10;

-- 4. Verificar si hay una columna 'new_id' temporal (de migración fallida)
SELECT
  column_name
FROM information_schema.columns
WHERE table_name = 'ingredients' AND column_name = 'new_id';
```

**Anota los resultados de estas queries.**

---

### **PASO 2: Decisión Según Resultados**

#### **Caso A: Si `total_ingredientes = 0`** ✅ (Más fácil)
→ **No hay ingredientes**, simplemente crea nuevos desde el dashboard.

**Solución:**
1. Ve al dashboard → Tab "Inventario"
2. Haz clic en "Nuevo Ingrediente"
3. Agrega algunos ingredientes de prueba
4. Verifica que ahora aparezcan

#### **Caso B: Si hay ingredientes pero `id` es tipo UUID** ⚠️
→ **La migración NO se ejecutó correctamente**

**Solución:**
1. Ejecutar la migración corregida: `005_migrate_ingredients_to_slugs_FINAL.sql`
2. Seguir la guía: `GUIA_MIGRACION_INGREDIENTES.md`

#### **Caso C: Si hay ingredientes pero `id` es tipo TEXT y hay columna `new_id`** ⚠️⚠️
→ **La migración falló a medias y dejó la BD en estado inconsistente**

**Solución (Limpiar estado):**
```sql
-- Eliminar columna temporal si existe
ALTER TABLE ingredients DROP COLUMN IF EXISTS new_id;
ALTER TABLE item_ingredients DROP COLUMN IF EXISTS new_ingredient_id;
ALTER TABLE unavailable_ingredients DROP COLUMN IF EXISTS new_ingredient_id;

-- Verificar que los ingredientes tienen IDs válidos
SELECT id, name FROM ingredients WHERE id IS NULL OR id = '';
```

Luego ejecutar migración `005_migrate_ingredients_to_slugs_FINAL.sql`.

#### **Caso D: Si hay ingredientes pero el campo `id` es TEXT con slugs** ✅
→ **La migración ya se completó correctamente**

**El problema está en el código del frontend o API.**

**Solución (Verificar):**
1. Abre el navegador en modo desarrollador (F12)
2. Ve a la pestaña "Network"
3. Accede al tab "Inventario" en el dashboard
4. Busca la petición a `/api/restaurants/[slug]/ingredients`
5. Verifica qué está retornando:
   - Si retorna error 500 → Problema en el API
   - Si retorna `{"ingredients": []}` vacío → Problema con filtro `restaurant_id`
   - Si retorna ingredientes → Problema en el frontend

---

### **PASO 3: Verificar Restaurant ID**

Si hay ingredientes en la BD pero no aparecen, puede ser un problema de `restaurant_id`.

**Ejecuta en Supabase:**
```sql
-- Ver restaurantes
SELECT id, slug, name FROM restaurants;

-- Ver ingredientes y a qué restaurante pertenecen
SELECT
  i.id,
  i.name,
  i.category,
  i.restaurant_id,
  r.slug as restaurant_slug,
  r.name as restaurant_name
FROM ingredients i
LEFT JOIN restaurants r ON i.restaurant_id = r.id
ORDER BY r.slug, i.category, i.name;
```

**Si los `restaurant_id` no coinciden**, necesitas:
1. Identificar el restaurante correcto
2. Actualizar los `restaurant_id` de los ingredientes:
```sql
-- EJEMPLO: Asignar ingredientes al restaurante correcto
UPDATE ingredients
SET restaurant_id = (SELECT id FROM restaurants WHERE slug = 'TU_SLUG_AQUI')
WHERE restaurant_id != (SELECT id FROM restaurants WHERE slug = 'TU_SLUG_AQUI');
```

---

### **PASO 4: Si Todo Falla - Reset de Ingredientes**

**⚠️ ÚLTIMA OPCIÓN: Borrar y recrear ingredientes**

```sql
-- 1. Hacer backup primero
CREATE TABLE ingredients_backup AS SELECT * FROM ingredients;
CREATE TABLE item_ingredients_backup AS SELECT * FROM item_ingredients;

-- 2. Limpiar todo
DELETE FROM item_ingredients;
DELETE FROM unavailable_ingredients;
DELETE FROM ingredients;

-- 3. Verificar estructura de tabla
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ingredients'
ORDER BY ordinal_position;

-- 4. Si la columna 'id' NO es TEXT, cambiarla
ALTER TABLE ingredients ALTER COLUMN id TYPE TEXT;
ALTER TABLE ingredients ALTER COLUMN id DROP DEFAULT;

-- 5. Recrear constraint
ALTER TABLE ingredients DROP CONSTRAINT IF EXISTS ingredients_pkey CASCADE;
ALTER TABLE ingredients ADD PRIMARY KEY (id);

-- 6. Actualizar columnas relacionadas
ALTER TABLE item_ingredients ALTER COLUMN ingredient_id TYPE TEXT;
ALTER TABLE unavailable_ingredients ALTER COLUMN ingredient_id TYPE TEXT;

-- 7. Recrear foreign keys
ALTER TABLE item_ingredients
  ADD CONSTRAINT item_ingredients_ingredient_id_fkey
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

ALTER TABLE unavailable_ingredients
  ADD CONSTRAINT unavailable_ingredients_ingredient_id_fkey
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;
```

Luego crea ingredientes nuevos desde el dashboard.

---

## 📊 Checklist de Diagnóstico

- [ ] Ejecuté query para contar ingredientes totales
- [ ] Verifiqué tipo de columna 'id' en tabla ingredients
- [ ] Vi muestra de ingredientes en la base de datos
- [ ] Busqué columnas temporales ('new_id', etc.)
- [ ] Verifiqué qué retorna el API en Network tab del navegador
- [ ] Comprobé que restaurant_id coincide con el restaurante actual
- [ ] Ejecuté migración correcta si era necesario
- [ ] Creé ingredientes de prueba desde el dashboard
- [ ] Verifiqué que ahora aparecen en inventario y selector

---

## 🎯 Solución Rápida (Si No Quieres Diagnosticar)

Si simplemente quieres **resetear todo y empezar de cero**:

1. **Backup en Supabase** (Dashboard → Database → Backups)
2. **Ejecuta el reset** (SQL del PASO 4 arriba)
3. **Ve al dashboard** → Tab "Inventario" → "Nuevo Ingrediente"
4. **Crea 5-10 ingredientes de prueba** en diferentes categorías
5. **Ve a "Editor de Menú"** → Agrega un plato → Selecciona ingredientes
6. **Verifica que aparecen** ✅

---

## 🆘 Si Nada Funciona

Comparte conmigo:
1. Output de las queries del PASO 1
2. Screenshot del Network tab mostrando la respuesta del API `/api/restaurants/[slug]/ingredients`
3. Screenshot de lo que ves en el dashboard (inventario)

Con esa información puedo darte una solución específica.

---

**Fecha:** 2025-10-24
**Autor:** Claude Code + Dr. Curiosity
**Prioridad:** 🔥 Alta - Funcionalidad Crítica
