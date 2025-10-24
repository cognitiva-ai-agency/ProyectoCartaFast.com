require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

async function checkCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found in .env.local')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 Checking credentials for restoran1...\n')

  const { data, error } = await supabase
    .from('restaurants')
    .select('slug, name, password_hash')
    .eq('slug', 'restoran1')
    .single()

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  console.log('✅ Restaurant found:')
  console.log('   Slug:', data.slug)
  console.log('   Name:', data.name)
  console.log('   Password hash:', data.password_hash.substring(0, 20) + '...')

  console.log('\n🔐 Testing passwords:')

  // Test demo123
  const isDemo123Valid = await bcrypt.compare('demo123', data.password_hash)
  console.log('   "demo123":', isDemo123Valid ? '✅ VALID' : '❌ Invalid')

  // Test 123456
  const is123456Valid = await bcrypt.compare('123456', data.password_hash)
  console.log('   "123456":', is123456Valid ? '✅ VALID' : '❌ Invalid')

  console.log('\n💡 Use the VALID password to login at: http://localhost:3000/')
}

checkCredentials()
