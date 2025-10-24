# 🔧 Solución al Error de Login Demo

## Problema
Error al iniciar sesión con credenciales demo (restoran1 / 123456)

## Causa
El servidor Next.js necesita reiniciarse después de los cambios en las API routes.

## ✅ Solución (3 pasos)

### 1. Detener el Servidor
En la terminal donde está corriendo `npm run dev`:
```bash
Presiona: Ctrl + C
```

### 2. Reiniciar el Servidor
```bash
npm run dev
```

Espera a que aparezca:
```
✓ Ready in XXXms
✓ Local: http://localhost:3000
```

### 3. Probar Login Nuevamente
1. Abre: **http://localhost:3000/clientes**
2. Ingresa:
   - **Slug:** restoran1
   - **Contraseña:** 123456
3. Clic **"Ingresar al Panel"**

## ✅ Debería Funcionar

Después del reinicio, el login demo funcionará correctamente sin necesidad de Supabase.

---

## 🔍 Si Aún No Funciona

### Revisa la Consola del Navegador
1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo

### Revisa la Terminal del Servidor
Busca errores cuando hagas login

### Prueba Acceso Directo
Después de reiniciar, prueba ir directamente a:
```
http://localhost:3000/restoran1
```

Deberías ver el menú público demo incluso sin login.

---

## 📝 Cambios Realizados

Modifiqué `app/api/auth/login/route.ts` para:
- Verificar credenciales demo ANTES de intentar Supabase
- Evitar error cuando no hay variables de entorno configuradas
- Retornar mensaje claro si Supabase no está configurado

---

**🚀 Reinicia el servidor y prueba de nuevo**
