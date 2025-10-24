# 🚀 Inicio Rápido - MenusCarta

Guía express para configurar y probar la plataforma en 10 minutos.

---

## ⚡ Paso 1: Configurar Supabase (5 min)

### 1.1 Crear Proyecto

1. Ve a **https://supabase.com** y crea una cuenta (gratis)
2. Clic en **"New Project"**
3. Completa:
   - **Name**: menuscarta
   - **Database Password**: Crea una contraseña segura y guárdala
   - **Region**: Selecciona la más cercana (ej: South America - São Paulo)
4. Clic **"Create new project"**
5. Espera 2-3 minutos mientras se crea

### 1.2 Ejecutar Schema SQL

1. En el menú lateral, ve a **SQL Editor**
2. Clic en **"New query"**
3. Abre el archivo `database/schema.sql` de este proyecto
4. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
5. Pega en el editor SQL de Supabase
6. Clic en **"Run"** (esquina inferior derecha)
7. Deberías ver: **"Success. No rows returned"** ✅

### 1.3 Obtener Credenciales

1. Ve a **Settings** (⚙️ en menú lateral)
2. Clic en **API**
3. Copia estas 2 credenciales:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

## 🔧 Paso 2: Configurar Variables de Entorno (1 min)

1. En la raíz del proyecto, crea el archivo `.env.local`
2. Pega esto y reemplaza con tus credenciales:

```env
# Supabase (reemplaza con tus valores)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** El `SUPABASE_SERVICE_ROLE_KEY` está en la misma página de API, pero más abajo. **NO compartas esta clave públicamente.**

3. **Reinicia** el servidor de desarrollo:
   - Detén el servidor (Ctrl+C en la terminal)
   - Ejecuta `npm run dev` de nuevo

---

## 👨‍🍳 Paso 3: Crear Tu Primer Restaurante (3 min)

### 3.1 Hashear Contraseña

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('mipassword123', 10, (err, hash) => console.log(hash))"
```

**Copia** el hash generado (algo como `$2a$10$abcdef...`)

### 3.2 Insertar Restaurante en Supabase

1. En Supabase, ve a **Table Editor** (menú lateral)
2. Selecciona la tabla **themes** primero
3. **Copia el ID** de cualquier tema (ej: Classic Elegance)
4. Ahora ve a la tabla **restaurants**
5. Clic en **"Insert" → "Insert row"**
6. Completa:

```
name: Mi Restaurante
slug: mirestaurante (solo minúsculas, sin espacios)
owner_id: 00000000-0000-0000-0000-000000000000 (UUID temporal)
theme_id: [pega el ID que copiaste del tema]
password_hash: [pega el hash que generaste]
is_active: true (marca el checkbox)
```

7. Clic **"Save"**

---

## 🎉 Paso 4: ¡Acceder a Tu Dashboard!

### 4.1 Login

1. Abre **http://localhost:3000/clientes**
2. Ingresa:
   - **URL**: `mirestaurante` (el slug que pusiste)
   - **Contraseña**: `mipassword123` (la contraseña que usaste para hashear)
3. Clic **"Ingresar al Panel"**

### 4.2 Explorar el Dashboard

Deberías estar en: `http://localhost:3000/dashboard/mirestaurante`

**Prueba estas features:**

#### 📋 Tab "Menú":
- Clic **"+ Nueva Categoría"**
- Ingresa "Entrantes"
- **Haz clic** en el nombre para editarlo
- Clic **"+ Agregar Plato"**
- Ingresa nombre: "Ensalada César" y precio: "8.50"
- **Arrastra** el handle (☰) para reordenar
- **Haz clic** en el nombre o precio para editar inline

#### 🎨 Tab "Temas":
- Haz clic en un tema diferente
- Clic **"Aplicar Tema"**

#### 📱 Tab "Código QR":
- Descarga el QR en PNG
- O imprime directamente

### 4.3 Ver Tu Menú Público

Abre en otra pestaña: **http://localhost:3000/mirestaurante**

Verás tu menú con el tema aplicado. Los cambios del dashboard se reflejan aquí.

---

## 🐛 Troubleshooting

### Error: "Restaurante no encontrado"
- Verifica que el slug sea exacto (sin mayúsculas)
- Asegúrate de que `is_active = true` en la tabla

### Error: "Credenciales incorrectas"
- Verifica que la contraseña sea la misma que usaste para hashear
- Asegúrate de que el hash se guardó correctamente

### Error: No se conecta a Supabase
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de haber reiniciado el servidor después de crear `.env.local`

### El editor no carga
- Abre la consola del navegador (F12)
- Revisa si hay errores
- Asegúrate de que el schema SQL se ejecutó correctamente

---

## ✅ Checklist Rápido

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado exitosamente
- [ ] Archivo `.env.local` creado con credenciales
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Hash de contraseña generado
- [ ] Restaurante insertado en tabla `restaurants`
- [ ] Login exitoso en `/clientes`
- [ ] Dashboard carga correctamente
- [ ] Menú público accesible

---

## 🎯 Próximos Pasos

Una vez que hayas accedido:

1. **Crea varias categorías** (Entrantes, Platos Principales, Postres, Bebidas)
2. **Agrega varios platos** en cada categoría
3. **Prueba el drag-and-drop** para reordenar
4. **Cambia de tema** y ve cómo se actualiza
5. **Abre el menú público** en tu móvil escaneando el QR

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas, revisa:
- `SETUP.md` - Guía detallada
- `ARCHITECTURE.md` - Documentación técnica
- Console del navegador (F12) para ver errores

---

**¡Listo! Ya puedes probar todo lo que hemos desarrollado.** 🚀
