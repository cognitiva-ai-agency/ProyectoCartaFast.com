# Correcciones - Colores del Banner Promocional
**Fecha**: 2025-01-24
**Autor**: Dr. Curiosity + Claude Code

## 🎯 Problema Corregido

**Síntoma**: Los colores de fondo y texto del banner promocional no se guardaban ni visualizaban.

**Causa raíz**: La tabla `promotion_banners` en Supabase **NO tenía columnas para almacenar los colores**. Los colores estaban hardcodeados en la API route.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Migración SQL Creada

**Archivo**: `supabase/migrations/008_add_banner_colors.sql`

La migración agrega dos columnas a la tabla `promotion_banners`:
- `background_color` VARCHAR(7) - Código hexadecimal (ej: `#FF9500`)
- `text_color` VARCHAR(7) - Código hexadecimal (ej: `#FFFFFF`)

### 2. API Route Corregida

**Archivo**: `app/api/restaurants/[slug]/banner/route.ts`

**Cambios en GET** (líneas 58-61):
```typescript
// ANTES (hardcodeado):
backgroundColor: '#FF9500', // Default - can be stored in DB later
textColor: '#FFFFFF', // Default - can be stored in DB later

// AHORA (lee de base de datos):
backgroundColor: banner.background_color || '#FF9500',
textColor: banner.text_color || '#FFFFFF',
```

**Cambios en POST** (líneas 108-115):
```typescript
// AHORA guarda los colores en la base de datos:
const bannerData = {
  restaurant_id: restaurant.id,
  title: banner.message || 'Ofertas especiales',
  subtitle: null,
  is_visible: banner.enabled || false,
  background_color: banner.backgroundColor || '#FF9500',  // ✅ NUEVO
  text_color: banner.textColor || '#FFFFFF'               // ✅ NUEVO
}
```

### 3. Menú Público

**Archivo**: `app/[slug]/page.tsx` (líneas 216-217)

✅ **Ya funciona correctamente**. Lee los colores desde la API:
```typescript
style={{
  backgroundColor: menuData.banner.backgroundColor,
  color: menuData.banner.textColor
}}
```

---

## ⚙️ CÓMO APLICAR LA MIGRACIÓN

### ⚠️ IMPORTANTE: Debes ejecutar la migración SQL para que los colores funcionen

Tienes **3 opciones** para aplicar la migración:

---

### **OPCIÓN 1: SQL Editor en Dashboard de Supabase** (Recomendada)

1. **Ve al Dashboard de Supabase**:
   https://supabase.com/dashboard/project/eqyogextlxkjsgaoskrv

2. **Abre el SQL Editor**:
   - Click en "SQL Editor" en el menú lateral

3. **Copia y pega el siguiente SQL**:

```sql
-- Agregar columnas de colores
ALTER TABLE promotion_banners
  ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FF9500',
  ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#FFFFFF';

-- Actualizar banners existentes con colores por defecto
UPDATE promotion_banners
SET
  background_color = COALESCE(background_color, '#FF9500'),
  text_color = COALESCE(text_color, '#FFFFFF')
WHERE background_color IS NULL OR text_color IS NULL;

-- Verificar que se crearon las columnas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'promotion_banners'
  AND column_name IN ('background_color', 'text_color');
```

4. **Ejecuta el SQL** (botón "Run" o F5)

5. **Verifica el resultado**:
   - Deberías ver 2 filas en el resultado final
   - `background_color` | `character varying` | `'#FF9500'::character varying`
   - `text_color` | `character varying` | `'#FFFFFF'::character varying`

---

### **OPCIÓN 2: Supabase CLI** (Avanzada)

Si tienes instalado Supabase CLI:

```bash
# 1. Vincular tu proyecto (si no lo has hecho)
supabase link --project-ref eqyogextlxkjsgaoskrv

# 2. Aplicar migraciones pendientes
supabase db push
```

---

### **OPCIÓN 3: PostgreSQL directo** (Solo si tienes acceso)

Si tienes `psql` instalado:

```bash
psql "postgresql://postgres:123456789@db.eqyogextlxkjsgaoskrv.supabase.co:5432/postgres?sslmode=require" -f supabase/migrations/008_add_banner_colors.sql
```

---

## 🧪 CÓMO PROBAR QUE FUNCIONA

### Test Completo (3 minutos):

1. **Aplica la migración SQL** (usa la Opción 1 arriba)

2. **Reinicia el servidor de desarrollo**:
   ```bash
   # Detén el servidor actual (Ctrl+C)
   npm run dev
   ```

3. **Accede al Dashboard**:
   - URL: `http://localhost:3000/clientes`
   - Slug: `nuevo-restaurante` (o tu slug)
   - Password: `123456`

4. **Ve a la pestaña "Promociones"** (🏷️)

5. **Activa el banner**:
   - Toggle "Mostrar Banner en Menú Público" → ON

6. **Cambia los colores**:
   - **Color de Fondo**: Selecciona un color (ej: `#E91E63` rosa)
   - **Color de Texto**: Selecciona un color (ej: `#FFFFFF` blanco)
   - **Vista Previa**: Debe actualizarse inmediatamente

7. **Espera 500ms** (el guardado es automático con debounce)

8. **Verifica en terminal del servidor**:
   ```
   💾 Saving banner to DB: { ..., background_color: '#E91E63', text_color: '#FFFFFF' }
   ✅ Banner updated successfully
   ```

9. **Abre el menú público en otra pestaña**:
   - URL: `http://localhost:3000/nuevo-restaurante`
   - ✅ El banner debe aparecer con los colores que seleccionaste

10. **Refresca la página del dashboard (F5)**:
    - ✅ Los colores deben mantenerse (no vuelven a naranja/blanco)

11. **Refresca la página del menú público (F5)**:
    - ✅ Los colores deben mantenerse

---

## 📊 LOGS ESPERADOS

### En Terminal del Servidor:

**Al cargar el banner**:
```
✅ Banner loaded from DB: {
  enabled: true,
  message: '¡Ofertas especiales disponibles!',
  backgroundColor: '#E91E63',
  textColor: '#FFFFFF',
  updated_at: '2025-01-24T...'
}
```

**Al guardar cambios**:
```
💾 Saving banner to DB: {
  restaurant_id: '56df1a85...',
  title: '¡Ofertas especiales disponibles!',
  subtitle: null,
  is_visible: true,
  background_color: '#E91E63',
  text_color: '#FFFFFF'
}
✅ Banner updated successfully
```

### En Consola del Navegador:

Si hay errores, verás:
```javascript
❌ Error saving banner: [detalles]
```

---

## 🔍 VERIFICACIÓN EN BASE DE DATOS

Puedes verificar que los colores se guardaron correctamente ejecutando esto en SQL Editor:

```sql
SELECT
  r.name AS restaurant_name,
  r.slug,
  pb.title AS banner_message,
  pb.background_color,
  pb.text_color,
  pb.is_visible,
  pb.updated_at
FROM promotion_banners pb
JOIN restaurants r ON r.id = pb.restaurant_id
WHERE r.slug = 'nuevo-restaurante';
```

**Resultado esperado**:
```
restaurant_name       | slug               | banner_message | background_color | text_color | is_visible | updated_at
----------------------|--------------------|--------------------|-------------------|-------------|------------|---------------------
Nuevo Restaurante | nuevo-restaurante | ¡Ofertas...         | #E91E63          | #FFFFFF    | true       | 2025-01-24 12:34:56
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### 1. Error: "column background_color does not exist"

**Causa**: No ejecutaste la migración SQL.

**Solución**:
1. Ve al SQL Editor de Supabase
2. Ejecuta el SQL de la "Opción 1" arriba
3. Reinicia el servidor de desarrollo

### 2. Los colores vuelven a naranja (#FF9500) y blanco (#FFFFFF)

**Causa**: La migración no se aplicó o el banner no se guardó después de aplicarla.

**Solución**:
1. Verifica que las columnas existen:
   ```sql
   SELECT * FROM information_schema.columns
   WHERE table_name = 'promotion_banners';
   ```
2. Si existen, cambia los colores de nuevo en el dashboard
3. Espera 1 segundo (auto-save)
4. Verifica los logs en terminal

### 3. "Failed to save banner: column 'background_color' does not exist"

**Causa**: Intentaste guardar antes de aplicar la migración.

**Solución**:
1. Aplica la migración SQL (Opción 1)
2. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`
3. Intenta cambiar los colores de nuevo

---

## 📦 ARCHIVOS CREADOS/MODIFICADOS

### Nuevos:
1. `supabase/migrations/008_add_banner_colors.sql` - Migración SQL
2. `scripts/apply-banner-colors-migration.js` - Script de verificación
3. `scripts/execute-banner-migration.js` - Script de ejecución (requiere pg)
4. `CORRECCIONES_COLORES_BANNER.md` - Este documento

### Modificados:
1. `app/api/restaurants/[slug]/banner/route.ts` - Corregido GET y POST
2. `package.json` - Agregado `pg` dependency (si lo instalaste)

---

## 🎨 COLORES POR DEFECTO

Si no configuras colores, se usarán estos por defecto:

- **Color de Fondo**: `#FF9500` (Naranja iOS)
- **Color de Texto**: `#FFFFFF` (Blanco)

---

## 🚀 PRÓXIMOS PASOS

Después de aplicar la migración:

1. ✅ **Prueba cambiar los colores** del banner
2. ✅ **Verifica que se guardan** al refrescar la página
3. ✅ **Verifica que se ven** en el menú público
4. ⏭️ Continúa con otros ajustes del panel de control

---

## 💡 NOTAS TÉCNICAS

### ¿Por qué se usa VARCHAR(7)?

Los códigos de color hexadecimal tienen exactamente 7 caracteres: `#` + 6 dígitos hexadecimales (ej: `#FF9500`).

### ¿Qué pasa si no aplico la migración?

El código tiene fallbacks:
- **GET**: Devolverá colores por defecto si las columnas no existen
- **POST**: Intentará guardar los colores, pero fallará con error

Sin embargo, los colores **NO se persistirán** hasta que apliques la migración.

### ¿Es seguro ejecutar la migración varias veces?

Sí. La migración usa `IF NOT EXISTS`, así que si ya ejecutaste el SQL, no hará nada.

---

**Estado**: ✅ Correcciones completadas
**Pendiente**: Aplicar migración SQL en Supabase

**Próximo paso**: Ejecutar el SQL en el Dashboard de Supabase (Opción 1)
