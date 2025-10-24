/**
 * Script para crear un nuevo restaurante en el sistema filesystem
 *
 * Uso:
 *   node scripts/create-restaurant.js <slug> <password> [nombre]
 *
 * Ejemplo:
 *   node scripts/create-restaurant.js restoran3 abc123 "La Pizzería"
 *
 * Esto creará:
 *   - data/restaurants/restoran3/
 *   - Todos los archivos JSON necesarios
 *   - auth.json con la contraseña especificada
 */

const fs = require('fs')
const path = require('path')

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Obtener argumentos
const args = process.argv.slice(2)

if (args.length < 2) {
  log('\n❌ Error: Faltan argumentos\n', 'red')
  log('Uso: node scripts/create-restaurant.js <slug> <password> [nombre]\n', 'yellow')
  log('Ejemplo:', 'blue')
  log('  node scripts/create-restaurant.js restoran3 abc123 "La Pizzería"\n', 'yellow')
  process.exit(1)
}

const slug = args[0]
const password = args[1]
const restaurantName = args[2] || 'Mi Restaurante'

// Validar slug
if (!/^[a-z0-9-_]+$/.test(slug)) {
  log('\n❌ Error: El slug solo puede contener letras minúsculas, números, guiones y guiones bajos\n', 'red')
  process.exit(1)
}

// Rutas
const restaurantsDir = path.join(process.cwd(), 'data', 'restaurants')
const restaurantDir = path.join(restaurantsDir, slug)
const imagesDir = path.join(restaurantDir, 'images')

// Verificar si ya existe
if (fs.existsSync(restaurantDir)) {
  log(`\n❌ Error: El restaurante "${slug}" ya existe\n`, 'red')
  process.exit(1)
}

log('\n🍽️  Creando nuevo restaurante...\n', 'blue')
log(`   Slug: ${slug}`, 'yellow')
log(`   Contraseña: ${password}`, 'yellow')
log(`   Nombre: ${restaurantName}\n`, 'yellow')

try {
  // Crear directorios
  log('📁 Creando directorios...', 'blue')
  fs.mkdirSync(restaurantDir, { recursive: true })
  fs.mkdirSync(imagesDir, { recursive: true })
  log('   ✓ Directorios creados', 'green')

  // Crear auth.json
  log('\n🔐 Configurando autenticación...', 'blue')
  const authData = {
    password: password,
    created_at: new Date().toISOString()
  }
  fs.writeFileSync(
    path.join(restaurantDir, 'auth.json'),
    JSON.stringify(authData, null, 2)
  )
  log('   ✓ auth.json creado', 'green')

  // Crear theme.json
  log('\n🎨 Configurando tema...', 'blue')
  const themeData = {
    themeId: 'demo-theme-warm',
    currency: 'CLP',
    restaurantName: restaurantName,
    logoUrl: '',
    logoStyle: 'circular',
    timezone: 'America/Santiago',
    updated_at: new Date().toISOString()
  }
  fs.writeFileSync(
    path.join(restaurantDir, 'theme.json'),
    JSON.stringify(themeData, null, 2)
  )
  log('   ✓ theme.json creado', 'green')

  // Crear archivos vacíos
  log('\n📄 Creando archivos de datos...', 'blue')

  const emptyFiles = {
    'categories.json': [],
    'items.json': [],
    'custom-ingredients.json': [],
    'ingredients.json': [],
    'scheduled-discounts.json': [],
    'unavailable-ingredients.json': []
  }

  for (const [filename, content] of Object.entries(emptyFiles)) {
    fs.writeFileSync(
      path.join(restaurantDir, filename),
      JSON.stringify(content, null, 2)
    )
    log(`   ✓ ${filename} creado`, 'green')
  }

  // Crear menu.json
  const menuData = { categories: [] }
  fs.writeFileSync(
    path.join(restaurantDir, 'menu.json'),
    JSON.stringify(menuData, null, 2)
  )
  log('   ✓ menu.json creado', 'green')

  // Crear banner.json
  const bannerData = {
    enabled: false,
    title: '',
    message: '',
    variant: 'info',
    updated_at: new Date().toISOString()
  }
  fs.writeFileSync(
    path.join(restaurantDir, 'banner.json'),
    JSON.stringify(bannerData, null, 2)
  )
  log('   ✓ banner.json creado', 'green')

  // Resumen final
  log('\n✅ ¡Restaurante creado exitosamente!\n', 'green')
  log('📋 Información de acceso:', 'blue')
  log(`   URL: http://localhost:3000/${slug}`, 'yellow')
  log(`   Login: http://localhost:3000/clientes`, 'yellow')
  log(`   Dashboard: http://localhost:3000/dashboard/${slug}`, 'yellow')
  log(`   Slug: ${slug}`, 'yellow')
  log(`   Contraseña: ${password}\n`, 'yellow')

  log('📁 Archivos creados en:', 'blue')
  log(`   ${restaurantDir}\n`, 'yellow')

} catch (error) {
  log(`\n❌ Error al crear restaurante: ${error.message}\n`, 'red')

  // Limpiar en caso de error
  if (fs.existsSync(restaurantDir)) {
    fs.rmSync(restaurantDir, { recursive: true, force: true })
    log('🧹 Limpieza realizada\n', 'yellow')
  }

  process.exit(1)
}
