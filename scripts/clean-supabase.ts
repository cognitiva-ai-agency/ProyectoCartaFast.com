#!/usr/bin/env tsx
/**
 * Clean Supabase Database
 * Removes all data from all tables (for testing migration)
 *
 * Usage: npx tsx scripts/clean-supabase.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/types'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Supabase Admin Client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function main() {
  console.log('🧹 Cleaning Supabase database...\n')

  try {
    // Delete in reverse order of dependencies
    console.log('  → Deleting promotion_banners...')
    const { error: bannerError } = await supabase
      .from('promotion_banners')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (bannerError) console.error('    ❌ Error:', bannerError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting scheduled_discounts...')
    const { error: discountError } = await supabase
      .from('scheduled_discounts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (discountError) console.error('    ❌ Error:', discountError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting unavailable_ingredients...')
    const { error: unavailError } = await supabase
      .from('unavailable_ingredients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (unavailError) console.error('    ❌ Error:', unavailError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting item_ingredients...')
    const { error: itemIngError } = await supabase
      .from('item_ingredients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (itemIngError) console.error('    ❌ Error:', itemIngError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting items...')
    const { error: itemsError } = await supabase
      .from('items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (itemsError) console.error('    ❌ Error:', itemsError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting ingredients...')
    const { error: ingError } = await supabase
      .from('ingredients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (ingError) console.error('    ❌ Error:', ingError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting categories...')
    const { error: catError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (catError) console.error('    ❌ Error:', catError.message)
    else console.log('    ✓ Deleted')

    console.log('  → Deleting restaurants...')
    const { error: restError } = await supabase
      .from('restaurants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (restError) console.error('    ❌ Error:', restError.message)
    else console.log('    ✓ Deleted')

    console.log('\n✅ Database cleaned successfully!')

  } catch (error) {
    console.error('💥 Cleaning failed:', error)
    process.exit(1)
  }
}

// Run cleanup
main()
