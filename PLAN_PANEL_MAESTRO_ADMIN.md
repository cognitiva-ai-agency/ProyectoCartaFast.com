# 🔧 Plan: Panel de Control Maestro de Administración

## 📋 Objetivo
Crear un panel de administración centralizado para gestionar todos los restaurantes de la plataforma MenusCarta.com.

---

## 🎯 Requerimientos

### 1. Acceso al Panel Maestro
- **URL**: `https://proyecto-carta-fast-com.vercel.app/clientes`
- **Slug especial**: `restoranmaestroadmin`
- **Contraseña**: `restoranmaestroadmin4155231`
- **Redirige a**: `/dashboard/restoranmaestroadmin`

### 2. Funcionalidades del Panel

#### 2.1 Vista Principal
- ✅ Listado completo de todos los restaurantes
- ✅ Información visible por restaurante:
  - Logo (thumbnail)
  - Nombre
  - Slug (URL)
  - Estado (Activo/Suspendido/Cancelado)
  - Fecha de creación
  - Acciones disponibles

#### 2.2 Acciones por Restaurante
- ✅ **Editar**: Modificar nombre, slug, contraseña
- ✅ **Activar/Desactivar**: Toggle para cambiar estado (active ↔ suspended)
- ✅ **Ver Dashboard**: Link directo al panel del restaurante
- ✅ **Ver Menú Público**: Link al menú público
- ✅ **Eliminar**: Cambiar estado a 'cancelled' (soft delete)

#### 2.3 Crear Nuevo Restaurante
- ✅ Formulario modal con campos:
  - Nombre del restaurante
  - Slug (URL única)
  - Contraseña
  - Estado inicial (active por defecto)
- ✅ Validación de slug único
- ✅ Hash automático de contraseña (bcrypt)
- ✅ Creación automática de estructura en Supabase

#### 2.4 Sincronización en Tiempo Real
- ✅ Cambios reflejados inmediatamente en:
  - Menú público del restaurante
  - Dashboard del restaurante
  - Base de datos Supabase

---

## 🏗️ Arquitectura Técnica

### Base de Datos (Supabase)

#### Modificación a tabla `restaurants`
```sql
-- Agregar columna para identificar cuenta admin
ALTER TABLE restaurants
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_restaurants_is_admin ON restaurants(is_admin);
```

#### Insertar usuario maestro
```sql
INSERT INTO restaurants (
  name,
  slug,
  password_hash,
  subscription_status,
  is_admin,
  subscription_start_date
) VALUES (
  'Panel de Control Maestro',
  'restoranmaestroadmin',
  -- Hash bcrypt de 'restoranmaestroadmin4155231'
  '$2a$10$HASH_GENERADO_AQUI',
  'active',
  TRUE,
  NOW()
);
```

### Archivos a Crear/Modificar

#### 1. Backend - APIs

**`app/api/admin/restaurants/route.ts`** (NUEVO)
```typescript
// GET - Listar todos los restaurantes
// POST - Crear nuevo restaurante
```

**`app/api/admin/restaurants/[id]/route.ts`** (NUEVO)
```typescript
// GET - Obtener un restaurante
// PATCH - Actualizar restaurante
// DELETE - Soft delete (marcar como cancelled)
```

**`app/api/auth/login/route.ts`** (MODIFICAR)
```typescript
// Detectar si es login de admin
// Agregar flag isAdmin: true a la sesión
```

#### 2. Frontend - Páginas y Componentes

**`app/dashboard/restoranmaestroadmin/page.tsx`** (NUEVO)
```typescript
// Página principal del panel maestro
// Muestra listado de restaurantes
// Botón "Agregar Restaurante"
```

**`components/admin/RestaurantList.tsx`** (NUEVO)
```typescript
// Tabla de restaurantes con acciones
```

**`components/admin/RestaurantRow.tsx`** (NUEVO)
```typescript
// Fila individual de la tabla
// Toggle de estado
// Botones de acción
```

**`components/admin/RestaurantFormModal.tsx`** (NUEVO)
```typescript
// Modal para crear/editar restaurante
// Validación de formulario
```

**`components/admin/AdminGuard.tsx`** (NUEVO)
```typescript
// Componente de protección
// Verifica isAdmin en sesión
// Redirige si no es admin
```

#### 3. Tipos TypeScript

**`types/index.ts`** (MODIFICAR)
```typescript
// Agregar tipo AdminSession
interface AdminSession extends Session {
  isAdmin: true
}

// Agregar tipo RestaurantWithStats
interface RestaurantWithStats extends Restaurant {
  stats: {
    categoriesCount: number
    itemsCount: number
    lastUpdate: string
  }
}
```

---

## 🔐 Seguridad

### Protección de Rutas Admin

**Middleware** (NUEVO)
```typescript
// middleware.ts
// Verificar isAdmin para rutas /api/admin/*
// Verificar isAdmin para /dashboard/restoranmaestroadmin
```

### RLS (Row Level Security) en Supabase
```sql
-- Solo usuarios admin pueden ver todos los restaurantes
CREATE POLICY "Admin can view all restaurants"
ON restaurants FOR SELECT
USING (is_admin = TRUE);

-- Solo usuarios admin pueden modificar otros restaurantes
CREATE POLICY "Admin can update restaurants"
ON restaurants FOR UPDATE
USING (is_admin = TRUE);
```

---

## 🎨 Diseño UI del Panel Maestro

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  🍽️  Panel de Control Maestro - MenusCarta                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Restaurantes Activos (3)        [+ Nuevo Restaurante]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Logo │ Nombre      │ Slug      │ Estado  │ Acciones   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 🖼️   │ Dr. Gadget  │ restoran1 │ ✅ Activo│ 🔧 ⚙️ 👁️  │ │
│  │ 🖼️   │ Restorán 2  │ restoran2 │ ✅ Activo│ 🔧 ⚙️ 👁️  │ │
│  │ 🖼️   │ Demo        │ usuariodemo│ ⏸️ Suspendido│ 🔧 ⚙️ 👁️ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Modal "Nuevo Restaurante"
```
┌───────────────────────────────────┐
│  Agregar Nuevo Restaurante        │
│  ┌────────────────────────────┐   │
│  │ Nombre: [____________]     │   │
│  │ Slug:   [____________]     │   │
│  │         (tu-app.com/slug)  │   │
│  │ Contraseña: [__________]   │   │
│  │ Estado: [✅ Activo ▼]      │   │
│  └────────────────────────────┘   │
│  [Cancelar]  [Crear Restaurante]  │
└───────────────────────────────────┘
```

---

## 📊 Flujo de Trabajo

### 1. Login como Admin
```
Usuario → /clientes
   ↓
Ingresa: slug = "restoranmaestroadmin"
         password = "restoranmaestroadmin4155231"
   ↓
API verifica credenciales → Encuentra is_admin = TRUE
   ↓
Crea sesión con isAdmin: true
   ↓
Redirige a /dashboard/restoranmaestroadmin
```

### 2. Ver Listado de Restaurantes
```
Panel Maestro carga
   ↓
Fetch GET /api/admin/restaurants
   ↓
Supabase query:
  SELECT * FROM restaurants
  WHERE is_admin = FALSE
  ORDER BY created_at DESC
   ↓
Renderiza tabla con datos
```

### 3. Crear Nuevo Restaurante
```
Admin presiona "Nuevo Restaurante"
   ↓
Modal se abre con formulario
   ↓
Admin completa: nombre, slug, contraseña
   ↓
Submit → POST /api/admin/restaurants
   ↓
API hashea contraseña con bcrypt
   ↓
INSERT INTO restaurants (...)
   ↓
Respuesta: restaurante creado
   ↓
Tabla se actualiza automáticamente
```

### 4. Activar/Desactivar Restaurante
```
Admin presiona toggle de estado
   ↓
PATCH /api/admin/restaurants/[id]
   ↓
UPDATE restaurants
SET subscription_status = 'suspended' | 'active'
WHERE id = [id]
   ↓
Menú público del restaurante se actualiza
   ↓
Toggle cambia visualmente
```

### 5. Editar Restaurante
```
Admin presiona botón "Editar"
   ↓
Modal se abre con datos actuales
   ↓
Admin modifica campos
   ↓
Submit → PATCH /api/admin/restaurants/[id]
   ↓
UPDATE restaurants SET ...
   ↓
Si cambió contraseña → hashear nueva
   ↓
Tabla se actualiza
```

---

## 🧪 Testing del Panel Maestro

### Casos de Prueba

1. ✅ **Login de Admin**
   - Ir a `/clientes`
   - Ingresar slug: `restoranmaestroadmin`
   - Ingresar password: `restoranmaestroadmin4155231`
   - Debe redirigir a `/dashboard/restoranmaestroadmin`

2. ✅ **Ver Listado**
   - El panel debe mostrar todos los restaurantes excepto el admin
   - Debe mostrar: nombre, slug, logo, estado

3. ✅ **Crear Restaurante**
   - Presionar "Nuevo Restaurante"
   - Completar formulario
   - Debe crear registro en Supabase
   - Debe aparecer en la tabla
   - Debe permitir login con las credenciales creadas

4. ✅ **Activar/Desactivar**
   - Presionar toggle de un restaurante
   - Estado debe cambiar en BD
   - Menú público debe reflejar el cambio
   - Si está suspendido, no debe permitir login

5. ✅ **Editar Restaurante**
   - Presionar "Editar"
   - Cambiar nombre/slug/contraseña
   - Debe actualizar en BD
   - Nuevas credenciales deben funcionar

6. ✅ **Seguridad**
   - Restaurante normal NO debe poder acceder a `/dashboard/restoranmaestroadmin`
   - Rutas `/api/admin/*` solo accesibles para admin
   - Token de sesión con `isAdmin: true` requerido

---

## 📦 Dependencias Necesarias

Ya están instaladas:
- ✅ `bcryptjs` - Para hashear contraseñas
- ✅ `@supabase/supabase-js` - Cliente de Supabase
- ✅ `react-hook-form` - Formularios (si es necesario)
- ✅ `zod` - Validación de esquemas (si es necesario)

---

## 🚀 Plan de Implementación (Orden)

### Fase 1: Base de Datos (15 min)
1. ✅ Agregar columna `is_admin` a tabla `restaurants`
2. ✅ Crear usuario maestro con contraseña hasheada
3. ✅ Configurar RLS policies para admin

### Fase 2: Backend APIs (30 min)
1. ✅ Modificar `/api/auth/login` para detectar admin
2. ✅ Crear `/api/admin/restaurants` (GET, POST)
3. ✅ Crear `/api/admin/restaurants/[id]` (GET, PATCH, DELETE)
4. ✅ Agregar verificación de admin en APIs

### Fase 3: Frontend - Panel Maestro (45 min)
1. ✅ Crear página `/dashboard/restoranmaestroadmin`
2. ✅ Crear componente `RestaurantList`
3. ✅ Crear componente `RestaurantRow`
4. ✅ Crear componente `RestaurantFormModal`
5. ✅ Crear componente `AdminGuard`

### Fase 4: Seguridad (15 min)
1. ✅ Implementar middleware de protección
2. ✅ Validar sesiones admin en servidor
3. ✅ Proteger rutas sensibles

### Fase 5: Testing (20 min)
1. ✅ Probar login como admin
2. ✅ Probar CRUD completo de restaurantes
3. ✅ Verificar sincronización en tiempo real
4. ✅ Probar seguridad (accesos no autorizados)

**Tiempo estimado total**: ~2 horas

---

## 📝 Notas Importantes

1. **Contraseña del Admin**: `restoranmaestroadmin4155231`
   - Debe hashearse con bcrypt antes de insertar en BD
   - Usar bcrypt con rounds=10 (estándar)

2. **Slug Único**: `restoranmaestroadmin`
   - No puede usarse para crear restaurantes normales
   - Validación en API de creación

3. **Campo is_admin**:
   - Solo puede ser TRUE para cuenta maestra
   - Restaurantes normales siempre FALSE
   - No editable desde panel normal

4. **Estados válidos** (`subscription_status`):
   - `active` - Restaurante activo, puede hacer login
   - `suspended` - Temporalmente suspendido, no puede login
   - `cancelled` - Cancelado permanentemente, no puede login

5. **Sincronización**:
   - Cambios en Supabase se reflejan automáticamente
   - Menú público lee de Supabase en cada request
   - Dashboard del restaurante lee de Supabase

---

## ✅ Checklist de Completitud

### Base de Datos
- [ ] Columna `is_admin` agregada
- [ ] Usuario maestro creado
- [ ] RLS policies configuradas

### Backend
- [ ] API login detecta admin
- [ ] API `/api/admin/restaurants` creada
- [ ] API `/api/admin/restaurants/[id]` creada
- [ ] Validación de permisos implementada

### Frontend
- [ ] Página panel maestro creada
- [ ] Listado de restaurantes funcional
- [ ] Formulario de creación funcional
- [ ] Edición de restaurantes funcional
- [ ] Toggle de estado funcional

### Seguridad
- [ ] Middleware de protección implementado
- [ ] Verificación de sesión admin
- [ ] Rutas protegidas

### Testing
- [ ] Login admin probado
- [ ] CRUD completo probado
- [ ] Sincronización verificada
- [ ] Seguridad verificada

---

**Última actualización**: 24 de octubre de 2025
**Versión**: 1.0
**Estado**: Planificación Completa ✅
