#!/usr/bin/env tsx
/**
 * Migration Script: Filesystem → Supabase
 * Migrates all restaurant data from JSON files to Supabase database
 *
 * Usage: npx tsx scripts/migrate-to-supabase.ts
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
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

const DATA_DIR = path.join(process.cwd(), 'data', 'restaurants')

// Default password for demo accounts (will be hashed)
const DEFAULT_PASSWORD = 'demo123'

interface MigrationStats {
  restaurants: number
  categories: number
  items: number
  ingredients: number
  itemIngredients: number
  unavailableIngredients: number
  scheduledDiscounts: number
  banners: number
  errors: string[]
}

async function main() {
  console.log('🚀 Starting migration from filesystem to Supabase...\n')

  const stats: MigrationStats = {
    restaurants: 0,
    categories: 0,
    items: 0,
    ingredients: 0,
    itemIngredients: 0,
    unavailableIngredients: 0,
    scheduledDiscounts: 0,
    banners: 0,
    errors: []
  }

  try {
    // Get all restaurant directories
    const restaurantDirs = fs.readdirSync(DATA_DIR).filter(dir => {
      const fullPath = path.join(DATA_DIR, dir)
      return fs.statSync(fullPath).isDirectory()
    })

    console.log(`Found ${restaurantDirs.length} restaurants to migrate:\n`)
    restaurantDirs.forEach(dir => console.log(`  - ${dir}`))
    console.log('')

    // Migrate each restaurant
    for (const slug of restaurantDirs) {
      console.log(`\n📦 Migrating restaurant: ${slug}`)
      console.log('━'.repeat(50))

      try {
        await migrateRestaurant(slug, stats)
        console.log(`✅ Restaurant ${slug} migrated successfully`)
      } catch (error) {
        const errorMsg = `Failed to migrate ${slug}: ${error}`
        console.error(`❌ ${errorMsg}`)
        stats.errors.push(errorMsg)
      }
    }

    // Print summary
    console.log('\n\n' + '═'.repeat(50))
    console.log('📊 MIGRATION SUMMARY')
    console.log('═'.repeat(50))
    console.log(`✅ Restaurants:              ${stats.restaurants}`)
    console.log(`✅ Categories:               ${stats.categories}`)
    console.log(`✅ Items:                    ${stats.items}`)
    console.log(`✅ Ingredients:              ${stats.ingredients}`)
    console.log(`✅ Item-Ingredients:         ${stats.itemIngredients}`)
    console.log(`✅ Unavailable Ingredients:  ${stats.unavailableIngredients}`)
    console.log(`✅ Scheduled Discounts:      ${stats.scheduledDiscounts}`)
    console.log(`✅ Banners:                  ${stats.banners}`)

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${stats.errors.length}`)
      stats.errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`))
    }

    console.log('\n🎉 Migration completed!')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

async function migrateRestaurant(slug: string, stats: MigrationStats) {
  const restaurantPath = path.join(DATA_DIR, slug)

  // 1. Read theme.json (restaurant info)
  const themePath = path.join(restaurantPath, 'theme.json')
  if (!fs.existsSync(themePath)) {
    throw new Error(`theme.json not found for ${slug}`)
  }

  const themeData = JSON.parse(fs.readFileSync(themePath, 'utf-8'))

  // 2. Hash password
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  // 3. Insert restaurant
  console.log('  → Inserting restaurant...')
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .insert({
      slug,
      name: themeData.restaurantName || `Restaurant ${slug}`,
      password_hash: passwordHash,
      logo_url: themeData.logoUrl || null,
      logo_style: themeData.logoStyle || 'circular',
      theme_id: themeData.themeId || 'elegant',
      currency: themeData.currency || 'CLP',
      timezone: themeData.timezone || 'America/Santiago',
      is_demo: slug.includes('restoran'),
      subscription_plan: 'free',
      subscription_status: 'active'
    })
    .select()
    .single()

  if (restaurantError) throw restaurantError
  stats.restaurants++

  const restaurantId = restaurant.id
  console.log(`  ✓ Restaurant created: ${restaurantId}`)

  // 4. Migrate categories
  const categoriesPath = path.join(restaurantPath, 'categories.json')
  if (fs.existsSync(categoriesPath)) {
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
    console.log(`  → Inserting ${categoriesData.length} categories...`)

    for (const cat of categoriesData) {
      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          restaurant_id: restaurantId,
          name: cat.name,
          description: cat.description || null,
          icon: cat.icon || null,
          sort_order: cat.order || 0,
          is_visible: cat.is_visible !== false
        })
        .select()
        .single()

      if (error) {
        stats.errors.push(`Category ${cat.name}: ${error.message}`)
      } else {
        stats.categories++
        // Store mapping for items migration
        cat._supabase_id = category.id
      }
    }
    console.log(`  ✓ Categories inserted: ${stats.categories}`)
  }

  // 5. Migrate items
  const itemsPath = path.join(restaurantPath, 'items.json')
  if (fs.existsSync(itemsPath)) {
    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'))
    console.log(`  → Inserting ${itemsData.length} items...`)

    // Create mapping: filesystem category_id → supabase category_id
    const categoriesData = fs.existsSync(categoriesPath)
      ? JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
      : []

    const { data: dbCategories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('restaurant_id', restaurantId)

    // Map: filesystem_category_id → supabase_category_id
    const categoryIdMap = new Map<string, string>()
    for (const cat of categoriesData) {
      const dbCat = dbCategories?.find(c => c.name === cat.name)
      if (dbCat) {
        categoryIdMap.set(cat.id, dbCat.id)
      }
    }

    for (const item of itemsData) {
      const categoryId = categoryIdMap.get(item.category_id)
      if (!categoryId) {
        stats.errors.push(`Item ${item.name}: category_id '${item.category_id}' not found`)
        continue
      }

      const { data: menuItem, error } = await supabase
        .from('items')
        .insert({
          restaurant_id: restaurantId,
          category_id: categoryId,
          name: item.name,
          description: item.description || null,
          base_price: parseFloat(item.price) || 0,
          discount_percentage: item.discount_percentage || 0,
          image_url: item.image_url || item.image || null,
          sort_order: item.position || item.order || 0,
          is_available: item.is_available !== false,
          is_promotion: item.is_promotion || false,
          calories: item.calories || null,
          preparation_time: item.preparation_time || null,
          spicy_level: item.spicy_level || 0,
          is_vegetarian: item.is_vegetarian || false,
          is_vegan: item.is_vegan || false,
          is_gluten_free: item.is_gluten_free || false,
          allergens: item.allergens || null
        })
        .select()
        .single()

      if (error) {
        stats.errors.push(`Item ${item.name}: ${error.message}`)
      } else {
        stats.items++
        // Store for ingredients mapping
        item._supabase_id = menuItem.id
      }
    }
    console.log(`  ✓ Items inserted: ${stats.items}`)
  }

  // 6. Migrate ingredients
  const ingredientsPath = path.join(restaurantPath, 'ingredients.json')
  if (fs.existsSync(ingredientsPath)) {
    const ingredientsFile = JSON.parse(fs.readFileSync(ingredientsPath, 'utf-8'))

    // Handle both formats: array or object with ingredients property
    const ingredientsList = Array.isArray(ingredientsFile)
      ? ingredientsFile
      : (ingredientsFile.ingredients || [])

    console.log(`  → Inserting ${ingredientsList.length} ingredients...`)

    for (const ing of ingredientsList) {
      if (!ing.name || !ing.category) continue

      const { error } = await supabase
        .from('ingredients')
        .insert({
          restaurant_id: restaurantId,
          category: ing.category,
          name: ing.name,
          is_allergen: ing.isCommonAllergen || ing.is_allergen || false
        })

      if (error && !error.message.includes('duplicate')) {
        stats.errors.push(`Ingredient ${ing.name}: ${error.message}`)
      } else if (!error) {
        stats.ingredients++
      }
    }
    console.log(`  ✓ Ingredients inserted: ${stats.ingredients}`)
  }

  // 7. Migrate unavailable ingredients
  const unavailablePath = path.join(restaurantPath, 'unavailable-ingredients.json')
  if (fs.existsSync(unavailablePath)) {
    const unavailableFile = JSON.parse(fs.readFileSync(unavailablePath, 'utf-8'))

    // Handle format: { ingredient_ids: [...], updated_at: ... }
    const ingredientIds = unavailableFile.ingredient_ids || unavailableFile || []

    console.log(`  → Inserting ${ingredientIds.length} unavailable ingredients...`)

    if (ingredientIds.length > 0) {
      // Get ingredient IDs from filesystem
      const ingredientsFile = fs.existsSync(ingredientsPath)
        ? JSON.parse(fs.readFileSync(ingredientsPath, 'utf-8'))
        : null

      const ingredientsList = ingredientsFile?.ingredients || []

      // Get DB ingredients
      const { data: dbIngredients } = await supabase
        .from('ingredients')
        .select('id, name, category')
        .eq('restaurant_id', restaurantId)

      for (const ingredientId of ingredientIds) {
        // Find ingredient in filesystem data
        const fsIngredient = ingredientsList.find((i: any) => i.id === ingredientId)
        if (!fsIngredient) continue

        // Find corresponding DB ingredient
        const dbIngredient = dbIngredients?.find(
          ing => ing.name === fsIngredient.name && ing.category === fsIngredient.category
        )

        if (dbIngredient) {
          const { error } = await supabase
            .from('unavailable_ingredients')
            .insert({
              restaurant_id: restaurantId,
              ingredient_id: dbIngredient.id,
              reason: null
            })

          if (error && !error.message.includes('duplicate')) {
            stats.errors.push(`Unavailable ${fsIngredient.name}: ${error.message}`)
          } else if (!error) {
            stats.unavailableIngredients++
          }
        }
      }
    }
    console.log(`  ✓ Unavailable ingredients inserted: ${stats.unavailableIngredients}`)
  }

  // 8. Migrate scheduled discounts
  const discountsPath = path.join(restaurantPath, 'scheduled-discounts.json')
  if (fs.existsSync(discountsPath)) {
    const discountsFile = JSON.parse(fs.readFileSync(discountsPath, 'utf-8'))

    // Handle format: { discounts: [...], updated_at: ... }
    const discountsList = discountsFile.discounts || discountsFile || []

    console.log(`  → Inserting ${discountsList.length} scheduled discounts...`)

    if (discountsList.length > 0) {
      // Create category ID mapping
      const categoriesData = fs.existsSync(categoriesPath)
        ? JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
        : []

      const { data: dbCategories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('restaurant_id', restaurantId)

      const categoryIdMap = new Map<string, string>()
      for (const cat of categoriesData) {
        const dbCat = dbCategories?.find(c => c.name === cat.name)
        if (dbCat) {
          categoryIdMap.set(cat.id, dbCat.id)
        }
      }

      for (const discount of discountsList) {
        const categoryId = categoryIdMap.get(discount.category_id)
        if (!categoryId) {
          stats.errors.push(`Discount ${discount.name}: category_id '${discount.category_id}' not found`)
          continue
        }

        const { error } = await supabase
          .from('scheduled_discounts')
          .insert({
            restaurant_id: restaurantId,
            category_id: categoryId,
            name: discount.name,
            discount_percentage: discount.discount_percentage,
            start_time: discount.start_time,
            end_time: discount.end_time,
            days_of_week: discount.days_of_week,
            is_active: discount.is_active !== false
          })

        if (error) {
          stats.errors.push(`Discount ${discount.name}: ${error.message}`)
        } else {
          stats.scheduledDiscounts++
        }
      }
    }
    console.log(`  ✓ Scheduled discounts inserted: ${stats.scheduledDiscounts}`)
  }

  // 9. Migrate banner
  const bannerPath = path.join(restaurantPath, 'banner.json')
  if (fs.existsSync(bannerPath)) {
    const bannerData = JSON.parse(fs.readFileSync(bannerPath, 'utf-8'))
    console.log(`  → Inserting banner...`)

    const { error } = await supabase
      .from('promotion_banners')
      .insert({
        restaurant_id: restaurantId,
        title: bannerData.title || '',
        subtitle: bannerData.subtitle || null,
        is_visible: bannerData.is_visible || false
      })

    if (error) {
      stats.errors.push(`Banner: ${error.message}`)
    } else {
      stats.banners++
      console.log(`  ✓ Banner inserted`)
    }
  }
}

// Run migration
main()
