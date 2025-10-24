# Guía: Configuración de Temas y Personalización

## ✅ Estado: **IMPLEMENTADO Y FUNCIONANDO**

La configuración de temas **SÍ está implementada** y funcionando correctamente en el dashboard.

---

## 📍 Cómo Acceder

### Ubicación en el Dashboard

1. **Iniciar sesión** en el dashboard de tu restaurante
2. En la barra lateral izquierda, busca el tab: **"⚙️ Configuraciones"**
3. Haz clic en ese tab

**NOTA:** El tab se llama "**Configuraciones**", NO "Temas". Esto puede causar confusión.

---

## 🎨 Funcionalidades Disponibles

### 1. **Información del Restaurante**

**Nombre del Restaurante:**
- Campo de texto editable
- Los cambios se guardan automáticamente
- Se refleja en el menú público y dashboard

**Logo del Restaurante:**
- Subir imagen (PNG, JPG, WebP)
- Tres estilos disponibles:
  - 🔵 Circular (redondo)
  - 🔷 Rectangular (con bordes redondeados)
  - ⬜ Sin bordes (cuadrado)
- Para cambiar el logo: Haz clic en la miniatura

**Moneda:**
- Selector con múltiples opciones:
  - Peso Chileno (CLP)
  - Euro (EUR)
  - Dólar Estadounidense (USD)
  - Peso Mexicano (MXN)
  - Peso Argentino (ARS)
  - Peso Colombiano (COP)
  - Sol Peruano (PEN)
  - Peso Uruguayo (UYU)
  - Real Brasileño (BRL)
- Se muestra automáticamente en los precios del menú

**Zona Horaria:**
- Para descuentos programados por horario
- Opciones de toda Latinoamérica y Europa

### 2. **Temas de Diseño**

**Selector Visual de Temas:**
- Vista previa de cada tema antes de aplicarlo
- Muestra colores, tipografía y estilo
- Temas prediseñados disponibles:
  - Elegant (clásico y elegante)
  - Modern (minimalista moderno)
  - Vibrant (colorido y llamativo)
  - Dark (modo oscuro profesional)

**Cómo Aplicar un Tema:**
1. Haz clic en la tarjeta del tema que deseas
2. Aparece un botón "Aplicar Tema"
3. Haz clic para confirmar
4. Los cambios se reflejan inmediatamente en el menú público

### 3. **Generador de Código QR**

Disponible en el mismo tab, más abajo.
- Genera códigos QR personalizados
- Para compartir el menú con clientes

---

## 🔍 Si No Ves el Tab "Configuraciones"

### Posibles Causas

1. **No has iniciado sesión correctamente**
   - Ve a `/clientes`
   - Ingresa tu slug y contraseña
   - Verifica que te redirige a `/dashboard/[tu-slug]`

2. **Problema de caché del navegador**
   - Refresca la página (Ctrl+R o Cmd+R)
   - O refresca forzado (Ctrl+Shift+R o Cmd+Shift+R)

3. **Estás en la vista de Panel Maestro**
   - El Panel Maestro (restoranmaestroadmin) no tiene tab de configuraciones propias
   - Debes acceder al dashboard del restaurante específico usando el botón "Ver Dashboard"

---

## 📸 Identificación Visual

El tab de **"Configuraciones"** tiene este icono: ⚙️ (engranaje/settings)

Se ubica en la **cuarta posición** de los tabs:
1. 📝 Editor de Menú
2. 📦 Inventario
3. 🎁 Ofertas
4. ⚙️ **Configuraciones** ← AQUÍ

---

## 🛠️ Arquitectura Técnica (Para Referencia)

### Componentes Implementados

**`app/dashboard/[slug]/page.tsx` (líneas 149-168):**
```typescript
{activeTab === 'themes' && (
  <div className="space-y-6">
    {/* Theme Configuration Section */}
    <div>
      {session.isDemo ? (
        <DemoThemeSelector />
      ) : (
        <ThemeSelector
          restaurantId={session.restaurantId}
          restaurantSlug={params.slug}
        />
      )}
    </div>

    {/* QR Code Generator Section */}
    <div>
      <QRCodeGenerator
        restaurantSlug={session.slug}
        restaurantName={restaurantName}
      />
    </div>
  </div>
)}
```

**`components/menu/ThemeSelector.tsx`:**
- Selector visual de temas
- Configuración de nombre, logo, moneda, zona horaria
- Vista previa interactiva

**`components/layout/DashboardLayout.tsx` (línea 67):**
```typescript
{ id: 'themes' as const, label: 'Configuraciones', icon: <ThemeIcon /> }
```

### APIs Involucradas

**GET `/api/restaurants/[slug]/theme`**
- Obtiene configuración actual del restaurante
- Retorna: tema activo, nombre, logo, moneda, zona horaria

**POST `/api/restaurants/[slug]/theme`**
- Actualiza configuración del restaurante
- Body: `{ themeId, restaurantName, logoUrl, logoStyle, currency, timezone }`

---

## ✅ Verificación Paso a Paso

### **PASO 1: Acceder al Tab**
- [ ] Inicié sesión en el dashboard
- [ ] Veo 4 tabs en la barra lateral
- [ ] Hice clic en "⚙️ Configuraciones"
- [ ] Se cargó la página de configuración

### **PASO 2: Verificar Secciones Visibles**
- [ ] Veo sección "Información del Restaurante"
- [ ] Veo campo de "Nombre del Restaurante"
- [ ] Veo uploader de "Logo del Restaurante"
- [ ] Veo selector de "Moneda"
- [ ] Veo selector de "Zona Horaria"
- [ ] Veo sección "Temas de Diseño" con tarjetas de temas

### **PASO 3: Probar Funcionalidades**
- [ ] Cambié el nombre del restaurante
- [ ] El cambio se guardó automáticamente
- [ ] Seleccioné un tema diferente
- [ ] Hice clic en "Aplicar Tema"
- [ ] Abrí el menú público en otra pestaña
- [ ] Vi que los cambios se reflejaron

---

## 🐛 Solución de Problemas

### Problema: "No veo ningún tema para seleccionar"

**Causa:** Error en la carga de temas desde el hook `useThemes`

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores relacionados con temas
4. Comparte el error si lo hay

### Problema: "Los cambios no se guardan"

**Causa:** Error en la comunicación con el API

**Solución:**
1. Abre Network tab del navegador (F12 → Network)
2. Intenta cambiar el nombre del restaurante
3. Busca la petición POST a `/api/restaurants/[slug]/theme`
4. Verifica si retorna error 500 o éxito
5. Comparte el resultado

### Problema: "El logo no se carga después de subirlo"

**Causa:** Formato de imagen no soportado o muy pesada

**Solución:**
1. Usa imágenes PNG o JPG
2. Mantén el tamaño bajo 2MB
3. Dimensiones recomendadas: 500x500px o similar
4. Verifica que la imagen sea cuadrada para logos circulares

---

## 📝 Mejoras Futuras (Opcional)

Si deseas que el tab se llame "**Temas**" en lugar de "**Configuraciones**":

**Editar `components/layout/DashboardLayout.tsx` línea 67:**
```typescript
// Cambiar de:
{ id: 'themes' as const, label: 'Configuraciones', icon: <ThemeIcon /> },

// A:
{ id: 'themes' as const, label: 'Temas', icon: <ThemeIcon /> },
```

---

## ✨ Conclusión

La funcionalidad de configuración de temas **está completamente implementada y funcionando**.

Si no la ves, es muy probable que:
1. Estés buscando un tab llamado "Temas" pero se llama "Configuraciones"
2. O estés en el Panel Maestro en lugar de un dashboard individual de restaurante

**Para confirmar:** Comparte un screenshot de tu dashboard mostrando los tabs laterales y verificamos juntos.

---

**Fecha:** 2025-10-24
**Autor:** Claude Code + Dr. Curiosity
**Estado:** ✅ Funcionalidad Completa e Implementada
