# 📊 Progreso de Migración de APIs a Supabase

**Fecha:** 2025-10-23

## ✅ APIs Migradas Completamente

### Autenticación
- ✅ `app/api/auth/login/route.ts` - Login con Supabase + fallback filesystem
  - Corregido: Import de `createAdminClient`
  - Corregido: Campos de consulta (`subscription_status` en lugar de `is_active`)
  - Usa bcrypt para verificar contraseñas

### Datos del Restaurante
- ✅ `app/api/restaurants/[slug]/categories/route.ts` - GET/POST categorías
  - GET: Obtiene categorías desde Supabase ordenadas por `sort_order`
  - POST: Reemplaza todas las categorías (delete + insert)

- ✅ `app/api/restaurants/[slug]/items/route.ts` - GET/POST items del menú
  - GET: Obtiene items desde Supabase ordenados por `sort_order`
  - POST: Reemplaza todos los items (delete + insert)
  - **Nota:** Imágenes aún en filesystem (migrar a Supabase Storage después)

- ✅ `app/api/restaurants/[slug]/theme/route.ts` - GET/POST configuración del tema
  - GET: Obtiene datos del restaurante (name, theme_id, currency, timezone, logo_url, logo_style)
  - POST: Actualiza la tabla restaurants directamente
  - **Nota:** Logo aún en filesystem (migrar a Supabase Storage después)

- ✅ `app/api/restaurants/[slug]/banner/route.ts` - GET/POST banner promocional
  - GET: Obtiene desde `promotion_banners` table
  - POST: Insert o Update según exista
  - **Mapeo:** `enabled` → `is_visible`, `message` → `title`

- ✅ `app/api/restaurants/[slug]/scheduled-discounts/route.ts` - GET/POST descuentos programados
  - GET: Obtiene desde `scheduled_discounts` table
  - POST: Reemplaza todos los descuentos (delete + insert)

- ✅ `app/api/restaurants/[slug]/menu/route.ts` - GET/PUT menú público
  - GET: Combina categories + items desde Supabase
  - PUT: Deprecated (usar endpoints individuales)

## ⏳ APIs Pendientes de Migración

### Ingredientes (Complejas - Requieren análisis)
- ⏳ `app/api/restaurants/[slug]/ingredients/route.ts` - GET/POST/PUT/DELETE ingredientes
  - Usa MASTER_INGREDIENTS como base
  - Necesita migrar a tabla `ingredients` en Supabase

- ⏳ `app/api/restaurants/[slug]/custom-ingredients/route.ts` - GET/POST ingredientes personalizados
  - Ruta legacy, puede ser obsoleta después de migrar ingredients

- ⏳ `app/api/restaurants/[slug]/unavailable-ingredients/route.ts` - GET/POST ingredientes no disponibles
  - Debe usar tabla `unavailable_ingredients` en Supabase

### Autenticación Auxiliar
- ⏳ `app/api/auth/session/route.ts` - Verificar sesión
- ⏳ `app/api/auth/logout/route.ts` - Cerrar sesión

### Archivos Estáticos
- 🔄 `app/api/restaurants/[slug]/images/[filename]/route.ts` - Servir imágenes
  - **Decisión:** Mantener en filesystem por ahora, migrar a Supabase Storage en paso 10

## 📝 Cambios Clave Realizados

### 1. Importaciones
Antes:
```typescript
import { readRestaurantFile, writeRestaurantFile } from '@/lib/filesystem'
```

Después:
```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import type { Category, MenuItem, ... } from '@/lib/supabase/types'
```

### 2. Patrón de Lectura
Antes:
```typescript
const data = readRestaurantFile<Type>(slug, 'file.json')
```

Después:
```typescript
const supabase = createAdminClient()

// 1. Obtener restaurant_id desde slug
const { data: restaurant } = await supabase
  .from('restaurants')
  .select('id')
  .eq('slug', slug)
  .single()

// 2. Consultar datos
const { data } = await supabase
  .from('table_name')
  .select('*')
  .eq('restaurant_id', restaurant.id)
```

### 3. Patrón de Escritura (Reemplazar Todo)
Antes:
```typescript
writeRestaurantFile(slug, 'file.json', data)
```

Después:
```typescript
// 1. Eliminar datos existentes
await supabase
  .from('table_name')
  .delete()
  .eq('restaurant_id', restaurant.id)

// 2. Insertar nuevos datos
await supabase
  .from('table_name')
  .insert(newData)
  .select()
```

### 4. Manejo de Imágenes (Temporal)
Por ahora, las imágenes se siguen manejando en filesystem:
```typescript
import { saveRestaurantImage, deleteRestaurantImage } from '@/lib/filesystem'
```

**Próximo paso:** Migrar a Supabase Storage en tarea 10.

## 🎯 Próximos Pasos Inmediatos

1. **Migrar rutas de ingredientes** (3 rutas)
   - ingredients → tabla `ingredients`
   - unavailable-ingredients → tabla `unavailable_ingredients`
   - custom-ingredients → deprecar o integrar

2. **Migrar rutas de autenticación auxiliares** (2 rutas)
   - session
   - logout

3. **Pruebas end-to-end** del sistema completo

4. **Migrar imágenes a Supabase Storage** (tarea 10)

## 📊 Estadísticas

- **Total de APIs:** 13
- **Migradas:** 7 (54%)
- **Pendientes:** 6 (46%)
- **Tiempo estimado restante:** 2-3 horas

---

**Última actualización:** 2025-10-23 - APIs principales migradas (login, categories, items, theme, banner, scheduled-discounts, menu)
