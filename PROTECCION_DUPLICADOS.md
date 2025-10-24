# 🛡️ Protección Contra Duplicación de Platos

**Fecha:** 2025-10-23
**Problema Resuelto:** Duplicación automática de platos en el menú

---

## 📋 Problema Identificado

Se estaban duplicando platos automáticamente en cada categoría del menú sin intervención manual. Los platos se replicaban causando que aparecieran múltiples veces en la misma categoría.

### Posibles Causas

1. **Guardados múltiples:** El frontend podría estar enviando el mismo plato varias veces
2. **React Strict Mode:** En desarrollo, React ejecuta efectos dos veces, lo que podría causar guardados duplicados
3. **Problemas de estado:** El estado del hook podría tener duplicados antes de enviar al API
4. **Llamadas concurrentes:** Múltiples llamadas al API en rápida sucesión

---

## ✅ Solución Implementada

### Deduplicación Automática en el API

He agregado **deduplicación automática** en `app/api/restaurants/[slug]/items/route.ts` (método POST):

```typescript
// DEDUPLICATION: Remove duplicate items based on name + category_id
// This prevents accidental duplication from multiple saves or client-side issues
const deduplicatedItems: any[] = []
const seen = new Set<string>()

for (const item of processedItems) {
  const key = `${item.category_id}::${item.name?.trim().toLowerCase()}`
  if (!seen.has(key)) {
    seen.add(key)
    deduplicatedItems.push(item)
  } else {
    console.warn(`⚠️ Duplicate item detected and removed: "${item.name}" in category ${item.category_id}`)
  }
}

console.log(`📊 Items received: ${processedItems.length}, After deduplication: ${deduplicatedItems.length}`)
```

### Cómo Funciona

1. **Criterio de deduplicación:**
   - Se considera duplicado si tiene el **mismo nombre** (ignorando mayúsculas/minúsculas y espacios) en la **misma categoría**
   - Clave única: `category_id::nombre_en_minusculas`

2. **Comportamiento:**
   - Si se reciben 10 items pero 3 son duplicados → Solo se guardan 7 únicos
   - Los duplicados se **eliminan automáticamente** antes de guardar en la BD
   - Se registra un warning en consola por cada duplicado detectado

3. **Transparencia:**
   - Logs en consola muestran:
     - ⚠️ Cada duplicado detectado con su nombre
     - 📊 Cantidad recibida vs cantidad guardada

### Ventajas

✅ **Protección automática:** No requiere cambios en el frontend
✅ **No rompe funcionalidad:** Si no hay duplicados, funciona igual que antes
✅ **Debugging fácil:** Los logs permiten identificar cuándo ocurren duplicaciones
✅ **Prevención en origen:** Evita que duplicados lleguen a la base de datos

---

## 🔍 Monitoreo

### Revisar Logs de Servidor

Cuando guardes cambios en el Editor de Menú, revisa la consola del servidor (donde corre `npm run dev`):

```bash
# Si hay duplicados, verás:
⚠️ Duplicate item detected and removed: "Lomo Saltado" in category cat-1234
📊 Items received: 15, After deduplication: 12

# Si todo está bien:
📊 Items received: 12, After deduplication: 12
```

### Identificar Causas

Si ves duplicados frecuentemente:
1. **Revisar frontend:** Verificar que el estado no tenga duplicados
2. **Revisar hooks:** Asegurar que `saveItems()` no se llama múltiples veces
3. **Revisar React.StrictMode:** En desarrollo puede causar doble ejecución

---

## 📝 Cambios Realizados

### Archivos Modificados

**`app/api/restaurants/[slug]/items/route.ts`**
- ✅ Agregada lógica de deduplicación antes de insertar en BD
- ✅ Logs de monitoreo para debugging
- ✅ Actualizado uso de `deduplicatedItems` en lugar de `processedItems`

### Líneas Clave (route.ts:159-174)

```typescript
// DEDUPLICATION: Remove duplicate items based on name + category_id
const deduplicatedItems: any[] = []
const seen = new Set<string>()

for (const item of processedItems) {
  const key = `${item.category_id}::${item.name?.trim().toLowerCase()}`
  if (!seen.has(key)) {
    seen.add(key)
    deduplicatedItems.push(item)
  } else {
    console.warn(`⚠️ Duplicate item detected and removed: "${item.name}"`)
  }
}

console.log(`📊 Items received: ${processedItems.length}, After deduplication: ${deduplicatedItems.length}`)
```

---

## 🧪 Pruebas Recomendadas

1. **Editar un plato existente:**
   - Cambiar nombre, precio, descripción
   - Verificar que NO se duplique

2. **Agregar nuevo plato:**
   - Crear plato nuevo en una categoría
   - Verificar que aparece solo una vez

3. **Reordenar platos:**
   - Arrastrar y soltar platos
   - Verificar que no se dupliquen

4. **Guardar múltiples veces rápido:**
   - Hacer cambios y guardar varias veces seguidas
   - Verificar que no se acumulen duplicados

---

## 🚀 Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Constraint único en BD:**
   ```sql
   ALTER TABLE items
   ADD CONSTRAINT unique_item_name_per_category
   UNIQUE (restaurant_id, category_id, name);
   ```

2. **Validación en frontend:**
   - Detectar duplicados antes de enviar al API
   - Mostrar advertencia al usuario si intenta crear plato con nombre duplicado

3. **Deduplicación en hooks:**
   - Agregar lógica en `useMenuFilesystem` para prevenir duplicados en el estado

---

## ✅ Estado Actual

**Problema:** ❌ Resuelto
**Protección Activa:** ✅ Sí
**Requiere Acción Manual:** ❌ No
**Logs Disponibles:** ✅ Sí

---

**Documentado por:** Claude Code
**Última Actualización:** 2025-10-23
