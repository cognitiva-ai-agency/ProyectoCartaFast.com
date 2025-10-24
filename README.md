# MenusCarta - Plataforma de Menús Digitales

Plataforma drag-and-drop moderna para que restaurantes, cafés y bares creen y gestionen sus menús digitales con actualizaciones en tiempo real.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **UI Components**: Diseño custom inspirado en iOS
- **Drag & Drop**: @dnd-kit
- **Animaciones**: Framer Motion
- **QR Generation**: qrcode.react
- **State Management**: Zustand

## 📁 Estructura del Proyecto

```
menuscarta.com/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Landing page
│   ├── clientes/            # Portal de clientes
│   ├── [slug]/              # Vista pública de menús (/restoran1, /restoran2, etc.)
│   └── dashboard/           # Dashboard de gestión
├── components/
│   ├── ui/                  # Componentes base iOS-like (Button, Card, Input, etc.)
│   ├── layout/              # Layouts y wrappers
│   ├── editor/              # Componentes del editor drag-and-drop
│   ├── menu/                # Componentes de visualización del menú
│   └── auth/                # Componentes de autenticación
├── lib/
│   ├── supabase/            # Configuración de Supabase (client, server)
│   └── utils.ts             # Utilidades generales
├── types/                   # TypeScript types e interfaces
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand stores
└── styles/                  # CSS global

```

## 🎨 Características

### ✅ Implementadas (Fase 1 + 2)
- **Editor drag-and-drop intuitivo** - Arrastra categorías y platos para reordenar
- **Edición inline tipo Notion** - Haz clic en cualquier texto para editarlo
- **Actualizaciones en tiempo real** - Los cambios se sincronizan automáticamente
- **4 temas prediseñados iOS** - Selector visual con preview instantáneo
- **QR único y permanente** - Descarga en PNG/SVG, imprime directamente
- **Autenticación segura** - Login por URL + contraseña con bcrypt
- **Dashboard completo** - Tabs de Menú, Temas, Promociones y QR
- **Responsive design** - Optimizado para móviles y tablets
- **Touch support** - Drag-and-drop funciona en dispositivos táctiles

### ⏳ Próximamente (Fase 3)
- Sistema de promociones y happy hours programables
- Upload de imágenes para platos
- Panel de administración para crear restaurantes
- Analytics básico (vistas, platos populares)

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## 📦 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Configuración de Supabase

### Tablas necesarias:

1. **restaurants** - Datos del restaurante
2. **menus** - Menús del restaurante
3. **categories** - Categorías de platos
4. **menu_items** - Platos individuales
5. **themes** - Temas de diseño
6. **promotions** - Promociones y descuentos

Scripts SQL para crear las tablas se encuentran en `/database/schema.sql`

## 📱 URLs de Ejemplo

- Landing: `https://menuscarta.com`
- Portal Clientes: `https://menuscarta.com/clientes`
- Menú Público: `https://menuscarta.com/restoran1`
- Dashboard: `https://menuscarta.com/dashboard`

## 🎯 Estado del Proyecto

### ✅ Fase 1 - MVP (Completada)
- [x] Configurar proyecto y estructura base
- [x] Implementar sistema de diseño iOS completo
- [x] Crear páginas principales (Landing, Clientes, Dashboard, Vista Pública)
- [x] Sistema de autenticación con cookies
- [x] Generar QR codes
- [x] Base de datos Supabase con RLS

### ✅ Fase 2 - Editor Drag-and-Drop (Completada)
- [x] Desarrollar editor drag-and-drop con @dnd-kit
- [x] Edición inline de categorías y platos
- [x] Reordenamiento de elementos
- [x] Selector de temas con preview
- [x] Hooks de Supabase (useMenu, useThemes)
- [x] Integrar Supabase Realtime
- [x] Dashboard funcional con tabs

### ⏳ Fase 3 - Features Avanzadas (Próximo)
- [ ] Upload de imágenes con Supabase Storage
- [ ] Gestor de promociones y happy hours
- [ ] Panel de administración
- [ ] Analytics básico
- [ ] Multi-idioma (ES/EN)

## 📄 Licencia

Propiedad de Cognitiva SpA - Todos los derechos reservados
