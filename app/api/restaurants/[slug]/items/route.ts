import { NextRequest, NextResponse } from 'next/server'
import { saveRestaurantImage, deleteRestaurantImage } from '@/lib/filesystem'
import { createAdminClient } from '@/lib/supabase/admin'
import type { MenuItem } from '@/lib/supabase/types'

/**
 * GET /api/restaurants/[slug]/items
 * Get all menu items for a restaurant
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug

    const supabase = createAdminClient()

    // Get restaurant ID
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Get all items for this restaurant
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })

    if (itemsError) {
      console.error('Error getting items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      )
    }

    // Get ingredients for all items
    const itemIds = (items || []).map(item => item.id)
    let itemIngredientsMap = new Map<string, string[]>()

    if (itemIds.length > 0) {
      const { data: itemIngredients } = await supabase
        .from('item_ingredients')
        .select('item_id, ingredient_id')
        .in('item_id', itemIds)

      // Group ingredients by item_id
      if (itemIngredients) {
        itemIngredients.forEach(rel => {
          if (!itemIngredientsMap.has(rel.item_id)) {
            itemIngredientsMap.set(rel.item_id, [])
          }
          itemIngredientsMap.get(rel.item_id)!.push(rel.ingredient_id)
        })
      }
    }

    // Transform Supabase data to match frontend MenuItem type
    const transformedItems = (items || []).map(item => ({
      ...item,
      position: item.sort_order, // Map sort_order to position for compatibility
      price: item.base_price, // Legacy field for backward compatibility
      ingredients: itemIngredientsMap.get(item.id) || [] // Include ingredients
    }))

    return NextResponse.json(transformedItems)
  } catch (err) {
    console.error('Error getting items:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/items
 * Create or update all menu items for a restaurant
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const data = await request.json()

    // Ensure data is an array
    const items = Array.isArray(data) ? data : [data]

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get restaurant ID
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Get existing items to compare images
    const { data: existingItems } = await supabase
      .from('items')
      .select('id, image_url')
      .eq('restaurant_id', restaurant.id)

    const existingItemsMap = new Map(existingItems?.map(item => [item.id, item]) || [])

    // Process images - convert base64 to files and handle updates
    const processedItems = await Promise.all(items.map(async (item: any) => {
      const existingItem = existingItemsMap.get(item.id)
      let imageUrl = item.image_url

      // If there's a new base64 image
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        // Delete old image if it exists and is different
        if (existingItem?.image_url && existingItem.image_url !== imageUrl) {
          await deleteRestaurantImage(slug, existingItem.image_url)
        }

        // Save new image
        imageUrl = await saveRestaurantImage(slug, item.id, imageUrl) || imageUrl
      }
      // If image was removed (empty string or undefined)
      else if (existingItem?.image_url && (!imageUrl || imageUrl === '')) {
        await deleteRestaurantImage(slug, existingItem.image_url)
        imageUrl = null
      }

      return { ...item, image_url: imageUrl }
    }))

    // DEDUPLICATION: Remove duplicate items based on name + category_id
    // This prevents accidental duplication from multiple saves or client-side issues
    const deduplicatedItems: any[] = []
    const seen = new Set<string>()

    for (const item of processedItems) {
      const key = `${item.category_id}::${item.name?.trim().toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        deduplicatedItems.push(item)
      } else {
        console.warn(`⚠️ Duplicate item detected and removed: "${item.name}" in category ${item.category_id}`)
      }
    }

    console.log(`📊 Items received: ${processedItems.length}, After deduplication: ${deduplicatedItems.length}`)

    // Delete all existing items for this restaurant
    await supabase
      .from('items')
      .delete()
      .eq('restaurant_id', restaurant.id)

    // Insert deduplicated items
    const itemsToInsert = deduplicatedItems.map((item: any, index: number) => {
      const basePrice = parseFloat(item.price || item.base_price) || 0

      console.log(`📦 Processing item "${item.name}":`, {
        rawPrice: item.price,
        rawBasePrice: item.base_price,
        parsedBasePrice: basePrice,
        category_id: item.category_id
      })

      return {
        restaurant_id: restaurant.id,
        category_id: item.category_id,
        name: item.name,
        description: item.description || null,
        base_price: basePrice,
        discount_percentage: item.discount_percentage || 0,
        image_url: item.image_url || null,
        sort_order: item.position || item.order || item.sort_order || index,
        is_available: item.is_available !== false,
        is_promotion: item.is_promotion || false,
        calories: item.calories || null,
        preparation_time: item.preparation_time || null,
        spicy_level: item.spicy_level || 0,
        is_vegetarian: item.is_vegetarian || false,
        is_vegan: item.is_vegan || false,
        is_gluten_free: item.is_gluten_free || false,
        allergens: item.allergens || null
      }
    })

    const { data: insertedItems, error: insertError } = await supabase
      .from('items')
      .insert(itemsToInsert)
      .select()

    if (insertError) {
      console.error('Error saving items:', insertError)
      return NextResponse.json(
        { error: 'Failed to save items' },
        { status: 500 }
      )
    }

    // Save ingredient relationships
    if (insertedItems && insertedItems.length > 0) {
      const itemIngredientsToInsert: any[] = []

      deduplicatedItems.forEach((item: any, index: number) => {
        const insertedItem = insertedItems[index]
        if (insertedItem && item.ingredients && Array.isArray(item.ingredients)) {
          item.ingredients.forEach((ingredientId: string) => {
            itemIngredientsToInsert.push({
              item_id: insertedItem.id,
              ingredient_id: ingredientId,
              is_optional: false
            })
          })
        }
      })

      if (itemIngredientsToInsert.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('item_ingredients')
          .insert(itemIngredientsToInsert)

        if (ingredientsError) {
          console.error('Error saving item ingredients:', ingredientsError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    // Transform response to include ingredients
    const transformedItems = (insertedItems || []).map((item, index) => ({
      ...item,
      position: item.sort_order,
      price: item.base_price,
      ingredients: deduplicatedItems[index]?.ingredients || []
    }))

    return NextResponse.json(transformedItems)
  } catch (err) {
    console.error('Error saving items:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
