# Arquitectura de MenusCarta

Documentación técnica de la arquitectura de la plataforma.

## 🏗️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + diseño custom iOS-like
- **Animaciones**: Framer Motion
- **Drag & Drop**: @dnd-kit (preparado para futura implementación)
- **QR Codes**: qrcode.react
- **State Management**: Zustand (preparado para uso)

### Backend
- **Plataforma**: Supabase
  - PostgreSQL (base de datos)
  - Realtime (sincronización en tiempo real)
  - Row Level Security (seguridad)
  - Storage (para futuras imágenes)

### Autenticación
- Sistema custom con cookies HTTP-only
- Bcrypt para hash de contraseñas
- Session-based auth

### Hosting
- **Recomendado**: Vercel
- Compatible con: Netlify, Railway, Render, etc.

## 📁 Estructura del Proyecto

```
menuscarta.com/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page (/)
│   ├── clientes/                # Portal de acceso
│   │   └── page.tsx             # Login page (/clientes)
│   ├── dashboard/               # Panel de control
│   │   └── [slug]/              # Dashboard dinámico (/dashboard/restoran1)
│   │       └── page.tsx
│   ├── [slug]/                  # Vista pública de menús
│   │   ├── page.tsx             # Menú público (/restoran1)
│   │   └── not-found.tsx        # 404 personalizado
│   └── api/                     # API Routes
│       └── auth/
│           ├── login/route.ts   # POST /api/auth/login
│           ├── logout/route.ts  # POST /api/auth/logout
│           └── session/route.ts # GET /api/auth/session
│
├── components/
│   ├── ui/                      # Componentes base iOS-like
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts             # Barrel exports
│   ├── layout/
│   │   └── DashboardLayout.tsx  # Layout del dashboard
│   ├── menu/
│   │   └── QRCodeGenerator.tsx  # Generador de QR
│   ├── editor/                  # (Para futuro drag & drop)
│   └── auth/                    # (Para futuros componentes auth)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Cliente Supabase (client-side)
│   │   └── server.ts            # Cliente Supabase (server-side)
│   ├── auth.ts                  # Utilidades de autenticación
│   └── utils.ts                 # Utilidades generales (cn, formatPrice, etc.)
│
├── types/
│   └── index.ts                 # TypeScript types e interfaces
│
├── hooks/
│   └── useAuth.ts               # Hook de autenticación
│
├── stores/                      # (Zustand stores - preparado para uso)
│
├── styles/
│   └── globals.css              # Estilos globales + Tailwind
│
├── database/
│   └── schema.sql               # Schema completo de Supabase
│
├── public/
│   └── images/                  # Assets estáticos
│
├── .env.local.example           # Template de variables de entorno
├── tailwind.config.ts           # Configuración Tailwind (tema iOS)
├── next.config.js               # Configuración Next.js
├── tsconfig.json                # Configuración TypeScript
├── package.json                 # Dependencies
├── README.md                    # Documentación principal
├── SETUP.md                     # Guía de instalación
└── ARCHITECTURE.md              # Este archivo
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

```sql
profiles           -- Perfiles de usuarios (extiende auth.users)
  ├─ id (PK, UUID)
  ├─ email
  ├─ role (admin | owner)
  └─ timestamps

themes             -- Temas de diseño predefinidos
  ├─ id (PK, UUID)
  ├─ name
  ├─ description
  ├─ config (JSONB) -- Colores, tipografía, espaciado
  └─ is_active

restaurants        -- Restaurantes
  ├─ id (PK, UUID)
  ├─ name
  ├─ slug (UNIQUE) -- URL única (ej: "restoran1")
  ├─ owner_id (FK → profiles)
  ├─ theme_id (FK → themes)
  ├─ password_hash
  ├─ qr_code_url
  ├─ is_active
  └─ timestamps

menus              -- Menús de restaurantes
  ├─ id (PK, UUID)
  ├─ restaurant_id (FK → restaurants)
  ├─ name
  ├─ description
  ├─ is_active
  └─ timestamps

categories         -- Categorías de platos
  ├─ id (PK, UUID)
  ├─ menu_id (FK → menus)
  ├─ name
  ├─ description
  ├─ position (para ordenar)
  ├─ is_visible
  └─ timestamps

menu_items         -- Platos individuales
  ├─ id (PK, UUID)
  ├─ category_id (FK → categories)
  ├─ name
  ├─ description
  ├─ price
  ├─ image_url
  ├─ position
  ├─ is_available
  ├─ is_promotion
  ├─ promotion_price
  ├─ allergens (array)
  └─ timestamps

promotions         -- Promociones y Happy Hours
  ├─ id (PK, UUID)
  ├─ restaurant_id (FK → restaurants)
  ├─ name
  ├─ description
  ├─ discount_percentage
  ├─ discount_fixed
  ├─ start_date / end_date
  ├─ days_of_week (array)
  ├─ start_time / end_time
  ├─ is_active
  ├─ applies_to (all | category | items)
  └─ category_ids / item_ids
```

### Relaciones

```
profiles (1) ──< (N) restaurants
themes (1) ──< (N) restaurants
restaurants (1) ──< (N) menus
restaurants (1) ──< (N) promotions
menus (1) ──< (N) categories
categories (1) ──< (N) menu_items
```

### Row Level Security (RLS)

Todas las tablas tienen RLS activado con políticas específicas:

- **profiles**: Solo el usuario puede ver/editar su propio perfil
- **themes**: Lectura pública de temas activos
- **restaurants**: Owners pueden gestionar sus restaurantes, lectura pública por slug
- **menus/categories/items**: Owners pueden gestionar, lectura pública si está activo
- **promotions**: Owners pueden gestionar, lectura pública si está activo

## 🔄 Flujos Principales

### 1. Flujo de Autenticación

```
Usuario → /clientes
  ↓
Ingresa slug + password
  ↓
POST /api/auth/login
  ↓
Valida en Supabase (restaurants table)
  ↓
Compara hash con bcrypt
  ↓
Si válido: crea session cookie
  ↓
Redirect a /dashboard/[slug]
```

### 2. Flujo de Visualización de Menú Público

```
Cliente escanea QR
  ↓
Browser abre /[slug]
  ↓
Server Component fetch de Supabase:
  - Restaurant data
  - Theme config
  - Menu con categories e items
  ↓
Renderiza con tema aplicado
  ↓
Realtime subscription para updates
```

### 3. Flujo de Actualización en Tiempo Real

```
Owner edita menú en /dashboard
  ↓
POST a Supabase
  ↓
Supabase Realtime emite evento
  ↓
Todos los clientes suscritos reciben update
  ↓
UI se actualiza automáticamente
```

## 🎨 Sistema de Diseño iOS-like

### Paleta de Colores

```typescript
ios: {
  blue: '#007AFF',
  green: '#34C759',
  indigo: '#5856D6',
  orange: '#FF9500',
  pink: '#FF2D55',
  purple: '#AF52DE',
  red: '#FF3B30',
  teal: '#5AC8FA',
  yellow: '#FFCC00',
  gray: {
    50: '#F2F2F7',
    // ... hasta 950
  }
}
```

### Componentes Base

Todos los componentes siguen estos principios:

- **Bordes redondeados**: `rounded-ios` (10px), `rounded-ios-lg` (14px), `rounded-ios-xl` (20px)
- **Sombras suaves**: `shadow-ios`, `shadow-ios-lg`, `shadow-ios-xl`
- **Transiciones**: `transition-ios` (0.3s cubic-bezier)
- **Tipografía**: SF Pro Display (Apple)
- **Animaciones**: Framer Motion para modales y transiciones

### Componentes Disponibles

- `<Button />` - 5 variantes, 3 tamaños
- `<Card />` - Container con sombras
- `<Input />` - Text input con label y error states
- `<Select />` - Dropdown nativo estilizado
- `<Modal />` - Modal animado con backdrop
- `<Badge />` - Etiquetas de estado
- `<Spinner />` - Loading indicator

## 🔐 Seguridad

### Medidas Implementadas

1. **Row Level Security (RLS)**: Activado en todas las tablas
2. **Password Hashing**: Bcrypt con salt rounds = 10
3. **HTTP-only Cookies**: Sessions no accesibles desde JS
4. **API Route Protection**: Middleware para validar sesiones
5. **Input Validation**: Validación de slugs y contraseñas
6. **CSRF Protection**: Next.js built-in protection

### Mejoras Futuras

- [ ] Rate limiting en API routes
- [ ] 2FA para owners
- [ ] Audit logs
- [ ] IP whitelisting para admin panel
- [ ] Content Security Policy (CSP) headers

## 📊 Performance

### Optimizaciones Implementadas

- **Static Generation**: Landing page es estática
- **Server Components**: Fetch de datos en servidor
- **Image Optimization**: Next.js Image component (futuro)
- **Code Splitting**: Automático por Next.js
- **Lazy Loading**: Modal y componentes pesados
- **Database Indexes**: En columnas frecuentemente consultadas

### Métricas Objetivo

- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **TTI**: < 3.5s
- **CLS**: < 0.1

## 🚀 Roadmap de Desarrollo

### Fase 1: MVP (Completada)
- [x] Estructura del proyecto
- [x] Sistema de diseño iOS
- [x] Autenticación básica
- [x] Vista pública de menús
- [x] Dashboard básico
- [x] Generación de QR codes
- [x] Rutas dinámicas

### Fase 2: Editor (Próximo)
- [ ] Drag & Drop editor
- [ ] Gestión visual de categorías
- [ ] Gestión visual de platos
- [ ] Upload de imágenes
- [ ] Preview en tiempo real

### Fase 3: Personalización
- [ ] Selector de temas
- [ ] Customización de colores
- [ ] Gestor de promociones
- [ ] Happy hours automáticos

### Fase 4: Analytics
- [ ] Tracking de vistas
- [ ] Estadísticas de platos populares
- [ ] Reportes de promociones
- [ ] Dashboard de analytics

### Fase 5: Avanzado
- [ ] Multi-idioma
- [ ] Múltiples monedas
- [ ] Integración con WhatsApp
- [ ] Sistema de reservas

## 🧪 Testing (Futuro)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📦 Deployment

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### Comandos de Build

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Type check
npm run type-check

# Lint
npm run lint
```

## 👥 Contribución

Desarrollado por **Cognitiva SpA**
Director: Oscar Francisco Barros Tagle (Dr. Curiosity)

---

Última actualización: 2024
