import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Category } from '@/lib/supabase/types'

/**
 * GET /api/restaurants/[slug]/categories
 * Get all categories for a restaurant
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug

    const supabase = createAdminClient()

    // First, get restaurant ID from slug
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

    // Get categories for this restaurant
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      console.error('Error getting categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Transform to match frontend expectations (map sort_order to position)
    // Always normalize positions to 0, 1, 2, 3... to fix any duplicates in DB
    const transformedCategories = (categories || []).map((cat, index) => ({
      ...cat,
      position: index  // Normalize positions: 0, 1, 2, 3...
    }))

    return NextResponse.json(transformedCategories)
  } catch (err) {
    console.error('Error getting categories:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/categories
 * Create or update all categories for a restaurant
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const categories = await request.json()

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Categories must be an array' },
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

    // Get existing categories to preserve IDs
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('restaurant_id', restaurant.id)

    const existingMap = new Map(existingCategories?.map(c => [c.id, c]) || [])

    // Separate into updates and inserts
    const categoriesToUpdate: any[] = []
    const categoriesToInsert: any[] = []
    const categoryIdsToKeep = new Set<string>()

    categories.forEach((cat: any, index: number) => {
      const categoryData = {
        name: cat.name,
        description: cat.description || null,
        icon: cat.icon || null,
        sort_order: cat.position || cat.order || cat.sort_order || index,
        is_visible: cat.is_visible !== false,
        updated_at: new Date().toISOString()
      }

      // If category has an ID that exists in DB, update it
      if (cat.id && existingMap.has(cat.id)) {
        categoriesToUpdate.push({
          id: cat.id,
          ...categoryData
        })
        categoryIdsToKeep.add(cat.id)
      }
      // Otherwise, insert as new category
      else {
        categoriesToInsert.push({
          restaurant_id: restaurant.id,
          ...categoryData
        })
      }
    })

    // Delete categories that are no longer in the list
    const categoryIdsToDelete = Array.from(existingMap.keys())
      .filter(id => !categoryIdsToKeep.has(id))

    if (categoryIdsToDelete.length > 0) {
      await supabase
        .from('categories')
        .delete()
        .in('id', categoryIdsToDelete)
    }

    // Update existing categories
    const updatedCategories: any[] = []
    for (const cat of categoriesToUpdate) {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          sort_order: cat.sort_order,
          is_visible: cat.is_visible,
          updated_at: cat.updated_at
        })
        .eq('id', cat.id)
        .eq('restaurant_id', restaurant.id)
        .select()
        .single()

      if (!error && data) {
        updatedCategories.push(data)
      }
    }

    // Insert new categories
    let insertedCategories: any[] = []
    if (categoriesToInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting categories:', insertError)
      } else {
        insertedCategories = data || []
      }
    }

    // Combine and sort by sort_order
    const allCategories = [...updatedCategories, ...insertedCategories]
      .sort((a, b) => a.sort_order - b.sort_order)

    // Transform to match frontend expectations (map sort_order to position)
    // Always normalize positions to 0, 1, 2, 3... to fix any duplicates in DB
    const transformedCategories = allCategories.map((cat, index) => ({
      ...cat,
      position: index  // Normalize positions: 0, 1, 2, 3...
    }))

    return NextResponse.json(transformedCategories)
  } catch (err) {
    console.error('Error saving categories:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
