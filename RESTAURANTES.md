# 🍽️ Sistema Multi-Restaurante

Este sistema permite gestionar múltiples restaurantes de forma independiente utilizando el sistema de archivos (filesystem).

## 📁 Estructura de Carpetas

Cada restaurante tiene su propia carpeta en `data/restaurants/{slug}/`:

```
data/restaurants/
├── restoran1/
│   ├── images/
│   │   ├── logo.jpeg
│   │   └── item-*.png
│   ├── auth.json
│   ├── banner.json
│   ├── categories.json
│   ├── custom-ingredients.json
│   ├── ingredients.json
│   ├── items.json
│   ├── menu.json
│   ├── scheduled-discounts.json
│   ├── theme.json
│   └── unavailable-ingredients.json
├── restoran2/
│   └── ... (misma estructura)
└── restoran3/
    └── ... (misma estructura)
```

## 🔑 Sistema de Autenticación

- **URL del restaurante** = **Nombre de la carpeta** (slug)
- **Contraseña** se guarda en `auth.json`
- **Login** verifica:
  1. ¿Existe la carpeta `data/restaurants/{slug}/`?
  2. ¿La contraseña coincide con `auth.json`?

### Ejemplo de `auth.json`:
```json
{
  "password": "123456",
  "created_at": "2025-10-23T23:30:00.000Z"
}
```

## 🚀 Crear un Nuevo Restaurante

### Método 1: Script Automatizado (Recomendado)

Usa el script `create-restaurant.js`:

```bash
node scripts/create-restaurant.js <slug> <password> [nombre]
```

**Ejemplos:**

```bash
# Crear restaurante con configuración básica
node scripts/create-restaurant.js restoran3 abc123

# Crear restaurante con nombre personalizado
node scripts/create-restaurant.js pizzeria secret123 "La Pizzería Italiana"

# Crear restaurante para un cliente específico
node scripts/create-restaurant.js cafeteria2024 pass456 "Cafetería Central"
```

El script creará automáticamente:
- ✅ Carpeta del restaurante
- ✅ Carpeta de imágenes
- ✅ Todos los archivos JSON necesarios
- ✅ Configuración de autenticación

### Método 2: Manual

1. Crear carpeta: `data/restaurants/{slug}/`
2. Crear subcarpeta: `data/restaurants/{slug}/images/`
3. Copiar todos los archivos JSON de `restoran2` como plantilla
4. Modificar `auth.json` con la nueva contraseña
5. Modificar `theme.json` con el nombre del restaurante

## 🌐 URLs del Sistema

### Para cada restaurante:

| Tipo | URL | Descripción |
|------|-----|-------------|
| **Menú Público** | `http://localhost:3000/{slug}` | Menú visible para clientes |
| **Login** | `http://localhost:3000/clientes` | Página de inicio de sesión |
| **Dashboard** | `http://localhost:3000/dashboard/{slug}` | Panel de administración |

### Ejemplos con `restoran1`:

- Menú público: `http://localhost:3000/restoran1`
- Login: `http://localhost:3000/clientes` (ingresar slug: `restoran1`)
- Dashboard: `http://localhost:3000/dashboard/restoran1`

## 📋 Archivos de Configuración

### `auth.json` - Autenticación
```json
{
  "password": "tu_contraseña_aqui",
  "created_at": "2025-10-23T23:30:00.000Z"
}
```

### `theme.json` - Configuración del Tema
```json
{
  "themeId": "demo-theme-warm",
  "currency": "CLP",
  "restaurantName": "Nombre del Restaurante",
  "logoUrl": "/api/restaurants/{slug}/images/logo.jpeg",
  "logoStyle": "circular",
  "timezone": "America/Santiago",
  "updated_at": "2025-10-23T23:30:00.000Z"
}
```

**Opciones de `logoStyle`:**
- `circular` - Logo redondeado
- `rectangular` - Logo con bordes redondeados
- `none` - Sin bordes (cuadrado)

**Monedas disponibles (`currency`):**
- `CLP` - Peso Chileno
- `EUR` - Euro
- `USD` - Dólar
- `MXN` - Peso Mexicano
- `ARS` - Peso Argentino
- `COP` - Peso Colombiano

### `banner.json` - Banner de Anuncios
```json
{
  "enabled": false,
  "title": "Título del Banner",
  "message": "Mensaje del anuncio",
  "variant": "info",
  "updated_at": "2025-10-23T23:30:00.000Z"
}
```

**Variantes de banner:**
- `info` - Azul (información)
- `warning` - Amarillo (advertencia)
- `success` - Verde (éxito)
- `error` - Rojo (error)

### Otros Archivos

- `categories.json` - Lista de categorías del menú
- `items.json` - Lista de platos/productos
- `menu.json` - Estructura del menú
- `custom-ingredients.json` - Ingredientes personalizados
- `ingredients.json` - Ingredientes estándar
- `unavailable-ingredients.json` - Ingredientes no disponibles
- `scheduled-discounts.json` - Descuentos programados por horario

## 🔐 Restaurantes Existentes

| Slug | Contraseña | Nombre | Dashboard |
|------|------------|--------|-----------|
| `restoran1` | `123456` | Dr. Gadget | [Ir →](http://localhost:3000/dashboard/restoran1) |
| `restoran2` | `654321` | Mi Restaurante | [Ir →](http://localhost:3000/dashboard/restoran2) |

## ⚙️ Características del Sistema

### ✅ Funcionalidades Implementadas

- **Multi-restaurante**: Cada restaurante es independiente
- **Sistema de archivos**: No requiere base de datos
- **Autenticación**: Contraseña única por restaurante
- **Temas**: Múltiples temas prediseñados
- **Logo personalizable**: Sube y configura el logo de tu restaurante
- **Menú drag-and-drop**: Reordena categorías y platos
- **Ingredientes personalizados**: Define ingredientes únicos
- **Ingredientes no disponibles**: Marca temporalmente ingredientes agotados
- **Descuentos programados**: Descuentos automáticos por horario
- **Multi-moneda**: Soporte para diferentes monedas
- **Multi-zona horaria**: Configura la zona horaria de cada restaurante
- **Badges dietarios**: Automáticos según ingredientes (vegano, vegetariano)
- **Alérgenos**: Advertencias automáticas

## 🛠️ Desarrollo

### Agregar un Nuevo Tema

1. Editar `lib/demo-data.ts`
2. Agregar tema al array `DEMO_THEMES`
3. Los restaurantes podrán seleccionarlo en Configuraciones

### Agregar Ingredientes Maestros

1. Editar `lib/ingredients.ts`
2. Agregar ingrediente al array `MASTER_INGREDIENTS`
3. Incluir propiedades: `id`, `name`, `category`, `dietType`, `isCommonAllergen`

## 🚨 Troubleshooting

### Error: "Restaurante no encontrado"
- ✅ Verificar que existe la carpeta `data/restaurants/{slug}/`
- ✅ Verificar que el slug es correcto (minúsculas, sin espacios)

### Error: "Contraseña incorrecta"
- ✅ Verificar contraseña en `data/restaurants/{slug}/auth.json`
- ✅ La contraseña es case-sensitive

### Error: "Error al cargar el menú"
- ✅ Verificar que todos los archivos JSON existen
- ✅ Verificar que los JSON tienen formato válido
- ✅ Usar el script `create-restaurant.js` para crear restaurantes

## 📝 Notas Importantes

1. **Slug único**: Cada restaurante debe tener un slug único
2. **Slug válido**: Solo letras minúsculas, números, guiones y guiones bajos
3. **Archivos requeridos**: Todos los JSON son necesarios para el correcto funcionamiento
4. **Imágenes**: Se guardan en `data/restaurants/{slug}/images/`
5. **Sin Supabase**: Este sistema NO requiere Supabase configurado

## 📞 Soporte

Para agregar nuevos restaurantes o resolver problemas:
1. Usar el script `create-restaurant.js`
2. Verificar la estructura de carpetas
3. Verificar que todos los archivos JSON existen
4. Revisar logs del servidor para errores específicos
