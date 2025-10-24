# Correcciones de Persistencia - Panel de Configuración
**Fecha**: 2025-01-24
**Autor**: Dr. Curiosity + Claude Code

## 🎯 Problemas Corregidos

### 1. ❌ Logo no persistía en base de datos
**Síntoma**: Al subir un logo y refrescar la página, la imagen desaparecía.

**Causa raíz**: La API route `/api/restaurants/[slug]/theme` estaba usando funciones del **filesystem** (`saveRestaurantImage`, `deleteRestaurantImage`) en lugar de **Supabase Storage**.

**Solución aplicada**:
- ✅ Modificado `app/api/restaurants/[slug]/theme/route.ts` para usar funciones de Supabase Storage
- ✅ Importadas funciones: `uploadImage`, `deleteImage`, `generateImagePath`
- ✅ Los logos ahora se guardan en el bucket `restaurant-images` de Supabase Storage
- ✅ URLs públicas generadas automáticamente por Supabase

**Archivos modificados**:
- `app/api/restaurants/[slug]/theme/route.ts:1-9` - Imports actualizados
- `app/api/restaurants/[slug]/theme/route.ts:98-132` - Lógica de upload reescrita

---

### 2. ❌ Tema no persistía en base de datos
**Síntoma**: Al cambiar el tema y refrescar, volvía al tema anterior.

**Causa raíz**: El hook `useRestaurantTheme` intentaba escribir directamente en la tabla `restaurants` desde el cliente, violando **Row Level Security (RLS)** de Supabase.

**Solución aplicada**:
- ✅ Modificado `components/menu/ThemeSelector.tsx` para usar la API route
- ✅ Función `handleApplyTheme` ahora hace POST a `/api/restaurants/[slug]/theme`
- ✅ Bypass de RLS usando el admin client en server-side

**Archivos modificados**:
- `components/menu/ThemeSelector.tsx:165-206` - `handleApplyTheme` reescrito

---

### 3. ✨ Mejoras de UX agregadas

**Feedback visual al guardar**:
- ✅ Estado de "Subiendo logo..." con spinner
- ✅ Mensaje de éxito: "Logo guardado ✓" (verde)
- ✅ Mensaje de error: "Error al guardar logo ✗" (rojo)
- ✅ Indicador de estado en la esquina superior derecha de la card

**Archivos modificados**:
- `components/menu/ThemeSelector.tsx:28-29` - Estados `isSaving`, `savingMessage`
- `components/menu/ThemeSelector.tsx:123-166` - `handleLogoChange` con feedback
- `components/menu/ThemeSelector.tsx:268-280` - Badge de estado en UI
- `components/menu/ThemeSelector.tsx:395-400` - Spinner durante upload

---

## 🗄️ Configuración de Supabase Storage

### Bucket: `restaurant-images`

**Estado**: ✅ Configurado y funcionando

**Configuración**:
- **Acceso**: Público (lectura)
- **Tamaño máximo**: 5 MB por archivo
- **Formatos soportados**: PNG, JPEG, JPG, WEBP, GIF
- **Estructura de carpetas**:
  ```
  restaurant-images/
  ├── {slug}/
  │   ├── logos/
  │   │   └── logo.{ext}
  │   ├── items/
  │   │   └── item-{id}.{ext}
  │   └── categories/
  │       └── category-{id}.{ext}
  ```

**Scripts creados**:
- `scripts/setup-storage.js` - Verifica y crea el bucket
- `scripts/apply-storage-policies.js` - Guía para aplicar políticas de seguridad

---

## 📋 Políticas de Storage (RLS)

### Políticas necesarias en `storage.objects`:

1. **Public read access**
   - Operación: `SELECT`
   - Policy: `bucket_id = 'restaurant-images'`
   - Estado: ✅ Configurado (bucket público)

2. **Service role full access**
   - Operación: `ALL`
   - Policy: `bucket_id = 'restaurant-images' AND auth.jwt() ->> 'role' = 'service_role'`
   - Estado: ⚠️  Debe aplicarse manualmente (ver instrucciones abajo)

**Migración SQL**: `supabase/migrations/007_configure_storage_policies.sql`

**Cómo aplicar**:

**Opción 1 - Supabase CLI** (Recomendado):
```bash
supabase link --project-ref eqyogextlxkjsgaoskrv
supabase db push
```

**Opción 2 - Dashboard de Supabase**:
1. Ve a: https://supabase.com/dashboard/project/eqyogextlxkjsgaoskrv
2. SQL Editor
3. Copia el contenido de `supabase/migrations/007_configure_storage_policies.sql`
4. Ejecuta el SQL

---

## 🧪 Cómo Probar las Correcciones

### Test 1: Logo persiste correctamente

1. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Acceder al dashboard**:
   - URL: `http://localhost:3000/clientes`
   - Slug: `nuevo-restaurante`
   - Password: `123456` (o la contraseña configurada)

3. **Subir logo**:
   - Ve a la pestaña "Configuración" (⚙️)
   - Sección "Información del Restaurante"
   - Click en "Sube el logo de tu restaurante"
   - Selecciona una imagen (PNG o JPG, máx 5 MB)
   - **Espera a ver**: "Logo guardado ✓" (verde)

4. **Verificar persistencia**:
   - Refresca la página (F5)
   - El logo debe seguir visible
   - Abre DevTools > Network > Busca la URL del logo
   - Debe ser: `https://eqyogextlxkjsgaoskrv.supabase.co/storage/v1/object/public/restaurant-images/nuevo-restaurante/logos/logo.{ext}`

5. **Verificar en Supabase Dashboard**:
   - Ve a Storage > restaurant-images
   - Navega a `nuevo-restaurante/logos/`
   - Debe aparecer `logo.png` (o .jpg)

### Test 2: Tema persiste correctamente

1. **Cambiar tema**:
   - En la misma página de Configuración
   - Scroll hasta "Temas de Diseño"
   - Click en un tema diferente al actual
   - Click en "Aplicar Tema"
   - **Espera a ver**: Tema aplicado exitosamente (console)

2. **Verificar cambio inmediato**:
   - Abre la vista pública del menú en otra pestaña
   - URL: `http://localhost:3000/nuevo-restaurante`
   - El tema debe haber cambiado

3. **Verificar persistencia**:
   - Refresca la página del dashboard (F5)
   - El tema activo debe seguir siendo el que seleccionaste
   - Badge "Activo" (verde) debe estar en el tema correcto

4. **Verificar en base de datos**:
   ```sql
   -- Ejecutar en SQL Editor de Supabase
   SELECT name, theme_id, logo_url, logo_style, currency, timezone
   FROM restaurants
   WHERE slug = 'nuevo-restaurante';
   ```
   - `theme_id` debe ser el ID del tema seleccionado
   - `logo_url` debe contener la URL de Supabase Storage

### Test 3: Estilo de logo persiste

1. **Cambiar estilo**:
   - Con un logo ya subido
   - Selecciona un estilo diferente (Circular / Rectangular / Sin bordes)
   - **Sin refrescar**, el logo debe cambiar visualmente

2. **Verificar persistencia**:
   - Refresca la página (F5)
   - El estilo seleccionado debe mantenerse
   - Verifica también en la vista pública

### Test 4: Moneda y Zona Horaria persisten

✅ **Ya funcionaban correctamente**, pero verifica que sigan funcionando:

1. Cambia la moneda (ej: de CLP a USD)
2. Cambia la zona horaria
3. Refresca la página
4. Ambos valores deben persistir

---

## 📊 Logging y Debugging

### Logs en consola del servidor (terminal):

Cuando subes un logo, deberías ver:
```
📤 Uploading new logo to Supabase Storage...
✅ Logo uploaded successfully: https://eqyogextlxkjsgaoskrv.supabase.co/storage/v1/object/public/restaurant-images/nuevo-restaurante/logos/logo.png
💾 Updating restaurant in Supabase: { name, theme_id, logo_url, ... }
✅ Restaurant updated successfully: { ... }
```

### Logs en consola del navegador (F12):

Cuando cambias el tema:
```javascript
✅ Tema aplicado exitosamente
```

Si hay un error:
```javascript
❌ Error applying theme: [detalles del error]
```

---

## ⚠️ Problemas Conocidos y Soluciones

### 1. Error: "Failed to upload logo image"

**Causa**: Políticas de Storage no aplicadas correctamente

**Solución**:
1. Ejecuta: `node scripts/apply-storage-policies.js`
2. Sigue las instrucciones para aplicar las políticas manualmente
3. O ejecuta el SQL en `supabase/migrations/007_configure_storage_policies.sql`

### 2. Logo se sube pero no aparece

**Causa**: Bucket no es público

**Solución**:
1. Ve a Supabase Dashboard > Storage > restaurant-images > Settings
2. Marca "Public bucket" como enabled
3. Guarda cambios

### 3. Tema cambia pero vuelve al anterior tras refrescar

**Causa**: RLS bloqueando escritura desde cliente

**Solución**:
- ✅ Ya corregido en este PR
- La función `handleApplyTheme` ahora usa la API route
- Verifica que estés usando la versión actualizada del código

---

## 📦 Archivos Nuevos Creados

1. `scripts/setup-storage.js` - Configura bucket de Storage
2. `scripts/apply-storage-policies.js` - Guía para aplicar políticas
3. `supabase/migrations/007_configure_storage_policies.sql` - Migración de políticas
4. `CORRECCIONES_PERSISTENCIA_CONFIGURACION.md` - Este documento

---

## 🚀 Próximos Pasos

### Después de verificar las correcciones:

1. **Aplicar políticas de Storage** (si no lo has hecho):
   ```bash
   node scripts/apply-storage-policies.js
   # Luego sigue las instrucciones en pantalla
   ```

2. **Limpiar archivos temporales**:
   ```bash
   rm scripts/setup-storage.js
   rm scripts/apply-storage-policies.js
   ```

3. **Commit de cambios**:
   ```bash
   git add .
   git commit -m "fix(config): Corregir persistencia de logo y tema en Supabase

   - Migrar guardado de logos de filesystem a Supabase Storage
   - Corregir actualización de tema usando API route (bypass RLS)
   - Agregar feedback visual al guardar (spinners, mensajes de éxito/error)
   - Crear scripts de configuración de Storage bucket
   - Agregar migración 007 para políticas de Storage

   Refs: Configuración > Logo y Tema"
   ```

4. **Probar en producción** (Vercel):
   - Una vez desplegado, verificar que el Storage funcione en producción
   - URLs deben seguir siendo de Supabase (no cambian al desplegar)

---

## 💡 Notas Técnicas

### ¿Por qué usar Supabase Storage y no filesystem?

1. **Escalabilidad**: Filesystem no funciona en serverless (Vercel)
2. **Persistencia**: Los archivos en filesystem se borran al redesplegar
3. **CDN**: Supabase Storage tiene CDN integrado para mejor rendimiento
4. **Seguridad**: Control de acceso con RLS

### ¿Por qué usar API route para actualizar tema?

1. **RLS**: El cliente de Supabase tiene restricciones de RLS
2. **Admin privileges**: API route usa `createAdminClient()` con service role
3. **Validación server-side**: Más seguro validar en servidor
4. **Logs**: Mejor trazabilidad en logs del servidor

---

## ✅ Checklist de Verificación

Antes de dar por completado:

- [ ] Logo se guarda correctamente
- [ ] Logo persiste tras refrescar página
- [ ] Logo se ve en Supabase Storage Dashboard
- [ ] Tema se aplica correctamente
- [ ] Tema persiste tras refrescar página
- [ ] Estilo de logo (circular/rectangular/none) persiste
- [ ] Moneda persiste (ya funcionaba)
- [ ] Zona horaria persiste (ya funcionaba)
- [ ] Feedback visual funciona (spinners, mensajes)
- [ ] No hay errores en consola del servidor
- [ ] No hay errores en consola del navegador
- [ ] Políticas de Storage aplicadas (si es necesario)

---

**Estado**: ✅ Correcciones completadas y listas para prueba

**Próximo paso**: Ejecutar tests manuales siguiendo la sección "🧪 Cómo Probar las Correcciones"
