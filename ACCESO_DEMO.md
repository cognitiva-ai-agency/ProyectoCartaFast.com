# 🎯 Acceso Demo - MenusCarta

## Credenciales de Acceso

**URL de Login:** http://localhost:3000/clientes

**Credenciales Demo:**
- **Slug/URL:** `restoran1`
- **Contraseña:** `123456`

---

## ✨ Qué Incluye la Demo

### 📋 Menú Completo Pre-Cargado

**4 Categorías:**
1. **Entrantes** (3 platos)
   - Ensalada César
   - Croquetas de Jamón (en promoción)
   - Tabla de Quesos

2. **Platos Principales** (4 platos)
   - Solomillo a la Parrilla
   - Paella Valenciana
   - Lubina al Horno
   - Risotto de Setas (no disponible)

3. **Postres** (3 platos)
   - Tarta de Queso
   - Tiramisú (en promoción)
   - Helado Artesanal

4. **Bebidas** (3 items)
   - Vino Tinto Reserva
   - Agua Mineral
   - Café Expreso

**Total:** 13 platos con precios, descripciones y alérgenos

---

## 🎨 Features Disponibles

### Tab "Menú" - Editor Drag-and-Drop
- ✅ Crear nuevas categorías
- ✅ Agregar platos
- ✅ **Edición inline** (haz clic en cualquier texto)
- ✅ **Arrastrar y soltar** para reordenar
- ✅ Toggle de visibilidad
- ✅ Toggle de disponibilidad
- ✅ Marcar promociones
- ✅ Colapsar/expandir categorías
- ✅ Eliminar con confirmación

### Tab "Temas" - Selector Visual
- ✅ 4 temas predefinidos:
  - Classic Elegance (activo por defecto)
  - Fresh & Modern
  - Warm Bistro
  - Minimalist Dark
- ✅ Preview visual de cada tema
- ✅ Paleta de colores mostrada
- ✅ Aplicación instantánea

### Tab "Código QR"
- ✅ Generador de QR
- ✅ Descarga PNG/SVG
- ✅ Función de impresión

### Tab "Promociones"
- ⏳ Próximamente (Fase 3)

---

## 🌐 Menú Público

**URL:** http://localhost:3000/restoran1

Verás el menú completo con:
- Tema aplicado
- 4 categorías con platos
- Precios normales y promocionales
- Alérgenos
- Diseño responsive iOS-style

---

## 🎮 Prueba Estas Features

### 1. Edición Inline
```
1. Ve a Dashboard > Tab "Menú"
2. Haz clic en "Ensalada César"
3. Edita el nombre directamente
4. Presiona Enter o haz clic fuera
✅ Cambio guardado instantáneamente
```

### 2. Drag & Drop
```
1. Arrastra el handle (☰) de una categoría
2. Muévela arriba o abajo
3. Suelta
✅ Orden actualizado
```

### 3. Cambiar Tema
```
1. Ve a Dashboard > Tab "Temas"
2. Haz clic en "Fresh & Modern"
3. Clic "Aplicar Tema"
✅ Tema aplicado, página recarga
```

### 4. Agregar Plato
```
1. Tab "Menú" > Dentro de "Entrantes"
2. Clic "+ Agregar Plato"
3. Nombre: "Gazpacho"
4. Precio: 6.50
✅ Plato añadido
```

### 5. Marcar Promoción
```
1. Busca cualquier plato
2. Clic en el icono 💵
3. Se convierte en 🏷️
4. Haz clic en el precio promocional para editarlo
✅ Precio promocional configurado
```

---

## ⚠️ Limitaciones del Modo Demo

- **No requiere Supabase** - Funciona sin conexión a base de datos
- **Datos en memoria** - Los cambios se pierden al recargar la página
- **Solo para demostración** - No es persistente

---

## 🚀 Pasos para Acceder AHORA

1. Abre tu navegador
2. Ve a: **http://localhost:3000/clientes**
3. Ingresa:
   - Slug: **restoran1**
   - Contraseña: **123456**
4. Clic **"Ingresar al Panel"**
5. ✅ ¡Ya estás dentro!

---

## 📊 Datos de Prueba Incluidos

### Platos con Promoción
- Croquetas de Jamón: €7.00 → €5.50
- Tiramisú: €6.00 → €4.50

### Platos No Disponibles
- Risotto de Setas (marcado como no disponible)

### Platos con Alérgenos
- Ensalada César: gluten, lácteos, huevo
- Croquetas: gluten, lácteos
- Y más...

---

## 🎯 Siguiente Paso

**Para usar en producción con datos reales:**
1. Configura Supabase (ver `SETUP.md`)
2. Crea tu restaurante
3. Ingresa con tus credenciales reales
4. Los cambios se guardarán permanentemente

---

**💡 Modo Demo Listo - Disfruta explorando MenusCarta**

*Sin configuración, sin Supabase, solo prueba y experimenta*
