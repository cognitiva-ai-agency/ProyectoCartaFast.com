# 🔧 Fix: Edición de Categorías No Persistía

**Fecha:** 2025-10-23
**Problema Resuelto:** Los cambios en nombres de categorías no se guardaban permanentemente

---

## 📋 Problema Identificado

Al editar el nombre de una categoría en el Editor de Menú:
- ✅ El cambio se veía inmediatamente
- ❌ Al recargar la página, volvía al nombre anterior
- ❌ Los cambios NO se guardaban en la base de datos

### Causa Raíz

El API de categorías usaba un enfoque **destructivo**:

```typescript
// ❌ ANTES (INCORRECTO)
1. DELETE todas las categorías del restaurante
2. INSERT todas las categorías de nuevo
```

**Problema:** Al eliminar y volver a crear, se generaban **nuevos UUIDs** para cada categoría, lo que rompía las relaciones con los items.

**Ejemplo del flujo incorrecto:**
```
1. Usuario edita categoría "Entradas" → "Aperitivos"
2. Frontend envía TODAS las categorías al API
3. API ELIMINA todas (incluyendo "Entradas" con id=abc123)
4. API INSERTA todas de nuevo (nueva "Aperitivos" con id=xyz789)
5. Items siguen apuntando a category_id=abc123 (que ya no existe)
6. Al recargar, obtiene categorías desde BD con IDs nuevos
7. Pero el estado en memoria tiene los IDs viejos
```

---

## ✅ Solución Implementada

### Cambio en el API de Categorías

Ahora el API usa un enfoque **inteligente** que **preserva los IDs**:

```typescript
// ✅ DESPUÉS (CORRECTO)
1. Obtener categorías existentes de la BD
2. Para cada categoría recibida:
   - Si tiene ID existente → UPDATE (preserva ID)
   - Si es nueva → INSERT (genera nuevo ID)
3. Eliminar solo las categorías que ya no están en la lista
```

### Código Implementado

**`app/api/restaurants/[slug]/categories/route.ts`** (líneas 94-187)

```typescript
// Get existing categories to preserve IDs
const { data: existingCategories } = await supabase
  .from('categories')
  .select('id, name')
  .eq('restaurant_id', restaurant.id)

const existingMap = new Map(existingCategories?.map(c => [c.id, c]) || [])

// Separate into updates and inserts
const categoriesToUpdate: any[] = []
const categoriesToInsert: any[] = []
const categoryIdsToKeep = new Set<string>()

categories.forEach((cat: any, index: number) => {
  // If category has an ID that exists in DB, update it
  if (cat.id && existingMap.has(cat.id)) {
    categoriesToUpdate.push({ id: cat.id, ...categoryData })
    categoryIdsToKeep.add(cat.id)
  }
  // Otherwise, insert as new category
  else {
    categoriesToInsert.push({ restaurant_id: restaurant.id, ...categoryData })
  }
})

// Delete only categories that are no longer in the list
const categoryIdsToDelete = Array.from(existingMap.keys())
  .filter(id => !categoryIdsToKeep.has(id))

if (categoryIdsToDelete.length > 0) {
  await supabase.from('categories').delete().in('id', categoryIdsToDelete)
}

// Update existing categories (PRESERVES IDs)
for (const cat of categoriesToUpdate) {
  await supabase.from('categories')
    .update({ name: cat.name, ... })
    .eq('id', cat.id)
}

// Insert new categories
if (categoriesToInsert.length > 0) {
  await supabase.from('categories').insert(categoriesToInsert)
}
```

### Cambio en el Hook

**`hooks/useMenuFilesystem.ts`** (líneas 57-77)

```typescript
// ✅ ANTES: setCategories(newCategories) - Usaba estado local
// ✅ DESPUÉS:
const savedCategories = await res.json()
setCategories(savedCategories) // Usa categorías con IDs correctos del API
```

---

## 🔍 Flujo Correcto Ahora

### Escenario: Editar nombre de categoría

```
1. Usuario edita "Entradas" → "Aperitivos"
2. Frontend envía TODAS las categorías al API (con IDs existentes)
3. API identifica que la categoría tiene ID existente (abc123)
4. API hace UPDATE sobre la categoría abc123:
   UPDATE categories SET name='Aperitivos' WHERE id='abc123'
5. ID se preserva (abc123 sigue siendo abc123)
6. Items siguen apuntando correctamente a category_id=abc123
7. Al recargar, obtiene categoría con nombre "Aperitivos" e id=abc123 ✅
```

### Ventajas de la Nueva Implementación

✅ **Preserva relaciones:** Los items siguen vinculados a las categorías correctas
✅ **Actualiza eficientemente:** Solo modifica lo que cambió
✅ **Evita duplicados:** Elimina solo categorías que realmente se borraron
✅ **Mantiene consistencia:** El estado en frontend siempre coincide con la BD

---

## 📊 Operaciones Soportadas

| Operación | Comportamiento |
|-----------|---------------|
| **Editar nombre** | UPDATE con mismo ID |
| **Editar descripción** | UPDATE con mismo ID |
| **Reordenar** | UPDATE sort_order con mismo ID |
| **Agregar nueva** | INSERT con nuevo ID |
| **Eliminar** | DELETE solo la categoría eliminada |
| **Mostrar/Ocultar** | UPDATE is_visible con mismo ID |

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Editar Nombre
```
1. Cambiar "Entradas" → "Aperitivos"
2. Guardar
3. Recargar página
4. Verificar que aparece "Aperitivos" ✅
```

### ✅ Caso 2: Editar Múltiples Categorías
```
1. Cambiar "Entradas" → "Aperitivos"
2. Cambiar "Postres" → "Dulces"
3. Guardar
4. Recargar página
5. Verificar ambos cambios ✅
```

### ✅ Caso 3: Agregar Nueva Categoría
```
1. Crear nueva categoría "Bebidas"
2. Guardar
3. Recargar página
4. Verificar que "Bebidas" existe con nuevo ID ✅
```

### ✅ Caso 4: Eliminar Categoría
```
1. Eliminar categoría "Postres"
2. Guardar
3. Recargar página
4. Verificar que "Postres" ya no existe ✅
```

### ✅ Caso 5: Items Mantienen Relación
```
1. Categoría "Entradas" tiene 5 platos
2. Cambiar nombre a "Aperitivos"
3. Guardar y recargar
4. Verificar que los 5 platos siguen en "Aperitivos" ✅
```

---

## 📁 Archivos Modificados

1. **`app/api/restaurants/[slug]/categories/route.ts`**
   - Líneas 94-187: Nueva lógica de UPDATE/INSERT/DELETE selectivo
   - Preserva IDs existentes
   - Solo elimina categorías que realmente se borraron

2. **`hooks/useMenuFilesystem.ts`**
   - Línea 71-72: Usa categorías devueltas por el API (con IDs correctos)
   - Garantiza sincronización entre frontend y backend

---

## 🚀 Mejoras Adicionales Implementadas

### Manejo de `sort_order`

El API ahora acepta múltiples nombres de campo para el orden:
```typescript
sort_order: cat.position || cat.order || cat.sort_order || index
```

Esto garantiza compatibilidad con diferentes versiones del frontend.

### Actualización de `updated_at`

Todas las categorías actualizadas reciben automáticamente:
```typescript
updated_at: new Date().toISOString()
```

---

## ⚠️ Consideraciones

### Integridad Referencial

Gracias a que los IDs se preservan, las relaciones en la base de datos se mantienen intactas:

```sql
-- Items siguen apuntando correctamente a sus categorías
items.category_id → categories.id (FK constraint)
```

Si intentas eliminar una categoría que tiene items, PostgreSQL arrojará un error (a menos que se configure ON DELETE CASCADE).

---

## ✅ Estado Actual

**Problema:** ❌ Resuelto
**IDs Preservados:** ✅ Sí
**Relaciones Intactas:** ✅ Sí
**Cambios Persisten:** ✅ Sí

---

## 📝 Resumen

El problema de que los cambios no persistían se debía a que el API estaba **recreando** las categorías con nuevos IDs en lugar de **actualizar** las existentes.

La solución implementada:
1. **Preserva IDs** al actualizar categorías existentes
2. **Genera nuevos IDs** solo para categorías nuevas
3. **Elimina selectivamente** solo las categorías que realmente se borraron
4. **Sincroniza estado** usando las categorías devueltas por el API

Ahora los cambios en categorías se guardan permanentemente y las relaciones con items se mantienen intactas.

---

**Documentado por:** Claude Code
**Última Actualización:** 2025-10-23
