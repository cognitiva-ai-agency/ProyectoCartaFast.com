# Changelog - MenusCarta

Todos los cambios notables del proyecto se documentarán en este archivo.

---

## [2.0.0] - 2024-10-21

### 🎉 Fase 2 - Editor Drag-and-Drop Completada

#### ✨ Nuevas Features

**Editor de Menú:**
- Editor drag-and-drop completo con @dnd-kit
- Componente `MenuEditor` principal con gestión de estado
- Componente `DraggableCategory` para categorías arrastrables
- Componente `DraggableMenuItem` para platos arrastrables
- Edición inline con componente `ContentEditable` reutilizable
- Reordenamiento de categorías con drag-and-drop
- Reordenamiento de platos dentro de categorías
- Toggle de visibilidad de categorías
- Toggle de disponibilidad de platos
- Toggle de promociones en platos
- Colapsar/expandir categorías
- Badges de estado (visible/oculta, disponible/no disponible, promoción)
- Confirmaciones antes de eliminar
- Estados vacíos elegantes con CTAs

**Selector de Temas:**
- Componente `ThemeSelector` con preview visual
- Galería de 4 temas predefinidos
- Preview en tiempo real de colores y tipografía
- Paleta de colores con swatches
- Aplicación instantánea de temas
- Badge indicador de tema activo

**Hooks Custom:**
- `useMenu()` - CRUD completo de menús, categorías e items
- `useThemes()` - Obtención de temas disponibles
- `useRestaurantTheme()` - Gestión del tema del restaurante
- Suscripciones Realtime a cambios en BD

**Dashboard:**
- Sistema de tabs funcional (Menú, Temas, Promociones, QR)
- Navegación entre tabs sin reload
- Contenido dinámico según tab activo
- Integración del MenuEditor en tab Menú
- Integración del ThemeSelector en tab Temas

#### 🔧 Mejoras Técnicas

- Integración completa de @dnd-kit con sensores táctiles
- Overlays de arrastre con preview visual
- Actualización automática de posiciones en BD
- Manejo de errores robusto en todos los hooks
- Estados de loading específicos por operación
- TypeScript sin errores (type-check passing)
- Componentes totalmente modulares y reutilizables

#### 📁 Archivos Nuevos

```
hooks/
  ├── useMenu.ts
  └── useThemes.ts

components/
  ├── ui/
  │   └── ContentEditable.tsx
  ├── editor/
  │   ├── MenuEditor.tsx
  │   ├── DraggableCategory.tsx
  │   └── DraggableMenuItem.tsx
  └── menu/
      └── ThemeSelector.tsx

FASE2_COMPLETADA.md
CHANGELOG.md
```

#### 📊 Estadísticas

- +7 componentes/hooks nuevos
- +1,200 líneas de código
- 0 errores TypeScript
- 100% features de Fase 2 completadas

---

## [1.0.0] - 2024-10-21

### 🎉 Fase 1 - MVP Completada

#### ✨ Features Iniciales

**Infraestructura:**
- Proyecto Next.js 14 con App Router
- TypeScript configurado
- Tailwind CSS con tema iOS custom
- Supabase como backend (PostgreSQL + Realtime)

**Sistema de Diseño:**
- 7 componentes UI iOS-like (Button, Card, Input, Select, Modal, Badge, Spinner)
- Paleta de colores inspirada en iOS
- Animaciones con Framer Motion
- Tailwind config custom con tokens iOS

**Base de Datos:**
- Schema completo con 7 tablas
- Row Level Security (RLS) en todas las tablas
- 4 temas predefinidos
- Índices de optimización
- Triggers para timestamps
- Realtime habilitado

**Autenticación:**
- Sistema custom con cookies HTTP-only
- Hash de contraseñas con bcrypt
- API routes: /api/auth/login, /api/auth/logout, /api/auth/session
- Hook useAuth() para cliente

**Páginas:**
- Landing page (/)
- Portal de clientes (/clientes)
- Dashboard básico (/dashboard/[slug])
- Vista pública del menú (/[slug])
- 404 personalizado

**Generación de QR:**
- Componente QRCodeGenerator
- Descarga en PNG y SVG
- Función de impresión directa
- Consejos de uso

**Rutas Dinámicas:**
- Sistema de slugs únicos por restaurante
- Server-side rendering para SEO
- Aplicación de temas personalizada
- Generación estática de rutas (ISR)

#### 📝 Documentación

- README.md completo
- SETUP.md con guía paso a paso
- ARCHITECTURE.md con detalles técnicos
- RESUMEN_EJECUTIVO.md para stakeholders
- database/schema.sql comentado

#### 📦 Dependencies

```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "@supabase/supabase-js": "^2.45.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "framer-motion": "^11.5.0",
  "qrcode.react": "^4.0.1",
  "bcryptjs": "^3.0.2",
  "zustand": "^4.5.0",
  "tailwind-merge": "^2.5.0"
}
```

---

## Formato

Este changelog sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de cambios:
- `✨ Nuevas Features` - Nueva funcionalidad
- `🔧 Mejoras` - Mejoras a funcionalidad existente
- `🐛 Bug Fixes` - Corrección de bugs
- `📝 Documentación` - Cambios en documentación
- `🎨 Estilos` - Cambios que no afectan lógica (whitespace, formato, etc.)
- `♻️ Refactor` - Código que no arregla bugs ni añade features
- `⚡ Performance` - Mejoras de rendimiento
- `🔒 Seguridad` - Parches de seguridad
- `🗑️ Deprecado` - Features que serán removidas
- `❌ Removido` - Features removidas

---

**Desarrollado por Cognitiva SpA**
Director: Oscar Francisco Barros Tagle (Dr. Curiosity)
