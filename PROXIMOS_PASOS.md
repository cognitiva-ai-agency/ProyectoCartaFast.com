# 🎯 Próximos Pasos Inmediatos - MenusCarta.com

## ESTA SEMANA (Días 1-7)

### 📅 DÍA 1: Decisiones Estratégicas

#### ✅ Definir Modelo de Negocio
```
[ ] Decidir pricing:
    - ¿Gratis + Plan pago?
    - ¿Solo planes de pago?
    - ¿Freemium?

    RECOMENDACIÓN:
    ✓ 14 días gratis (sin tarjeta)
    ✓ Plan Básico: $9.990 CLP/mes
    ✓ Plan Premium: $19.990 CLP/mes
```

#### ✅ Validar Propuesta de Valor
```
[ ] Responder estas preguntas:
    1. ¿Qué problema resuelvo?
       → Menús en papel costosos y difíciles de actualizar

    2. ¿Por qué soy mejor que la competencia?
       → Setup incluido, sin contratos, soporte local

    3. ¿Quién es mi cliente ideal?
       → Restaurantes 10-50 mesas, dueños 30-60 años
```

---

### 📅 DÍA 2: Setup Técnico Básico

#### 1️⃣ Registrar Dominio
```bash
# Opciones:
- menuscarta.com ($12/año) ← RECOMENDADO
- menuscarta.cl ($25.000 CLP/año)
- menucarta.com (si el anterior no está)

Dónde comprar:
✓ Namecheap.com (más barato)
✓ GoDaddy.com (más conocido)
✓ NIC.cl (para .cl)
```

#### 2️⃣ Crear Cuenta Vercel
```bash
# Paso a paso:
1. Ir a vercel.com
2. Sign up con GitHub
3. Importar proyecto desde GitHub
4. Deploy automático

COSTO: $0 (plan hobby)
```

#### 3️⃣ Crear Cuenta Supabase
```bash
# Paso a paso:
1. Ir a supabase.com
2. Sign up
3. New project
4. Copiar:
   - URL del proyecto
   - Service role key
   - Anon key

COSTO: $0 hasta 500MB
```

#### 4️⃣ Variables de Entorno
```bash
# En Vercel, agregar:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

---

### 📅 DÍA 3: Crear Contenido de Marketing

#### ✅ Landing Page (página principal)

**Estructura mínima:**
```
/app/page.tsx - Reemplazar con:

Hero Section:
┌────────────────────────────────────┐
│  Menú Digital Profesional         │
│  para tu Restaurante               │
│                                    │
│  Actualiza precios en segundos     │
│  Clientes escanean QR y listo      │
│                                    │
│  [Prueba 14 días gratis]           │
└────────────────────────────────────┘

Demo interactivo:
- QR code que lleva a menú de ejemplo
- Video 30 seg mostrando cómo funciona

Beneficios:
✓ Sin app que descargar
✓ Actualización instantánea
✓ Ahorra en impresión
✓ Descuentos automáticos

Precios:
[Gratis 14 días] [Básico $9.990] [Premium $19.990]

Testimonios:
(Agregar después de primeros clientes)

CTA final:
"Crea tu menú digital en 5 minutos"
```

#### ✅ Crear Material de Ventas

**1. Presentación PDF (5 slides):**
```
Slide 1: Problema
- Menús en papel cuestan $200.000/año
- Cambiar precios = reimprimir todo
- Clientes no ven menú completo

Slide 2: Solución
- Menú digital con QR
- Actualización en 10 segundos
- Sin app, solo escanear

Slide 3: Cómo funciona
- Screenshots del dashboard
- Video de cliente usando

Slide 4: Beneficios
- Ahorro de $X/año
- Más ventas (descuentos automáticos)
- Imagen profesional

Slide 5: Pricing
- 14 días gratis
- Planes desde $9.990
- Sin contrato
```

**2. Email de prospección:**
```
Asunto: ¿Cuánto gastas al año imprimiendo menús?

Hola [Nombre],

Ayudo a restaurantes como [NOMBRE RESTAURANTE] a:
- Ahorrar $200.000/año en impresión
- Actualizar precios en 10 segundos
- Aumentar ventas con descuentos automáticos

¿Te muestro cómo funciona?
Te toma 10 minutos verlo.

Prueba gratis por 14 días.

Saludos,
Oscar
+56 9 3241 7147
```

---

### 📅 DÍA 4: Redes Sociales

#### ✅ Crear Perfiles

**Instagram:**
```
Usuario: @menuscarta.cl
Bio:
"Menú digital profesional para restaurantes 📱
✓ QR personalizado
✓ Actualización instantánea
✓ 14 días gratis
👇 Prueba aquí"
[Link a landing]

Primer post:
- Imagen: Antes/Después (menú papel vs QR)
- Caption: "Di adiós a reimprimir menús cada vez que cambias precios"
```

**Facebook:**
```
Página: MenusCarta Chile
About:
"Creamos menús digitales profesionales para restaurantes.
Tus clientes escanean un QR y ven el menú actualizado.
Sin app, sin complicaciones."

Primer post:
- Video: Demo de 30 segundos
- Texto: "Mira qué fácil es actualizar tu menú"
```

**LinkedIn:**
```
Perfil: MenusCarta
About:
"SaaS para digitalización de menús en restaurantes.
Ayudamos a restaurantes a reducir costos de impresión
y mejorar experiencia del cliente."

Primer artículo:
"Por qué los menús digitales son el futuro de la gastronomía"
```

---

### 📅 DÍA 5-6: Lista de Prospectos

#### ✅ Investigar Restaurantes

**Crear Google Sheet con:**
```
| Nombre | Dirección | Teléfono | Email | Instagram | Estado |
|--------|-----------|----------|-------|-----------|--------|
| La Trattoria | Av. X 123 | +56... | email | @user | Pendiente |
```

**Dónde encontrarlos:**
1. Google Maps: "restaurantes en [tu ciudad]"
2. Instagram: #restaurante[ciudad]
3. Tripadvisor
4. Rappi/Uber Eats (tienen listados)

**Meta:** 100 restaurantes en la lista

**Filtro ideal:**
- 10-50 mesas
- Menú con 20-50 platos
- Activos en redes sociales
- Buenos reviews (cuidan su imagen)

---

### 📅 DÍA 7: Primeros Contactos

#### ✅ Estrategia de Contacto

**Método 1: Instagram DM**
```
Mensaje:
---
¡Hola! 👋

Vi tu restaurante [NOMBRE] en Instagram
y se ve increíble.

¿Ya usan menú digital con QR?

Configuré uno para otros restaurantes y
les encanta poder actualizar precios al instante.

¿Te muestro cómo se vería para [NOMBRE]?
(Te toma 5 min verlo)

No cuesta nada probarlo 😊
```

**Método 2: Email**
```
Asunto: [NOMBRE RESTAURANTE] - Menú Digital

Hola [Nombre],

Soy Oscar de MenusCarta.

Vi que [NOMBRE] tiene un menú muy variado.
¿Cada cuánto cambian precios?

Ayudo a restaurantes a tener menú digital:
- Clientes escanean QR
- Actualizas precios en 10 seg
- Sin app que descargar
- 14 días gratis

¿Te muestro cómo se vería?

Saludos,
Oscar
+56 9 3241 7147
```

**Método 3: WhatsApp Business**
```
Hola! 👋

Soy Oscar, ayudo a restaurantes con menús digitales.

Vi [NOMBRE RESTAURANTE] y me gustaría
mostrarte cómo se vería con QR.

¿Tienes 5 min para verlo?
Es gratis probarlo 😊
```

**Meta Día 7:** Contactar 20 restaurantes
**Conversión esperada:** 2-3 respuestas

---

## SEMANA 2: Primeras Demos y Clientes

### 🎯 Setup de Demo

#### ✅ Restaurante de Ejemplo Perfecto

```bash
# Crear restaurante demo impresionante
node scripts/create-restaurant.js demo-restoran demo123 "Restaurante Demo"

Luego:
1. Agregar 30-40 platos con imágenes profesionales
2. 8-10 categorías bien organizadas
3. Precios realistas
4. Descuentos programados activos
5. Logo profesional
6. Tema atractivo

URL pública:
menuscarta.com/demo-restoran
```

#### ✅ Script de Demo (10 minutos)

**Minuto 1-2: Problema**
```
"Cuéntame, ¿cada cuánto cambias precios en el menú?"
"¿Cuánto gastas al año en imprimir/re-imprimir?"

[Dejar que hablen]

"Exacto, eso es lo que todos los restaurantes me dicen..."
```

**Minuto 3-5: Mostrar Menú Público**
```
[Abrir en celular o tablet]

"Mira, esto es lo que tus clientes verían.
Escanean este QR [mostrar] y listo."

"Sin app, sin descargar nada.
Funciona en cualquier celular."

[Dejar que interactúen]
```

**Minuto 6-8: Mostrar Dashboard**
```
"Y esto es donde TÚ actualizas todo.

¿Ves? Cambio el precio aquí...
[Cambiar precio de un plato]

...y listo. Ya está actualizado.
[Mostrar en menú público]

10 segundos. No más imprimir."
```

**Minuto 9-10: Cerrar**
```
"¿Qué te parece?"

[Respuesta]

"Perfecto. Te lo configuro ahora mismo.
14 días gratis, sin tarjeta.

Si no te gusta, simplemente no lo usas más.
¿Tengo tu email para mandarte el acceso?"
```

---

### 💼 Onboarding de Primeros Clientes

#### ✅ Checklist por Cliente

**Antes de la reunión:**
- [ ] Investigar su menú actual (web, Instagram, Google)
- [ ] Crear carpeta: `data/restaurants/[slug]/`
- [ ] Preparar QR code con su logo

**Durante la reunión (30 min):**
- [ ] Min 0-10: Hacer demo
- [ ] Min 10-15: Crear cuenta
- [ ] Min 15-25: Subir sus platos (5-10 principales)
- [ ] Min 25-30: Capacitación básica

**Después de la reunión:**
- [ ] Email con credenciales
- [ ] Video tutorial personalizado (Loom)
- [ ] WhatsApp de seguimiento al día 3
- [ ] Llamada de seguimiento al día 7

---

## MÉTRICAS PRIMERA SEMANA

### 📊 Objetivos Realistas

```
Día 1-3:
✓ Dominio registrado
✓ Sitio deployado
✓ Landing page lista
✓ Redes sociales creadas

Día 4-7:
✓ 100 restaurantes en lista
✓ 20 contactos enviados
✓ 2-3 demos agendadas
✓ 1-2 clientes confirmados

Semana 2:
✓ 5 demos realizadas
✓ 3 clientes pagando
✓ Primeros testimonios
```

---

## PRESUPUESTO PRIMERA SEMANA

| Item | Costo |
|------|-------|
| Dominio | $12 |
| Vercel | $0 |
| Supabase | $0 |
| Tarjetas de presentación | $10.000 CLP |
| Tiempo de Oscar | GRATIS (tu trabajo) |
| **TOTAL** | **~$12.000 CLP** |

---

## FAQ - Preguntas Frecuentes de Clientes

### "¿Qué pasa si no me gusta?"

✅ **Respuesta:**
"Nada. Son 14 días gratis sin tarjeta de crédito.
Si no te sirve, simplemente dejas de usarlo.
Sin cargo, sin contrato."

---

### "¿Mis clientes necesitan descargar una app?"

✅ **Respuesta:**
"No. Solo escanean el QR con la cámara del celular
y se abre el menú en el navegador.
Funciona en iPhone, Android, cualquier celular."

---

### "¿Y si se me cae Internet?"

✅ **Respuesta:**
"El menú está en la nube, no en tu local.
Tus clientes lo ven desde sus datos o WiFi.
Si tu Internet se cae, el menú igual funciona."

---

### "¿Cuánto tiempo toma configurarlo?"

✅ **Respuesta:**
"Si me das tu menú actual, yo lo subo todo.
Te toma literalmente 0 minutos.
En 1 hora tienes todo listo para usar."

---

### "¿Puedo cambiar de tema/diseño después?"

✅ **Respuesta:**
"Sí, cuando quieras. Tienes 4 temas disponibles.
Cambias con un click desde el panel."

---

### "¿Qué pasa con las imágenes?"

✅ **Respuesta:**
"Puedes subir las tuyas o yo te ayudo
con imágenes profesionales stock.
Sin límite de imágenes."

---

## RECURSOS DESCARGABLES

### 📄 Templates

**Email de Prospección:**
→ `templates/email-prospeccion.txt`

**Script de Llamada:**
→ `templates/script-llamada.txt`

**Presentación de Ventas:**
→ `templates/menuscarta-presentacion.pdf`

**Manual de Usuario:**
→ `templates/manual-usuario.pdf`

---

## HERRAMIENTAS ÚTILES

### 🛠️ Para Prospección

- **Hunter.io** - Encontrar emails de restaurantes
- **LinkedIn Sales Navigator** - Buscar dueños
- **Instagram** - Ver actividad y engagement
- **Google Maps** - Listar restaurantes por zona

### 🛠️ Para Demos

- **Loom** - Grabar video tutoriales
- **Calendly** - Agendar reuniones
- **Zoom** - Demos remotas
- **TeamViewer** - Soporte remoto

### 🛠️ Para Marketing

- **Canva** - Diseñar posts
- **CapCut** - Editar videos cortos
- **Unsplash** - Imágenes gratis
- **RemoveBG** - Quitar fondos

---

## CONTACTO URGENTE

**Si tienes dudas técnicas:**
- Revisar documentación en `/RESTAURANTES.md`
- Revisar hoja de ruta en `/HOJA_DE_RUTA.md`

**Si necesitas ayuda con ventas:**
- Practicar pitch con amigo/familiar
- Grabar tu demo y ver qué mejorar
- Pedir feedback a primeros prospectos

---

**¡Manos a la obra! 🚀**

_Recuerda: El primer cliente es el más difícil._
_Después del 5to se vuelve más fácil._

**Meta esta semana:** 1 cliente confirmado ✅
