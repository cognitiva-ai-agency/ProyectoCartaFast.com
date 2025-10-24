# 🔐 Guía: Restaurantes, URLs y Credenciales

## 📋 Índice
- [Sistema de Autenticación](#sistema-de-autenticación)
- [Restaurantes Configurados](#restaurantes-configurados)
- [URLs del Sistema](#urls-del-sistema)
- [Dónde Están las Contraseñas](#dónde-están-las-contraseñas)
- [Verificar Restaurantes en Supabase](#verificar-restaurantes-en-supabase)
- [Agregar Nuevos Restaurantes](#agregar-nuevos-restaurantes)

---

## 🔒 Sistema de Autenticación

La aplicación tiene **dos modos de autenticación** que funcionan en paralelo:

### 1. **Producción - Supabase** (Prioritario)
- **Base de datos**: PostgreSQL en Supabase
- **Tabla**: `restaurants`
- **Contraseñas**: Hasheadas con `bcrypt`
- **Ubicación**: Nube (Supabase)
- **Uso**: Vercel (producción) + localhost (si hay variables de entorno)

### 2. **Fallback - Filesystem** (Respaldo)
- **Base de datos**: Archivos JSON locales
- **Ubicación**: `data/restaurants/{slug}/auth.json`
- **Contraseñas**: Texto plano
- **Uso**: Localhost (cuando Supabase no está configurado)

### 🔄 Flujo de Autenticación

```
Usuario hace login
    ↓
¿Existen variables de Supabase?
    ↓ SÍ                    ↓ NO
Buscar en Supabase      Buscar en Filesystem
    ↓                           ↓
¿Encontrado?                ¿Encontrado?
    ↓ SÍ                        ↓ SÍ
Verificar bcrypt            Verificar texto plano
    ↓                           ↓
Login exitoso ✅            Login exitoso ✅
```

**Código**: `app/api/auth/login/route.ts:64-141`

---

## 🍽️ Restaurantes Configurados

### Filesystem (Localhost)

| Slug | Contraseña | Nombre | Archivo |
|------|------------|--------|---------|
| `restoran1` | `123456` | Dr. Gadget | `data/restaurants/restoran1/auth.json` |
| `restoran2` | `654321` | Mi Restaurante | `data/restaurants/restoran2/auth.json` |
| `usuariodemo` | `000000` | Usuario Demo | `data/restaurants/usuariodemo/auth.json` |

### Supabase (Producción)

**⚠️ IMPORTANTE**: Las contraseñas en Supabase están hasheadas. No se pueden leer directamente.

Para verificar qué restaurantes existen en Supabase:

1. **Opción 1: Desde Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard/project/{tu-proyecto}/editor
   - Tabla: `restaurants`
   - Columnas: `slug`, `name`, `password_hash`

2. **Opción 2: Crear script de consulta**
   ```bash
   node scripts/check-credentials.js
   ```

---

## 🌐 URLs del Sistema

### Estructura de URLs

```
https://tu-dominio.vercel.app/{slug}           → Menú público
https://tu-dominio.vercel.app/clientes         → Página de login
https://tu-dominio.vercel.app/dashboard/{slug} → Dashboard del restaurante
```

### Ejemplos con `restoran1`

**Producción (Vercel)**:
```
https://tu-app.vercel.app/restoran1           → Ver menú
https://tu-app.vercel.app/clientes            → Login
https://tu-app.vercel.app/dashboard/restoran1 → Dashboard
```

**Desarrollo (Localhost)**:
```
http://localhost:3002/restoran1           → Ver menú
http://localhost:3002/clientes            → Login
http://localhost:3002/dashboard/restoran1 → Dashboard
```

---

## 📁 Dónde Están las Contraseñas

### Filesystem (Desarrollo Local)

Cada restaurante tiene un archivo `auth.json`:

**Ubicación**: `data/restaurants/{slug}/auth.json`

**Ejemplo** (`restoran1/auth.json`):
```json
{
  "password": "123456",
  "created_at": "2025-10-23T23:30:00.000Z"
}
```

**Cómo cambiar contraseña**:
1. Editar el archivo `auth.json`
2. Cambiar el valor de `"password"`
3. Guardar el archivo
4. Reintentar login

### Supabase (Producción)

**Ubicación**: Base de datos PostgreSQL en Supabase

**Tabla**: `restaurants`
**Columnas clave**:
- `slug` (VARCHAR) - URL del restaurante
- `name` (VARCHAR) - Nombre del restaurante
- `password_hash` (TEXT) - Contraseña hasheada con bcrypt

**⚠️ Las contraseñas están hasheadas** - No se pueden leer directamente.

**Cómo cambiar contraseña en Supabase**:

**Opción 1: Usar script Node.js**
```javascript
// scripts/update-password.js
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updatePassword(slug, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10)

  const { error } = await supabase
    .from('restaurants')
    .update({ password_hash: hash })
    .eq('slug', slug)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`✅ Contraseña actualizada para: ${slug}`)
  }
}

// Uso:
updatePassword('restoran1', 'nueva_contraseña_123')
```

**Opción 2: Desde Supabase SQL Editor**
```sql
-- 1. Generar hash de la contraseña (usar herramienta externa: https://bcrypt-generator.com/)
-- 2. Actualizar en Supabase:

UPDATE restaurants
SET password_hash = '$2a$10$TU_HASH_GENERADO_AQUI'
WHERE slug = 'restoran1';
```

---

## 🔍 Verificar Restaurantes en Supabase

### Método 1: Supabase Dashboard (Visual)

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Menu lateral → **Table Editor**
4. Tabla: `restaurants`
5. Verás todos los restaurantes con sus slugs

### Método 2: SQL Query

En Supabase SQL Editor:

```sql
SELECT
  slug,
  name,
  subscription_status,
  created_at
FROM restaurants
ORDER BY created_at DESC;
```

### Método 3: Script Node.js

Crear `scripts/check-credentials.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('slug, name, subscription_status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('\n🍽️  Restaurantes en Supabase:\n')
  data.forEach(r => {
    console.log(`  • ${r.slug} - ${r.name} (${r.subscription_status})`)
  })
  console.log()
}

listRestaurants()
```

Ejecutar:
```bash
node scripts/check-credentials.js
```

---

## ➕ Agregar Nuevos Restaurantes

### Opción 1: Filesystem (Desarrollo/Respaldo)

**Usando el script automatizado** (Recomendado):

```bash
node scripts/create-restaurant.js <slug> <password> [nombre]
```

**Ejemplos**:
```bash
# Crear restaurante básico
node scripts/create-restaurant.js pizzeria pass123 "La Pizzería"

# Crear con contraseña compleja
node scripts/create-restaurant.js sushi2024 Secure#Pass99 "Sushi Bar Tokyo"
```

**Manual**:
1. Crear carpeta: `data/restaurants/{slug}/`
2. Crear subcarpeta: `data/restaurants/{slug}/images/`
3. Copiar archivos JSON de `restoran1` como plantilla
4. Editar `auth.json` con nueva contraseña
5. Editar `theme.json` con nombre del restaurante

### Opción 2: Supabase (Producción)

**Usando SQL en Supabase**:

```sql
-- 1. Generar hash bcrypt de la contraseña en: https://bcrypt-generator.com/
-- 2. Insertar restaurante:

INSERT INTO restaurants (
  name,
  slug,
  password_hash,
  subscription_status,
  subscription_start_date
) VALUES (
  'La Pizzería Italiana',
  'pizzeria',
  '$2a$10$TU_HASH_BCRYPT_AQUI',
  'active',
  NOW()
);
```

**Usando script Node.js**:

```javascript
// scripts/create-restaurant-supabase.js
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createRestaurant(slug, name, password) {
  const hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      slug: slug,
      name: name,
      password_hash: hash,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString()
    })
    .select()

  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Restaurante creado:', data)
  }
}

// Uso:
createRestaurant('pizzeria', 'La Pizzería', 'pass123')
```

---

## 🔑 Resumen de Accesos

### Para Desarrollo Local (Filesystem)

| Restaurante | URL | Usuario/Slug | Contraseña |
|-------------|-----|--------------|------------|
| Dr. Gadget | http://localhost:3002/restoran1 | `restoran1` | `123456` |
| Mi Restaurante | http://localhost:3002/restoran2 | `restoran2` | `654321` |
| Usuario Demo | http://localhost:3002/usuariodemo | `usuariodemo` | `000000` |

### Para Producción (Supabase/Vercel)

**⚠️ Verificar en Supabase Dashboard** qué restaurantes están creados.

**Login**:
1. Ir a: https://tu-app.vercel.app/clientes
2. Ingresar **slug** del restaurante
3. Ingresar **contraseña** (la que se configuró al crear el restaurante)

---

## 🚨 Troubleshooting

### "Restaurante no encontrado"

**En Vercel/Producción**:
- ✅ Verificar que el restaurante existe en Supabase
- ✅ Usar SQL: `SELECT * FROM restaurants WHERE slug = 'tu-slug'`

**En Localhost**:
- ✅ Verificar que existe la carpeta: `data/restaurants/{slug}/`
- ✅ Verificar que todos los archivos JSON existen

### "Contraseña incorrecta"

**En Vercel/Producción**:
- ✅ Recordar que la contraseña es case-sensitive
- ✅ Verificar que el hash bcrypt está correcto en Supabase
- ✅ Regenerar hash si es necesario

**En Localhost**:
- ✅ Verificar contraseña en `data/restaurants/{slug}/auth.json`
- ✅ La contraseña debe coincidir exactamente (case-sensitive)

### ¿El login usa Supabase o Filesystem?

**Verificar en los logs del servidor**:

```bash
# Logs en Vercel: Ver en Vercel Dashboard → Logs

# Logs en localhost:
npm run dev

# Buscar en consola:
# "✅ Supabase configured, attempting Supabase auth first..."  → Usando Supabase
# "⚠️ Trying filesystem-based auth..."  → Usando Filesystem
```

---

## 📞 Comandos Útiles

```bash
# Listar restaurantes en filesystem
ls data/restaurants

# Ver contraseña de un restaurante (filesystem)
cat data/restaurants/restoran1/auth.json

# Crear nuevo restaurante (filesystem)
node scripts/create-restaurant.js nuevo-slug password123 "Nombre Restaurante"

# Verificar restaurantes en Supabase
node scripts/check-credentials.js

# Actualizar contraseña en Supabase
node scripts/update-password.js restoran1 nueva_password
```

---

## 📝 Notas Importantes

1. **Prioridad**: Supabase tiene prioridad sobre Filesystem si ambos están configurados
2. **Seguridad**: Las contraseñas en Supabase están hasheadas (bcrypt)
3. **Slug único**: Cada restaurante debe tener un slug único en ambos sistemas
4. **Variables de entorno**: Vercel necesita las variables de Supabase configuradas
5. **Migración**: Puedes tener restaurantes en filesystem y otros en Supabase simultáneamente

---

## ✅ Checklist de Configuración

### Para Desarrollo (Filesystem)

- [ ] Carpeta `data/restaurants/{slug}/` creada
- [ ] Archivo `auth.json` con contraseña
- [ ] Todos los archivos JSON necesarios creados
- [ ] Probado login en `http://localhost:3002/clientes`

### Para Producción (Supabase)

- [ ] Restaurante insertado en tabla `restaurants`
- [ ] Contraseña hasheada con bcrypt
- [ ] Slug único en la base de datos
- [ ] Variables de entorno configuradas en Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Probado login en producción

---

**Última actualización**: 24 de octubre de 2025
**Sistema**: MenusCarta v2.0 (Supabase Migration)
