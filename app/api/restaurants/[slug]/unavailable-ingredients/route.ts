import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface UnavailableIngredientsData {
  ingredient_ids: string[]
  updated_at: string
}

/**
 * GET /api/restaurants/[slug]/unavailable-ingredients
 * Get list of unavailable ingredients for a restaurant
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

    // Get unavailable ingredients
    const { data: unavailable, error: unavailableError } = await supabase
      .from('unavailable_ingredients')
      .select('ingredient_id, marked_at')
      .eq('restaurant_id', restaurant.id)

    if (unavailableError) {
      console.error('Error getting unavailable ingredients:', unavailableError)
      return NextResponse.json(
        { error: 'Failed to fetch unavailable ingredients' },
        { status: 500 }
      )
    }

    const data: UnavailableIngredientsData = {
      ingredient_ids: (unavailable || []).map(u => u.ingredient_id),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error getting unavailable ingredients:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/unavailable-ingredients
 * Update list of unavailable ingredients
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const body = await request.json()

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

    // Delete all existing unavailable ingredients
    await supabase
      .from('unavailable_ingredients')
      .delete()
      .eq('restaurant_id', restaurant.id)

    // Insert new unavailable ingredients
    const ingredientIds = body.ingredient_ids || []
    if (ingredientIds.length > 0) {
      const unavailableToInsert = ingredientIds.map((ingredientId: string) => ({
        restaurant_id: restaurant.id,
        ingredient_id: ingredientId,
        reason: null
      }))

      const { error: insertError } = await supabase
        .from('unavailable_ingredients')
        .insert(unavailableToInsert)

      if (insertError) {
        console.error('Error inserting unavailable ingredients:', insertError)
        return NextResponse.json(
          { error: 'Failed to save unavailable ingredients' },
          { status: 500 }
        )
      }
    }

    const data: UnavailableIngredientsData = {
      ingredient_ids: ingredientIds,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error saving unavailable ingredients:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
