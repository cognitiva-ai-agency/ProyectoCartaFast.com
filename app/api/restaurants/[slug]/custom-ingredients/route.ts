import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface CustomIngredientsData {
  ingredients: any[]
  updated_at: string
}

/**
 * GET /api/restaurants/[slug]/custom-ingredients
 * Get custom ingredients for a restaurant
 *
 * NOTE: This route is deprecated. All ingredients are now stored in the main ingredients table.
 * Use /api/restaurants/[slug]/ingredients instead.
 * This route is kept for backward compatibility.
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
      return NextResponse.json({
        ingredients: [],
        updated_at: new Date().toISOString()
      })
    }

    // Get all ingredients (in the new system, there's no distinction between "custom" and "master")
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    const data: CustomIngredientsData = {
      ingredients: (ingredients || []).map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
        isCommonAllergen: ing.is_allergen
      })),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error getting custom ingredients:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/custom-ingredients
 * Update custom ingredients for a restaurant
 *
 * NOTE: This route is deprecated. Use /api/restaurants/[slug]/ingredients instead.
 * This route is kept for backward compatibility.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const body = await request.json()

    // For backward compatibility, just return the data
    // The main ingredients endpoint should be used for actual updates
    const data: CustomIngredientsData = {
      ingredients: body.ingredients || [],
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error saving custom ingredients:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
