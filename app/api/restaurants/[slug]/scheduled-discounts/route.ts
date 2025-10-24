import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ScheduledDiscount } from '@/lib/supabase/types'

interface ScheduledDiscountsConfig {
  discounts: any[]
  updated_at: string
}

/**
 * GET /api/restaurants/[slug]/scheduled-discounts
 * Get scheduled discounts configuration for a restaurant
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

    // Get scheduled discounts
    const { data: discounts, error: discountsError } = await supabase
      .from('scheduled_discounts')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })

    if (discountsError) {
      console.error('Error getting scheduled discounts:', discountsError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled discounts' },
        { status: 500 }
      )
    }

    const config: ScheduledDiscountsConfig = {
      discounts: discounts || [],
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(config)
  } catch (err) {
    console.error('Error getting scheduled discounts:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/scheduled-discounts
 * Update scheduled discounts configuration for a restaurant
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

    // Delete all existing scheduled discounts
    await supabase
      .from('scheduled_discounts')
      .delete()
      .eq('restaurant_id', restaurant.id)

    // Insert new scheduled discounts
    const discounts = body.discounts || []
    if (discounts.length > 0) {
      const discountsToInsert = discounts.map((discount: any) => ({
        restaurant_id: restaurant.id,
        category_id: discount.category_id,
        name: discount.name,
        discount_percentage: discount.discount_percentage,
        start_time: discount.start_time,
        end_time: discount.end_time,
        days_of_week: discount.days_of_week || [],
        is_active: discount.is_active !== false
      }))

      const { error: insertError } = await supabase
        .from('scheduled_discounts')
        .insert(discountsToInsert)

      if (insertError) {
        console.error('Error inserting scheduled discounts:', insertError)
        return NextResponse.json(
          { error: 'Failed to save scheduled discounts' },
          { status: 500 }
        )
      }
    }

    const config: ScheduledDiscountsConfig = {
      discounts,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(config)
  } catch (err) {
    console.error('Error saving scheduled discounts:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
