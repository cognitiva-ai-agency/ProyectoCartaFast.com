import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/restaurants/[slug]/menu
 * Get menu data for a restaurant (categories + items combined)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug

    const supabase = createAdminClient()

    // Get restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, logo_url, theme_id, currency, timezone')
      .eq('slug', slug)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Get categories with items
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      console.error('Error getting categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch menu' },
        { status: 500 }
      )
    }

    // Get all items for this restaurant
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true)
      .order('sort_order', { ascending: true })

    if (itemsError) {
      console.error('Error getting items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch menu' },
        { status: 500 }
      )
    }

    // Build menu structure
    const menu = {
      restaurant: {
        name: restaurant.name,
        logo_url: restaurant.logo_url,
        theme_id: restaurant.theme_id,
        currency: restaurant.currency,
        timezone: restaurant.timezone
      },
      categories: (categories || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        items: (items || [])
          .filter(item => item.category_id === category.id)
          .map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.base_price,
            final_price: item.final_price,
            discount_percentage: item.discount_percentage,
            image_url: item.image_url,
            is_promotion: item.is_promotion,
            calories: item.calories,
            preparation_time: item.preparation_time,
            spicy_level: item.spicy_level,
            is_vegetarian: item.is_vegetarian,
            is_vegan: item.is_vegan,
            is_gluten_free: item.is_gluten_free,
            allergens: item.allergens
          }))
      }))
    }

    return NextResponse.json(menu)
  } catch (err) {
    console.error('Error getting menu:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/restaurants/[slug]/menu
 * Update menu data for a restaurant
 * Note: This endpoint is kept for backward compatibility but is deprecated.
 * Use individual category and item endpoints instead.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const menu = await request.json()

    // For now, return the menu as-is
    // In the future, this should update categories and items via their respective endpoints
    return NextResponse.json(menu)
  } catch (err) {
    console.error('Error updating menu:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
