# Configuración de Supabase para MenusCarta.com

## Archivos SQL

Este directorio contiene los scripts SQL necesarios para configurar la base de datos en Supabase:

1. **schema.sql** - Estructura de tablas, índices y triggers
2. **rls-policies.sql** - Políticas de seguridad Row Level Security

## Pasos de Ejecución

### Paso 1: Ejecutar schema.sql

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral, haz clic en **SQL Editor** (ícono de consola)
3. Haz clic en el botón **+ New Query**
4. Copia TODO el contenido de `schema.sql` y pégalo en el editor
5. Haz clic en **Run** (botón verde en la parte inferior derecha)
6. Deberías ver: "Success. No rows returned"

### Paso 2: Ejecutar rls-policies.sql

1. En el mismo **SQL Editor**, haz clic en **+ New Query** nuevamente
2. Copia TODO el contenido de `rls-policies.sql` y pégalo
3. Haz clic en **Run**
4. Deberías ver: "Success. No rows returned"

### Paso 3: Verificar las Tablas

1. En el menú lateral, haz clic en **Table Editor**
2. Deberías ver estas tablas:
   - restaurants
   - categories
   - items
   - ingredients
   - item_ingredients
   - unavailable_ingredients
   - scheduled_discounts
   - promotion_banners

## Estructura de Datos

### restaurants
- Información de cada restaurante
- Configuración de tema, moneda, zona horaria
- Gestión de suscripciones

### categories
- Categorías del menú
- Ordenamiento personalizable
- Visibilidad on/off

### items
- Platos del menú
- Precios base y con descuento
- Información nutricional y alergenos
- Estados: disponible, promoción, vegetariano, vegano, etc.

### ingredients
- Biblioteca de ingredientes por restaurante
- Categorización
- Marcado de alergenos

### item_ingredients
- Relación many-to-many entre platos e ingredientes
- Ingredientes opcionales

### unavailable_ingredients
- Ingredientes temporalmente no disponibles
- Afecta automáticamente a los platos

### scheduled_discounts
- Descuentos programados por horario
- Aplicación automática por días de la semana
- Porcentaje de descuento configurable

### promotion_banners
- Banners promocionales en el menú público
- Título y subtítulo personalizables

## Seguridad (RLS)

Las políticas de Row Level Security garantizan:

- ✅ Cualquier usuario puede VER menús públicos (anon)
- ✅ Solo dueños autenticados pueden EDITAR su restaurante
- ✅ Aislamiento total de datos entre restaurantes
- ✅ Service role tiene acceso completo (para APIs backend)

## Próximos Pasos

Después de ejecutar estos scripts:

1. Instalar dependencias de Supabase en el proyecto
2. Configurar variables de entorno
3. Crear utilidades de conexión
4. Migrar datos existentes
