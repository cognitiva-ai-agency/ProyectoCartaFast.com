/**
 * Script para verificar qué restaurantes existen en Supabase
 *
 * Uso:
 *   node scripts/check-credentials.js
 *
 * Muestra:
 *   - Lista de restaurantes en Supabase
 *   - Slug, nombre, estado de suscripción
 *   - Fecha de creación
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function checkCredentials() {
  // Verificar variables de entorno
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('\n❌ Error: Variables de entorno no configuradas\n', 'red')
    log('Asegúrate de tener en .env.local:', 'yellow')
    log('  - NEXT_PUBLIC_SUPABASE_URL', 'gray')
    log('  - SUPABASE_SERVICE_ROLE_KEY\n', 'gray')
    process.exit(1)
  }

  log('\n🔐 Verificando credenciales en Supabase...\n', 'blue')

  try {
    // Crear cliente de Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Obtener lista de restaurantes
    const { data, error } = await supabase
      .from('restaurants')
      .select('slug, name, subscription_status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      log(`❌ Error al consultar Supabase: ${error.message}\n`, 'red')
      process.exit(1)
    }

    if (!data || data.length === 0) {
      log('⚠️  No hay restaurantes registrados en Supabase\n', 'yellow')
      log('Para agregar restaurantes, consulta: GUIA_RESTAURANTES_Y_CREDENCIALES.md\n', 'gray')
      return
    }

    log(`✅ Encontrados ${data.length} restaurante(s) en Supabase:\n`, 'green')

    // Tabla de restaurantes
    console.log('┌────────────────────┬──────────────────────────┬──────────────┬─────────────────────┐')
    console.log('│ Slug               │ Nombre                   │ Estado       │ Creado              │')
    console.log('├────────────────────┼──────────────────────────┼──────────────┼─────────────────────┤')

    data.forEach(r => {
      const slug = r.slug.padEnd(18)
      const name = (r.name || '').substring(0, 24).padEnd(24)
      const status = (r.subscription_status || 'active').padEnd(12)
      const date = new Date(r.created_at).toLocaleDateString('es-CL')

      console.log(`│ ${slug} │ ${name} │ ${status} │ ${date.padEnd(19)} │`)
    })

    console.log('└────────────────────┴──────────────────────────┴──────────────┴─────────────────────┘\n')

    log('📋 URLs de acceso:\n', 'blue')
    data.forEach(r => {
      log(`  • Menú público: https://tu-app.vercel.app/${r.slug}`, 'gray')
      log(`    Dashboard: https://tu-app.vercel.app/dashboard/${r.slug}`, 'gray')
      log(`    Login con slug: "${r.slug}"\n`, 'gray')
    })

    log('⚠️  Nota: Las contraseñas están hasheadas y NO se pueden ver directamente', 'yellow')
    log('Para más información, consulta: GUIA_RESTAURANTES_Y_CREDENCIALES.md\n', 'gray')

  } catch (err) {
    log(`\n❌ Error inesperado: ${err.message}\n`, 'red')
    if (err.stack) {
      log(err.stack, 'gray')
    }
    process.exit(1)
  }
}

// Ejecutar
checkCredentials()
