/**
 * Setup Supabase Storage Bucket
 * Creates the 'restaurant-images' bucket and configures access policies
 *
 * Usage: node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqyogextlxkjsgaoskrv.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeW9nZXh0bHhranNnYW9za3J2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI1NDY1MywiZXhwIjoyMDc2ODMwNjUzfQ.DHV5YwLTkDfbwv90OeFG5Z8Yaa_sXRjyG4cQYd5jkdk'

const BUCKET_NAME = 'restaurant-images'

async function setupStorage() {
  console.log('🗄️  Configurando Supabase Storage...')
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

    // Check if bucket exists
    console.log(`🔍 Verificando si el bucket '${BUCKET_NAME}' existe...`)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ Error al listar buckets:', listError)
      throw listError
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME)

    if (bucketExists) {
      console.log(`✅ El bucket '${BUCKET_NAME}' ya existe`)
      console.log('')

      // Get bucket details
      const bucket = buckets.find(b => b.name === BUCKET_NAME)
      console.log('📊 Detalles del bucket:')
      console.log(`  - Nombre: ${bucket.name}`)
      console.log(`  - Público: ${bucket.public ? 'SÍ' : 'NO'}`)
      console.log(`  - Tamaño de archivos: ${bucket.file_size_limit ? bucket.file_size_limit + ' bytes' : 'Sin límite'}`)
      console.log('')
    } else {
      console.log(`📦 Creando bucket '${BUCKET_NAME}'...`)

      // Create bucket with public access
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Allow public read access
        fileSizeLimit: 5242880, // 5 MB limit
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
      })

      if (createError) {
        console.error('❌ Error al crear bucket:', createError)
        throw createError
      }

      console.log(`✅ Bucket '${BUCKET_NAME}' creado exitosamente`)
      console.log('')
      console.log('📊 Configuración del bucket:')
      console.log('  - Acceso: Público (lectura)')
      console.log('  - Tamaño máximo: 5 MB por archivo')
      console.log('  - Formatos: PNG, JPEG, JPG, WEBP, GIF')
      console.log('')
    }

    // Test upload
    console.log('🧪 Probando subida de imagen de prueba...')
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const base64Data = testImageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const testPath = 'test/test-image.png'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testPath, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Error al subir imagen de prueba:', uploadError)
      console.log('')
      console.log('⚠️  ATENCIÓN: Puede que necesites configurar políticas de Storage en Supabase.')
      console.log('   Ve a: Dashboard > Storage > Policies')
      console.log('')
    } else {
      console.log('✅ Imagen de prueba subida exitosamente')

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(testPath)

      console.log(`📸 URL pública: ${publicUrl}`)
      console.log('')

      // Clean up test image
      await supabase.storage.from(BUCKET_NAME).remove([testPath])
      console.log('🧹 Imagen de prueba eliminada')
      console.log('')
    }

    console.log('========================================')
    console.log('✅ CONFIGURACIÓN COMPLETADA')
    console.log('========================================')
    console.log('')
    console.log('📝 Próximos pasos:')
    console.log('  1. Ve al Dashboard de Supabase')
    console.log('  2. Storage > restaurant-images > Policies')
    console.log('  3. Asegúrate de tener estas políticas:')
    console.log('')
    console.log('     a) SELECT (lectura pública):')
    console.log('        - Nombre: "Public read access"')
    console.log('        - Operación: SELECT')
    console.log('        - Policy: true')
    console.log('')
    console.log('     b) INSERT (escritura autenticada):')
    console.log('        - Nombre: "Authenticated users can upload"')
    console.log('        - Operación: INSERT')
    console.log('        - Policy: (auth.role() = \'authenticated\')')
    console.log('')
    console.log('     c) UPDATE (actualización autenticada):')
    console.log('        - Nombre: "Authenticated users can update"')
    console.log('        - Operación: UPDATE')
    console.log('        - Policy: (auth.role() = \'authenticated\')')
    console.log('')
    console.log('     d) DELETE (eliminación autenticada):')
    console.log('        - Nombre: "Authenticated users can delete"')
    console.log('        - Operación: DELETE')
    console.log('        - Policy: (auth.role() = \'authenticated\')')
    console.log('')

  } catch (error) {
    console.error('❌ ERROR FATAL:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Ejecutar setup
setupStorage().then(() => {
  console.log('✅ Setup completado')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error en setup:', err)
  process.exit(1)
})
