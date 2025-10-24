# 🚀 Hoja de Ruta - MenusCarta.com
## Plan de Lanzamiento y Comercialización

---

## 📋 ÍNDICE

1. [Fase 1: Preparación Técnica (1-2 semanas)](#fase-1-preparación-técnica)
2. [Fase 2: Infraestructura y Deployment (1 semana)](#fase-2-infraestructura-y-deployment)
3. [Fase 3: Marketing y Presencia Online (2 semanas)](#fase-3-marketing-y-presencia-online)
4. [Fase 4: Captación de Primeros Clientes (4 semanas)](#fase-4-captación-de-primeros-clientes)
5. [Fase 5: Escalamiento (continuo)](#fase-5-escalamiento)
6. [Modelo de Negocio Recomendado](#modelo-de-negocio)
7. [Presupuesto Estimado](#presupuesto-estimado)
8. [KPIs y Métricas](#kpis-y-métricas)

---

## FASE 1: Preparación Técnica (1-2 semanas)

### ✅ 1.1 Migración a Base de Datos

**Razón:** El sistema actual usa archivos JSON. Para producción necesitas Supabase o PostgreSQL.

**Tareas:**
- [ ] Configurar cuenta de Supabase (gratis hasta 500MB)
- [ ] Crear schema de base de datos
- [ ] Migrar sistema de archivos a Supabase
- [ ] Implementar autenticación con JWT
- [ ] Crear sistema de roles (admin, restaurant_owner)

**Archivos a modificar:**
```
✓ lib/supabase/client.ts - Ya existe
✓ Crear migrations en supabase/migrations/
✓ Actualizar hooks para usar Supabase en producción
```

**Ventajas de Supabase:**
- Backups automáticos
- Autenticación integrada
- API REST automática
- Real-time updates
- Gratis hasta 500MB + 50,000 usuarios

---

### ✅ 1.2 Sistema de Onboarding

**Crear página de registro para restaurantes:**

```
/registro
  ├── Paso 1: Datos del restaurante
  │   - Nombre del restaurante
  │   - Email del dueño
  │   - Teléfono
  │   - Dirección
  ├── Paso 2: Crear cuenta
  │   - Email (login)
  │   - Contraseña
  │   - Confirmar contraseña
  ├── Paso 3: Seleccionar plan
  │   - Gratis (14 días)
  │   - Básico ($X/mes)
  │   - Premium ($Y/mes)
  └── Paso 4: Configuración inicial
      - Subir logo
      - Seleccionar tema
      - Agregar primeros platos (opcional)
```

**Implementación:**
```bash
# Crear componente de registro
/app/registro/page.tsx
/components/onboarding/RegistrationForm.tsx
/components/onboarding/StepIndicator.tsx
```

---

### ✅ 1.3 Panel de Administración Global

**Para Cognitiva SpA (tu empresa):**

```
/admin (solo para ti)
  ├── Dashboard general
  │   - Total restaurantes activos
  │   - Ingresos mensuales
  │   - Nuevos registros
  │   - Restaurantes por plan
  ├── Gestión de restaurantes
  │   - Listar todos
  │   - Ver detalles
  │   - Cambiar plan
  │   - Desactivar/activar
  └── Soporte
      - Tickets
      - Chat con clientes
```

---

### ✅ 1.4 Optimizaciones Técnicas

**Performance:**
- [ ] Optimizar imágenes (next/image)
- [ ] Lazy loading de componentes
- [ ] Implementar caching
- [ ] Minificar CSS/JS

**SEO:**
- [ ] Agregar meta tags dinámicos
- [ ] Sitemap.xml automático
- [ ] robots.txt
- [ ] Open Graph tags para compartir en redes

**Analytics:**
- [ ] Google Analytics 4
- [ ] Facebook Pixel
- [ ] Hotjar (ver cómo usan el menú)

---

## FASE 2: Infraestructura y Deployment (1 semana)

### 🌐 2.1 Hosting y Dominio

**Opción Recomendada: Vercel + Supabase**

| Servicio | Proveedor | Costo Mensual |
|----------|-----------|---------------|
| Frontend | Vercel | $0 (Hobby) o $20 (Pro) |
| Backend/DB | Supabase | $0 (hasta 500MB) o $25 (Pro) |
| Dominio | Namecheap | $12/año |
| Email | Google Workspace | $6/usuario |

**Total inicial:** ~$0-30/mes

**Setup:**
```bash
# 1. Registrar dominio
menuscarta.com (o .cl, .mx, etc.)

# 2. Conectar Vercel
vercel --prod

# 3. Variables de entorno
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY= (para pagos)
```

---

### 🔐 2.2 Sistema de Pagos

**Stripe para Chile/Latinoamérica:**

```typescript
// Planes de precio
const PLANES = {
  GRATIS: {
    id: 'free',
    nombre: 'Prueba Gratis',
    precio: 0,
    duracion: 14, // días
    limites: {
      items: 20,
      categorias: 5,
      imagenes: '10MB'
    }
  },
  BASICO: {
    id: 'basic',
    nombre: 'Básico',
    precio: 9990, // CLP (~$12 USD)
    features: [
      'Menú digital ilimitado',
      'QR personalizado',
      'Descuentos programados',
      'Soporte por email'
    ]
  },
  PREMIUM: {
    id: 'premium',
    nombre: 'Premium',
    precio: 19990, // CLP (~$24 USD)
    features: [
      'Todo lo de Básico',
      'Múltiples idiomas',
      'Analytics avanzado',
      'Soporte prioritario',
      'Dominio personalizado'
    ]
  }
}
```

**Integración:**
```bash
npm install @stripe/stripe-js stripe
```

---

### 📧 2.3 Sistema de Emails

**Resend.com (recomendado):**

Emails automáticos:
- Bienvenida al registrarse
- Confirmación de pago
- Recordatorio fin de prueba
- Factura mensual
- Tips de uso semanal

```typescript
// Ejemplo de email de bienvenida
const enviarBienvenida = async (email: string, nombre: string) => {
  await resend.emails.send({
    from: 'Oscar <hola@menuscarta.com>',
    to: email,
    subject: '¡Bienvenido a MenusCarta!',
    html: `
      <h1>¡Hola ${nombre}!</h1>
      <p>Tu menú digital está listo en:</p>
      <a href="https://menuscarta.com/${slug}">Ver mi menú</a>
    `
  })
}
```

---

## FASE 3: Marketing y Presencia Online (2 semanas)

### 🌟 3.1 Sitio Web Corporativo

**Crear landing page en `/`:**

```
Secciones clave:
├── Hero
│   "Menú Digital Profesional para tu Restaurante"
│   [Prueba gratis 14 días]
├── Demostración
│   - Video de 30 seg mostrando el menú
│   - QR code de ejemplo escaneaable
├── Beneficios
│   ✓ Actualiza precios en segundos
│   ✓ Clientes ven menú sin descargar app
│   ✓ Descuentos automáticos por horario
│   ✓ Reduce costos de impresión
├── Precios
│   [Gratis] [Básico $9.990] [Premium $19.990]
├── Testimonios
│   (agregarlo después de primeros clientes)
├── FAQ
└── Contacto
```

**Call-to-action principal:**
> "Crea tu menú digital en 5 minutos - Gratis por 14 días"

---

### 📱 3.2 Redes Sociales

**Instagram (@menuscarta.cl):**
- 3 posts/semana
- Contenido:
  - Tips para restaurantes
  - Antes/después (menú papel vs digital)
  - Casos de éxito
  - Stories con demos rápidos

**Facebook (MenusCarta):**
- Grupos de dueños de restaurantes
- Facebook Ads dirigidos a restaurantes locales

**LinkedIn:**
- Artículos sobre transformación digital
- Conectar con dueños de cadenas

**TikTok (opcional):**
- Videos cortos mostrando funcionalidad
- "Un día con MenusCarta"

---

### 🎥 3.3 Contenido de Valor

**YouTube:**
1. "Cómo crear tu menú digital en 5 minutos"
2. "Ahorra $500.000/año en impresión de menús"
3. "Descuentos automáticos en happy hour"

**Blog (SEO):**
- "Menú digital para restaurantes en Chile - Guía completa"
- "Códigos QR para restaurantes: Todo lo que necesitas saber"
- "Cómo aumentar ventas con menú digital"
- "Mejores prácticas para menú de restaurante"

---

## FASE 4: Captación de Primeros Clientes (4 semanas)

### 🎯 4.1 Estrategia de Ventas Directa

**Semana 1-2: Contacto Directo**

**Lista de prospectos:**
1. Restaurantes de barrio (50-100)
2. Cafeterías (30-50)
3. Pubs/Bares (20-30)
4. Food trucks (10-20)

**Script de acercamiento:**

```
Email inicial:
---
Asunto: ¿Cansado de imprimir menús cada vez que cambias precios?

Hola [Nombre],

Soy Oscar de MenusCarta. Ayudamos a restaurantes como [Nombre Restaurante]
a tener un menú digital profesional que sus clientes pueden ver desde
el celular con un simple QR.

✓ Sin app que descargar
✓ Actualizas precios en segundos
✓ Ahorras en impresión
✓ 14 días gratis

¿Te interesa verlo en acción?
Puedo hacerte una demo de 10 minutos.

Saludos,
Oscar Barros
Cognitiva SpA
+56 9 3241 7147
```

---

**WhatsApp Business:**

```
¡Hola! 👋

Vi tu restaurante [NOMBRE] y me pareció genial.

¿Ya tienes menú digital con QR?

Podría configurarte uno profesional gratis
(incluye descuentos automáticos por horario).

¿Te muestro cómo se vería?
```

---

**Semana 3-4: Visitas en Persona**

**Preparación:**
- Tablet con demo lista
- Tarjetas de presentación
- QR code impreso de ejemplo
- Folleto 1 página

**Horarios óptimos:**
- Restaurantes: 15:00-17:00 (entre almuerzo y cena)
- Cafeterías: 10:00-11:00
- Bares: 18:00-19:00

**Pitch de 2 minutos:**
```
1. Problema (30 seg)
   "¿Cada cuánto cambian precios en el menú?
    ¿Cuánto gastan en reimprimir?"

2. Solución (60 seg)
   [Mostrar demo en tablet]
   "Mira, con un QR tus clientes ven el menú.
    Cambias precios desde el celular en 10 segundos."

3. Oferta (30 seg)
   "Te lo configuramos gratis hoy mismo.
    14 días de prueba, sin tarjeta de crédito.
    Si no te sirve, simplemente no pagas nada."
```

---

### 💰 4.2 Estrategia de Precios Inicial

**Promoción de Lanzamiento:**

```
Primeros 50 clientes:
├── Mes 1-3: GRATIS
├── Mes 4-6: 50% descuento ($4.990 en vez de $9.990)
└── Mes 7+: Precio normal ($9.990/mes)
```

**Incentivo referidos:**
- Por cada restaurante que refiere: 1 mes gratis
- Restaurante referido: 1 mes gratis también

---

### 🎁 4.3 Pack de Implementación Gratuito

**Lo que incluye el setup inicial (valor $50.000):**

1. **Configuración completa** (30 min)
   - Subir todos los platos
   - Organizar categorías
   - Subir imágenes
   - Configurar precios

2. **Diseño de QR** (15 min)
   - QR personalizado con logo
   - Archivo PDF para imprimir
   - Sticker adhesivo opcional (+$5.000)

3. **Capacitación** (20 min)
   - Video tutorial personalizado
   - Llamada de soporte
   - Manual en PDF

**Total inversión por cliente:** 1 hora de tu tiempo
**Retorno:** Cliente pagando después de prueba

---

## FASE 5: Escalamiento (continuo)

### 📈 5.1 Automatización

**Mes 3-6:**
- [ ] Onboarding 100% automático
- [ ] Chatbot para soporte básico
- [ ] Emails automáticos de nurturing
- [ ] Integración con POS (punto de venta)

**Herramientas:**
- Zapier para automatizaciones
- Intercom para chat
- Calendly para agendar demos

---

### 👥 5.2 Expansión de Equipo

**Cuando tengas 30+ clientes:**

| Rol | Responsabilidad | Costo Mensual |
|-----|-----------------|---------------|
| Soporte técnico | Ayudar clientes | $400.000 CLP (part-time) |
| Ventas | Prospectar y cerrar | Comisión 20% |
| Diseñador | Crear plantillas | $300.000 CLP (freelance) |

---

### 🌎 5.3 Expansión Geográfica

**Roadmap:**
1. **Mes 1-3:** Santiago (zona piloto)
2. **Mes 4-6:** Viña del Mar, Concepción, Valparaíso
3. **Mes 7-12:** Resto de Chile
4. **Año 2:** Expansión LATAM
   - Argentina
   - Perú
   - Colombia
   - México

**Estrategia por país:**
- Partner local (comisión 30%)
- Adaptar precios a moneda local
- Marketing en idioma/cultura local

---

## MODELO DE NEGOCIO

### 💵 Estructura de Precios

| Plan | Precio/Mes | Target | Margen |
|------|------------|--------|--------|
| **Gratis** | $0 | Trial de 14 días | - |
| **Básico** | $9.990 CLP (~$12 USD) | Restaurantes pequeños | 80% |
| **Premium** | $19.990 CLP (~$24 USD) | Cadenas/Franquicias | 85% |
| **Enterprise** | Custom | +10 locales | 90% |

---

### 📊 Proyección de Ingresos

**Año 1 (conservador):**

| Mes | Clientes Activos | MRR (Ingreso Mensual) | ARR (Anual) |
|-----|------------------|----------------------|-------------|
| 1 | 5 | $49.950 | - |
| 3 | 15 | $149.850 | - |
| 6 | 40 | $399.600 | - |
| 12 | 100 | $999.000 | $11.988.000 CLP |

**Año 2 (optimista):**
- 300 clientes activos
- $2.997.000 MRR
- $35.964.000 CLP/año (~$43,000 USD)

---

### 💰 Costos Operacionales

**Mes 1-6:**
```
Hosting (Vercel + Supabase): $25/mes
Dominio: $1/mes
Email: $6/mes
Stripe fees (3%): $30 (con 100 clientes)
Marketing: $100/mes
---
TOTAL: ~$162/mes
```

**Margen bruto:** 95%+ (software)

---

## PRESUPUESTO ESTIMADO

### 💳 Inversión Inicial (Mínima)

| Item | Costo | Notas |
|------|-------|-------|
| Dominio (.com) | $12/año | Namecheap |
| Hosting Vercel Pro | $0-20/mes | Gratis hasta cierto tráfico |
| Supabase | $0-25/mes | Gratis hasta 500MB |
| Stripe | 3% por transacción | Solo cuando vendas |
| Google Workspace | $6/mes | Email profesional |
| Diseño QR stickers | $30.000 | 100 stickers |
| Marketing digital | $50.000/mes | Facebook/Google Ads |
| **TOTAL MES 1** | **~$100.000 CLP** | ~$120 USD |

---

### 📈 Inversión Marketing (Opcional)

**Para acelerar crecimiento:**

| Canal | Presupuesto/Mes | Resultado Esperado |
|-------|-----------------|-------------------|
| Google Ads | $200.000 | 10-15 leads |
| Facebook Ads | $150.000 | 20-30 leads |
| Instagram Ads | $100.000 | 15-20 leads |
| Volantes/Flyers | $50.000 | 5-10 contactos |
| **TOTAL** | **$500.000** | **50-75 leads/mes** |

**Tasa conversión esperada:** 10-20% = 5-15 clientes nuevos/mes

---

## KPIs Y MÉTRICAS

### 📊 Métricas Clave a Monitorear

**Adquisición:**
- Costo por Lead (CPL): < $5.000 CLP
- Tasa de conversión trial→pago: > 30%
- Costo de Adquisición de Cliente (CAC): < $30.000 CLP

**Retención:**
- Churn rate (cancelaciones): < 5%/mes
- Customer Lifetime Value (LTV): > $300.000 CLP
- Ratio LTV/CAC: > 3:1

**Operación:**
- Tiempo setup por cliente: < 30 min
- Tiempo respuesta soporte: < 2 horas
- Satisfacción (NPS): > 50

---

## CHECKLIST PRE-LANZAMIENTO

### ✅ Técnico

- [ ] Migrar a Supabase
- [ ] Configurar autenticación
- [ ] Sistema de registro funcionando
- [ ] Integrar Stripe
- [ ] Deploy en Vercel
- [ ] Configurar dominio
- [ ] SSL activo
- [ ] Analytics configurado
- [ ] Sistema de emails

### ✅ Marketing

- [ ] Landing page completa
- [ ] Video demo (30 seg)
- [ ] Redes sociales creadas
- [ ] 5 artículos de blog (SEO)
- [ ] Material de ventas (PDF, presentación)
- [ ] Tarjetas de presentación

### ✅ Legal

- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] Política de reembolsos
- [ ] Facturación electrónica SII
- [ ] Inicio de actividades actualizado

### ✅ Operaciones

- [ ] Email profesional configurado
- [ ] WhatsApp Business
- [ ] CRM simple (Google Sheets o HubSpot)
- [ ] Script de ventas
- [ ] Calendario de contenido (1 mes)

---

## CRONOGRAMA RESUMEN

```
Semana 1-2: Preparación Técnica
├── Migración a Supabase
├── Sistema de pagos
└── Optimizaciones

Semana 3: Deployment
├── Configurar hosting
├── Dominio y email
└── Testing final

Semana 4-5: Marketing
├── Landing page
├── Redes sociales
└── Contenido inicial

Semana 6-9: Primeros Clientes
├── Contacto directo (50 restaurantes)
├── Visitas en persona
└── Setup de primeros 10 clientes

Mes 3+: Escalamiento
├── Automatización
├── Marketing paid
└── Expansión geográfica
```

---

## CONSEJOS FINALES

### 🎯 Enfoque Inicial

**Primeros 3 meses:**
- NO gastes en marketing paid
- Enfócate en ventas directas (1 a 1)
- Aprende de cada cliente
- Itera el producto rápido
- Construye casos de éxito

**Meta realista:** 20-30 clientes en 3 meses

---

### 💡 Ventajas Competitivas

**Lo que te diferencia:**
1. ✅ Setup incluido (competencia cobra aparte)
2. ✅ Sin contratos largos (mes a mes)
3. ✅ Soporte en español, local
4. ✅ Precio justo (competencia $30-50 USD/mes)
5. ✅ 14 días gratis sin tarjeta

---

### 🚨 Errores a Evitar

❌ Gastar mucho en ads antes de validar
❌ Hacer el producto muy complejo
❌ No hablar con clientes directamente
❌ Pricing muy bajo (devalúa el producto)
❌ No pedir feedback constantemente

---

## RECURSOS ÚTILES

### 🔗 Herramientas Recomendadas

**Gratis/Freemium:**
- Supabase (Base de datos)
- Vercel (Hosting)
- Resend (Emails)
- Canva (Diseño)
- Google Analytics
- Calendly (Agendar demos)

**De Pago:**
- Stripe ($0 + 3% fees)
- Google Workspace ($6/mes)
- Hotjar ($39/mes) - opcional
- Intercom ($74/mes) - cuando escales

---

## CONTACTO Y SOPORTE

**Para implementar esta hoja de ruta:**
- Oscar Francisco Barros Tagle
- Cognitiva SpA
- Email: cognitivaspa@gmail.com
- Teléfono: +56 9 3241 7147

---

**¡Éxito con MenusCarta! 🚀**

_Última actualización: Octubre 2025_
