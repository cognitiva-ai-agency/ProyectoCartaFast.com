# Guía de Configuración - MenusCarta

Esta guía te ayudará a configurar completamente la plataforma MenusCarta desde cero.

## 📋 Prerequisitos

- Node.js 18+ instalado
- Una cuenta en [Supabase](https://supabase.com)
- Git (opcional, para control de versiones)

## 🚀 Paso 1: Configuración de Supabase

### 1.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Completa los datos:
   - **Project name**: menuscarta
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Selecciona la más cercana a tus usuarios
4. Espera 2-3 minutos mientras se crea el proyecto

### 1.2 Ejecutar el Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (en el menú lateral)
2. Haz clic en "New Query"
3. Copia **todo el contenido** del archivo `database/schema.sql`
4. Pega el código en el editor SQL
5. Haz clic en **"Run"** (Ejecutar)
6. Verifica que aparezca el mensaje "Success. No rows returned"

Esto creará:
- ✅ Todas las tablas necesarias
- ✅ Row Level Security (RLS)
- ✅ Índices de optimización
- ✅ 4 temas predefinidos
- ✅ Triggers para timestamps
- ✅ Configuración de Realtime

### 1.3 Obtener Credenciales

1. Ve a **Settings** > **API** (en el menú lateral)
2. Copia estas credenciales:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Empieza con `eyJhbGciOiJIUzI1Ni...`
   - **service_role key**: Solo para uso en servidor (NUNCA la expongas)

## 🔧 Paso 2: Configuración del Proyecto

### 2.1 Instalar Dependencias

```bash
npm install
```

### 2.2 Configurar Variables de Entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

2. Edita `.env.local` con tus credenciales de Supabase:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Nunca compartas tu `SUPABASE_SERVICE_ROLE_KEY` públicamente.

## 🎨 Paso 3: Crear tu Primer Restaurante (Modo Manual)

Como aún no tenemos panel de administración, crearemos el primer restaurante manualmente:

### 3.1 Hashear Contraseña

En tu terminal, ejecuta este código Node.js:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu-contraseña-segura', 10, (err, hash) => console.log(hash))"
```

Copia el hash generado (algo como `$2a$10$...`).

### 3.2 Insertar Restaurante en Supabase

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla **restaurants**
3. Haz clic en **"Insert row"**
4. Completa los datos:
   - **name**: Nombre de tu restaurante (ej: "La Parrilla")
   - **slug**: URL única (ej: "laparrilla") - solo letras minúsculas y números
   - **password_hash**: Pega el hash que generaste
   - **owner_id**: Por ahora usa un UUID ficticio (ej: `00000000-0000-0000-0000-000000000000`)
   - **theme_id**: Busca un ID de la tabla `themes` (hay 4 predefinidos)
   - **is_active**: `true`
5. Haz clic en **Save**

## ▶️ Paso 4: Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 🧪 Paso 5: Probar la Plataforma

### 5.1 Landing Page

Ve a `http://localhost:3000` - Deberías ver la landing page con el diseño iOS.

### 5.2 Portal de Clientes

1. Ve a `http://localhost:3000/clientes`
2. Ingresa:
   - **URL**: El slug que creaste (ej: "laparrilla")
   - **Contraseña**: La contraseña que usaste para generar el hash
3. Haz clic en **"Ingresar al Panel"**

### 5.3 Dashboard

Deberías ser redirigido a `http://localhost:3000/dashboard/laparrilla`

### 5.4 Vista Pública del Menú

Ve a `http://localhost:3000/laparrilla` - Verás el menú público (vacío por ahora).

## 📱 Paso 6: Generar QR Code

En el dashboard, ve a la pestaña **"Código QR"** para:
- Ver el QR de tu menú
- Descargarlo en PNG o SVG
- Imprimirlo directamente

## 🗄️ Paso 7: Agregar Contenido al Menú (Manual)

Por ahora, para agregar platos al menú, usa el **Table Editor de Supabase**:

### 7.1 Crear un Menú

1. Tabla: **menus**
2. Datos:
   - **restaurant_id**: ID del restaurante que creaste
   - **name**: "Menú Principal"
   - **is_active**: `true`

### 7.2 Crear Categorías

1. Tabla: **categories**
2. Datos:
   - **menu_id**: ID del menú que creaste
   - **name**: "Entrantes" (o cualquier categoría)
   - **position**: 1
   - **is_visible**: `true`

### 7.3 Crear Platos

1. Tabla: **menu_items**
2. Datos:
   - **category_id**: ID de la categoría
   - **name**: "Ensalada César"
   - **description**: "Lechuga romana, pollo, parmesano..."
   - **price**: 8.50
   - **position**: 1
   - **is_available**: `true`

Refresca `http://localhost:3000/laparrilla` y verás el plato aparecer en tiempo real.

## 🚢 Paso 8: Despliegue en Producción

### Opción A: Desplegar en Vercel (Recomendado)

1. Crea una cuenta en [vercel.com](https://vercel.com)
2. Conecta tu repositorio Git
3. Configura las variables de entorno en Vercel
4. Despliega con un clic

### Opción B: Otros Servicios

La app también funciona en:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🔐 Seguridad

- ✅ RLS activado en todas las tablas
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Sesiones HTTP-only cookies
- ✅ API routes protegidas
- ⚠️ Configura CORS en producción
- ⚠️ Usa HTTPS en producción

## 📚 Próximos Pasos

Con la base instalada, las siguientes features a implementar son:

1. **Editor Drag & Drop** - Para gestionar menú visualmente
2. **Gestor de Promociones** - Happy hours automáticos
3. **Selector de Temas** - Cambiar diseño del menú
4. **Upload de Imágenes** - Fotos de platos
5. **Panel de Administración** - Crear restaurantes sin SQL

## 🆘 Troubleshooting

### Error: "Restaurante no encontrado"

- Verifica que el `slug` en la URL sea correcto
- Asegúrate de que `is_active = true` en la tabla restaurants

### Error: "Credenciales incorrectas"

- Verifica que el hash de la contraseña sea correcto
- Asegúrate de usar la misma contraseña que hasheaste

### No se ven los cambios en el menú

- Verifica que `is_active = true` en menus
- Verifica que `is_visible = true` en categories
- Verifica que `is_available = true` en menu_items
- Refresca la página (Ctrl + Shift + R)

### Error de Supabase

- Verifica las credenciales en `.env.local`
- Asegúrate de que el schema SQL se ejecutó correctamente
- Revisa los logs en Supabase Dashboard

## 📞 Soporte

Para problemas o preguntas:
- Email: cognitivaspa@gmail.com
- Desarrollado por: Cognitiva SpA
- Director: Oscar Francisco Barros Tagle (Dr. Curiosity)

---

**¡Felicidades!** Tu plataforma MenusCarta está lista para usar. 🎉
