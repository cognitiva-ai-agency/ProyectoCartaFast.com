# Guía de Migración: UUIDs → Slugs para Ingredientes

## 🎯 Objetivo
Convertir los IDs de ingredientes de UUIDs (ej: `89c4139a-b57e-4e5c-aeff-d0b88ad58d75`) a slugs legibles (ej: `carne-de-cerdo`).

---

## 📊 Tablas Afectadas

| Tabla | Columna Afectada | Tipo Anterior | Tipo Nuevo |
|-------|------------------|---------------|------------|
| `ingredients` | `id` | UUID | TEXT (slug) |
| `item_ingredients` | `ingredient_id` | UUID | TEXT (slug) |
| `unavailable_ingredients` | `ingredient_id` | UUID | TEXT (slug) |

---

## ⚠️ IMPORTANTE - Antes de Ejecutar

### 1. **Backup de la Base de Datos**
   - Ve a tu proyecto en Supabase Dashboard
   - Database → Backups
   - Haz clic en "Create Backup" o asegúrate de tener un backup reciente

### 2. **Verificar Datos Actuales**
   Ejecuta estas queries para ver el estado actual:

   ```sql
   -- Ver total de ingredientes
   SELECT COUNT(*) as total_ingredientes FROM ingredients;

   -- Ver total de relaciones item-ingredient
   SELECT COUNT(*) as total_relaciones FROM item_ingredients;

   -- Ver ejemplos de IDs actuales (UUIDs)
   SELECT id, name, category FROM ingredients LIMIT 5;
   ```

   **Anota estos números** para compararlos después de la migración.

---

## 🚀 Ejecución de la Migración

### **Paso 1: Abrir SQL Editor en Supabase**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor" en el menú lateral
4. Haz clic en "New Query"

### **Paso 2: Copiar el Script de Migración**
1. Abre el archivo: `supabase/migrations/005_migrate_ingredients_to_slugs_FINAL.sql`
2. Copia **TODO** el contenido (es un script largo, asegúrate de copiar desde la primera línea hasta la última)
3. Pégalo en el SQL Editor de Supabase

### **Paso 3: Ejecutar la Migración**
1. Revisa que el script esté completo en el editor
2. Haz clic en el botón **"Run"** (▶️) en la esquina inferior derecha
3. **Espera** - La migración puede tardar varios segundos o minutos dependiendo de la cantidad de datos

### **Paso 4: Revisar los Mensajes de Verificación**

Al finalizar, deberías ver mensajes como estos en la consola:

```
NOTICE: Total de ingredientes a migrar: XX
NOTICE: Todos los ingredientes tienen new_id asignado correctamente
NOTICE: item_ingredients - Total: XX, Actualizados: XX, Sin actualizar: 0
NOTICE:
NOTICE: ============================================
NOTICE:     VERIFICACIÓN DE MIGRACIÓN EXITOSA
NOTICE: ============================================
NOTICE:
NOTICE: Resumen:
NOTICE:   - Total ingredientes migrados: XX
NOTICE:   - Total relaciones item-ingredient: XX
NOTICE:   - Total ingredientes no disponibles: XX
NOTICE:
NOTICE: --- Muestra de ingredientes migrados ---
NOTICE:   ✓ ID: "carne-de-cerdo" | Nombre: "Carne de Cerdo"
NOTICE:   ✓ ID: "pollo" | Nombre: "Pollo"
NOTICE:   ... (más ejemplos)
NOTICE:
NOTICE: --- Muestra de relaciones item-ingredient ---
NOTICE:   ✓ Item: "Plato Ejemplo" usa ingrediente: "Carne de Cerdo" (ID: "carne-de-cerdo")
NOTICE:   ... (más ejemplos)
NOTICE:
NOTICE: ============================================
NOTICE:   ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
NOTICE: ============================================
```

**✅ Si ves este mensaje final: `✅ MIGRACIÓN COMPLETADA EXITOSAMENTE`**
→ ¡Perfecto! La migración fue exitosa.

**❌ Si ves algún ERROR:**
→ Copia el mensaje de error completo y compártelo conmigo.

---

## 🔍 Verificación Post-Migración

### 1. **Verificar IDs Convertidos a Slugs**

Ejecuta esta query para ver los nuevos IDs:

```sql
SELECT id, name, category
FROM ingredients
ORDER BY category, name
LIMIT 20;
```

**Deberías ver:**
- ✅ IDs como: `carne-de-cerdo`, `pollo`, `tomate`, etc.
- ❌ NO deberías ver UUIDs como: `89c4139a-b57e-4e5c-aeff-d0b88ad58d75`

### 2. **Verificar Relaciones Item-Ingredient**

```sql
SELECT
  i.name as item_name,
  ing.name as ingredient_name,
  ii.ingredient_id
FROM item_ingredients ii
JOIN items i ON ii.item_id = i.id
JOIN ingredients ing ON ii.ingredient_id = ing.id
LIMIT 10;
```

**Deberías ver:**
- La columna `ingredient_id` mostrando slugs legibles
- Los joins funcionando correctamente

### 3. **Verificar Totales (comparar con números anotados antes)**

```sql
SELECT
  (SELECT COUNT(*) FROM ingredients) as total_ingredients,
  (SELECT COUNT(*) FROM item_ingredients) as total_item_ingredients,
  (SELECT COUNT(*) FROM unavailable_ingredients) as total_unavailable;
```

**Los números deben ser IGUALES** a los que anotaste antes de la migración.

---

## 🎉 Próximos Pasos

Una vez completada la migración exitosamente:

### **1. Verificar en el Dashboard Web**
   - Ve a: https://proyecto-carta-fast-com.vercel.app/clientes
   - Inicia sesión con el Panel Maestro o con un restaurante
   - Ve al tab "Inventario"
   - **Verifica que los ingredientes se muestren correctamente**
   - Los IDs ahora deberían ser legibles: `carne-de-cerdo` en vez de `89c4139a-...`

### **2. Probar Creación de Nuevos Ingredientes**
   - Crea un nuevo ingrediente desde el dashboard
   - Verifica que se genere con un slug legible automáticamente

### **3. Probar Asignación de Ingredientes a Items**
   - Edita un plato
   - Asigna ingredientes
   - Verifica que la asignación funcione correctamente

---

## 🆘 Solución de Problemas

### Error: "column already exists"
**Causa:** La migración anterior dejó columnas temporales.

**Solución:**
```sql
-- Limpiar columnas temporales
ALTER TABLE ingredients DROP COLUMN IF EXISTS new_id;
ALTER TABLE item_ingredients DROP COLUMN IF EXISTS new_ingredient_id;
ALTER TABLE unavailable_ingredients DROP COLUMN IF EXISTS new_ingredient_id;

-- Luego volver a ejecutar la migración completa
```

### Error: "foreign key constraint violation"
**Causa:** Hay referencias que no se pudieron mapear.

**Solución:** Compartir el error completo para análisis.

### Error: "function slugify already exists"
**Causa:** El script se ejecutó parcialmente antes.

**Solución:**
```sql
-- Eliminar función anterior
DROP FUNCTION IF EXISTS slugify(TEXT);

-- Luego volver a ejecutar la migración completa
```

---

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. **NO ENTRES EN PÁNICO** - Los backups están ahí para protegerte
2. Copia el mensaje de error COMPLETO
3. Anota en qué paso del proceso estabas
4. Comparte esta información

---

## ✅ Checklist de Migración

- [ ] Backup de base de datos creado
- [ ] Números actuales anotados (total ingredients, total item_ingredients)
- [ ] Script copiado completo en SQL Editor
- [ ] Migración ejecutada sin errores
- [ ] Mensaje "✅ MIGRACIÓN COMPLETADA EXITOSAMENTE" visible
- [ ] Verificación post-migración ejecutada
- [ ] IDs ahora son slugs legibles
- [ ] Totales coinciden con números anteriores
- [ ] Dashboard web muestra ingredientes correctamente
- [ ] Creación de nuevos ingredientes funciona
- [ ] Asignación de ingredientes a items funciona

---

**Recuerda: "Vamos por parte un paso a la vez, lento pero seguro"** 🐢✨

**Fecha:** 2025-10-24
**Versión del Script:** 005_migrate_ingredients_to_slugs_FINAL.sql
