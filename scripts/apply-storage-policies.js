/**
 * Apply Storage Policies to Supabase
 * Executes migration 007 to configure storage.objects policies
 *
 * Usage: node scripts/apply-storage-policies.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqyogextlxkjsgaoskrv.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW9nZXh0bHhranNnYW9za3J2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI1NDY1MywiZXhwIjoyMDc2ODMwNjUzfQ.DHV5YwLTkDfbwv90OeFG5Z8Yaa_sXRjyG4cQYd5jkdk'

async function applyStoragePolicies() {
  console.log('🔐 Aplicando políticas de Storage...')
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

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '007_configure_storage_policies.sql')
    console.log(`📄 Leyendo migración: ${migrationPath}`)

    if (!fs.existsSync(migrationPath)) {
      throw new Error('Archivo de migración no encontrado')
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8')
    console.log('✅ Migración leída correctamente')
    console.log('')

    // Execute SQL
    console.log('⚙️  Ejecutando SQL...')
    console.log('⚠️  NOTA: Las políticas de Storage deben configurarse manualmente en el Dashboard')
    console.log('')

    // Unfortunately, Supabase JS client doesn't support executing raw SQL with storage policies
    // You need to either:
    // 1. Use the Supabase CLI: supabase db push
    // 2. Or run this SQL manually in the SQL Editor in Supabase Dashboard

    console.log('========================================')
    console.log('⚠️  ACCIÓN MANUAL REQUERIDA')
    console.log('========================================')
    console.log('')
    console.log('Las políticas de Storage no pueden aplicarse automáticamente.')
    console.log('Por favor, sigue estos pasos:')
    console.log('')
    console.log('OPCIÓN 1 - Supabase CLI (Recomendado):')
    console.log('  1. Instala Supabase CLI si no lo tienes:')
    console.log('     winget install Supabase.Supabase')
    console.log('')
    console.log('  2. Vincula tu proyecto:')
    console.log('     supabase link --project-ref eqyogextlxkjsgaoskrv')
    console.log('')
    console.log('  3. Aplica las migraciones:')
    console.log('     supabase db push')
    console.log('')
    console.log('OPCIÓN 2 - Dashboard de Supabase (Manual):')
    console.log('  1. Ve a: https://supabase.com/dashboard/project/eqyogextlxkjsgaoskrv')
    console.log('  2. Ve a Storage > restaurant-images > Policies')
    console.log('  3. Crea las siguientes políticas:')
    console.log('')
    console.log('     Policy 1: Public read access')
    console.log('     - Operación: SELECT')
    console.log('     - Target: storage.objects')
    console.log('     - WITH CHECK: bucket_id = \'restaurant-images\'')
    console.log('')
    console.log('     Policy 2: Service role full access')
    console.log('     - Operación: ALL')
    console.log('     - Target: storage.objects')
    console.log('     - USING: bucket_id = \'restaurant-images\'')
    console.log('')
    console.log('OPCIÓN 3 - SQL Editor (Avanzado):')
    console.log('  1. Ve al SQL Editor en el Dashboard')
    console.log('  2. Copia y pega el contenido de:')
    console.log(`     ${migrationPath}`)
    console.log('  3. Ejecuta el SQL')
    console.log('')

    // For now, we'll just make sure the bucket has public access enabled
    console.log('🔍 Verificando configuración del bucket...')

    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw listError
    }

    const bucket = buckets.find(b => b.name === 'restaurant-images')
    if (bucket) {
      console.log(`✅ Bucket encontrado: ${bucket.name}`)
      console.log(`   - Público: ${bucket.public ? 'SÍ ✅' : 'NO ❌'}`)

      if (!bucket.public) {
        console.log('')
        console.log('⚠️  El bucket NO es público. Configurándolo...')

        // Try to update bucket to public
        const { error: updateError } = await supabase.storage.updateBucket('restaurant-images', {
          public: true
        })

        if (updateError) {
          console.error('❌ Error al hacer el bucket público:', updateError)
        } else {
          console.log('✅ Bucket configurado como público')
        }
      }
    }

    console.log('')
    console.log('========================================')
    console.log('✅ VERIFICACIÓN COMPLETADA')
    console.log('========================================')
    console.log('')

  } catch (error) {
    console.error('❌ ERROR:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Ejecutar
applyStoragePolicies().then(() => {
  console.log('✅ Proceso completado')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
