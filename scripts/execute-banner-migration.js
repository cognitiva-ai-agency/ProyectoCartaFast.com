/**
 * Execute Banner Colors Migration Directly
 * Uses pg library to execute raw SQL
 *
 * Usage: node scripts/execute-banner-migration.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqyogextlxkjsgaoskrv.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW9nZXh0bHhranNnYW9za3J2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI1NDY1MywiZXhwIjoyMDc2ODMwNjUzfQ.DHV5YwLTkDfbwv90OeFG5Z8Yaa_sXRjyG4cQYd5jkdk'

// PostgreSQL connection string
const DB_URL = 'postgresql://postgres:123456789@db.eqyogextlxkjsgaoskrv.supabase.co:5432/postgres'

async function executeMigration() {
  console.log('🎨 Ejecutando migración 008: Banner Colors...')
  console.log('')

  try {
    const { Client } = require('pg')

    // Create PostgreSQL client
    const client = new Client({
      connectionString: DB_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })

    console.log('📡 Conectando a PostgreSQL...')
    await client.connect()
    console.log('✅ Conectado a Supabase PostgreSQL')
    console.log('')

    // Execute migration SQL
    console.log('⚙️  Ejecutando ALTER TABLE...')

    const sql = `
      ALTER TABLE promotion_banners
        ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FF9500',
        ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#FFFFFF';
    `

    await client.query(sql)
    console.log('✅ Columnas agregadas exitosamente')
    console.log('')

    // Update existing banners with default colors
    console.log('⚙️  Actualizando banners existentes con colores por defecto...')

    const updateSql = `
      UPDATE promotion_banners
      SET
        background_color = COALESCE(background_color, '#FF9500'),
        text_color = COALESCE(text_color, '#FFFFFF')
      WHERE background_color IS NULL OR text_color IS NULL;
    `

    const result = await client.query(updateSql)
    console.log(`✅ ${result.rowCount} banners actualizados`)
    console.log('')

    // Verify migration
    console.log('🔍 Verificando migración...')

    const verifyQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'promotion_banners'
        AND column_name IN ('background_color', 'text_color')
      ORDER BY column_name;
    `

    const verifyResult = await client.query(verifyQuery)

    console.log('📊 Columnas creadas:')
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`)
    })
    console.log('')

    // Close connection
    await client.end()

    console.log('========================================')
    console.log('✅ MIGRACIÓN COMPLETADA')
    console.log('========================================')
    console.log('')
    console.log('📝 Próximos pasos:')
    console.log('  1. Las columnas background_color y text_color están listas')
    console.log('  2. La API ahora puede guardar y leer colores personalizados')
    console.log('  3. Prueba cambiando los colores en el dashboard')
    console.log('')

  } catch (error) {
    console.error('❌ ERROR:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Ejecutar
executeMigration().then(() => {
  console.log('✅ Script completado')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
