/**
 * Apply Banner Colors Migration
 * Adds background_color and text_color columns to promotion_banners table
 *
 * Usage: node scripts/apply-banner-colors-migration.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqyogextlxkjsgaoskrv.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW9nZXh0bHhranNnYW9za3J2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI1NDY1MywiZXhwIjoyMDc2ODMwNjUzfQ.DHV5YwLTkDfbwv90OeFG5Z8Yaa_sXRjyG4cQYd5jkdk'

async function applyMigration() {
  console.log('🎨 Aplicando migración de colores de banner...')
  console.log('')

  try {
    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('✅ Cliente Supabase creado')
    console.log('')

    // Check current table structure
    console.log('🔍 Verificando estructura actual de promotion_banners...')

    const { data: existingBanners, error: selectError } = await supabase
      .from('promotion_banners')
      .select('*')
      .limit(1)

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError
    }

    console.log('✅ Tabla promotion_banners accesible')

    // Check if columns exist
    if (existingBanners && existingBanners.length > 0) {
      const banner = existingBanners[0]
      const hasBackgroundColor = 'background_color' in banner
      const hasTextColor = 'text_color' in banner

      if (hasBackgroundColor && hasTextColor) {
        console.log('✅ Las columnas de colores YA EXISTEN')
        console.log('')
        console.log('📊 Datos actuales:')
        console.log(`  - background_color: ${banner.background_color || 'NULL'}`)
        console.log(`  - text_color: ${banner.text_color || 'NULL'}`)
        console.log('')
        console.log('⚠️  No es necesario aplicar la migración')
        return
      }
    }

    console.log('⚠️  Las columnas de colores NO existen aún')
    console.log('')

    // Apply migration via SQL
    console.log('📝 Aplicando migración 008...')
    console.log('')
    console.log('⚠️  IMPORTANTE: Las columnas de colores deben agregarse usando SQL.')
    console.log('')
    console.log('OPCIÓN 1 - Supabase CLI (Recomendado):')
    console.log('  supabase db push')
    console.log('')
    console.log('OPCIÓN 2 - SQL Editor en Dashboard:')
    console.log('  1. Ve a: https://supabase.com/dashboard/project/eqyogextlxkjsgaoskrv')
    console.log('  2. SQL Editor')
    console.log('  3. Copia el contenido de:')
    console.log('     supabase/migrations/008_add_banner_colors.sql')
    console.log('  4. Ejecuta el SQL')
    console.log('')
    console.log('SQL a ejecutar:')
    console.log('─'.repeat(60))
    console.log(`
ALTER TABLE promotion_banners
  ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FF9500',
  ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#FFFFFF';

UPDATE promotion_banners
SET
  background_color = COALESCE(background_color, '#FF9500'),
  text_color = COALESCE(text_color, '#FFFFFF')
WHERE background_color IS NULL OR text_color IS NULL;
    `)
    console.log('─'.repeat(60))
    console.log('')

  } catch (error) {
    console.error('❌ ERROR:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Ejecutar
applyMigration().then(() => {
  console.log('✅ Proceso completado')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
