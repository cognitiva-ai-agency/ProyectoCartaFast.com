import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateIngredientId } from '@/lib/slugify'

interface IngredientsData {
  categories: { [key: string]: string }
  ingredients: any[]
  updated_at: string
}

// Default ingredient categories (uppercase keys to match original format)
const DEFAULT_CATEGORIES = {
  'CARNES': 'Carnes',
  'PESCADOS': 'Pescados y Mariscos',
  'VEGETALES': 'Vegetales',
  'LACTEOS': 'Lácteos',
  'CEREALES': 'Cereales y Granos',
  'FRUTAS': 'Frutas',
  'CONDIMENTOS': 'Condimentos y Especias',
  'OTROS': 'Otros'
}

/**
 * GET /api/restaurants/[slug]/ingredients
 * Get the complete ingredients list for a restaurant
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug

    const supabase = createAdminClient()

    // Get restaurant ID and custom categories
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, ingredient_categories')
      .eq('slug', slug)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Use custom categories if available, otherwise use defaults
    const customCategories = restaurant.ingredient_categories || DEFAULT_CATEGORIES

    // Get all ingredients for this restaurant
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (ingredientsError) {
      console.error('Error getting ingredients:', ingredientsError)
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      )
    }

    const data: IngredientsData = {
      categories: customCategories,
      ingredients: (ingredients || []).map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.category.toUpperCase(), // Convert to uppercase to match original format
        isCommonAllergen: ing.is_allergen
      })),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error getting ingredients:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/ingredients
 * Save the complete ingredients list (replaces all)
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

    // Save custom categories to restaurant
    const categories = body.categories || DEFAULT_CATEGORIES
    await supabase
      .from('restaurants')
      .update({ ingredient_categories: categories })
      .eq('id', restaurant.id)

    // Delete all existing ingredients
    await supabase
      .from('ingredients')
      .delete()
      .eq('restaurant_id', restaurant.id)

    // Insert new ingredients
    const ingredients = body.ingredients || []
    if (ingredients.length > 0) {
      // Generate unique IDs for each ingredient
      const existingIds: string[] = []

      const ingredientsToInsert = ingredients.map((ing: any) => {
        // Use provided ID if it's already a slug (not a UUID)
        // Otherwise, generate a new slug from the name
        let id = ing.id
        if (!id || id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          // It's a UUID or missing, generate a slug
          id = generateIngredientId(ing.name, existingIds)
        }
        existingIds.push(id)

        return {
          id, // Use the slug as ID
          restaurant_id: restaurant.id,
          category: ing.category.toLowerCase(), // Store in lowercase in DB
          name: ing.name,
          is_allergen: ing.isCommonAllergen || ing.is_allergen || false
        }
      })

      const { data: insertedIngredients, error: insertError } = await supabase
        .from('ingredients')
        .insert(ingredientsToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting ingredients:', insertError)
        return NextResponse.json(
          { error: 'Failed to save ingredients' },
          { status: 500 }
        )
      }
    }

    const data: IngredientsData = {
      categories,
      ingredients,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error saving ingredients:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/restaurants/[slug]/ingredients
 * Update a specific ingredient
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const body = await request.json()
    const { id, updates } = body

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
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

    // Update the ingredient
    const { error: updateError } = await supabase
      .from('ingredients')
      .update({
        name: updates.name,
        category: updates.category.toLowerCase(), // Store in lowercase in DB
        is_allergen: updates.isCommonAllergen || updates.is_allergen || false
      })
      .eq('id', id)
      .eq('restaurant_id', restaurant.id)

    if (updateError) {
      console.error('Error updating ingredient:', updateError)
      return NextResponse.json(
        { error: 'Failed to update ingredient' },
        { status: 500 }
      )
    }

    // Return updated list
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    const data: IngredientsData = {
      categories: DEFAULT_CATEGORIES,
      ingredients: (ingredients || []).map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.category.toUpperCase(), // Convert to uppercase to match original format
        isCommonAllergen: ing.is_allergen
      })),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error updating ingredient:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/restaurants/[slug]/ingredients
 * Delete a specific ingredient
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing ingredient id' },
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

    // Delete the ingredient
    const { error: deleteError } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurant.id)

    if (deleteError) {
      console.error('Error deleting ingredient:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete ingredient' },
        { status: 500 }
      )
    }

    // Return updated list
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    const data: IngredientsData = {
      categories: DEFAULT_CATEGORIES,
      ingredients: (ingredients || []).map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.category.toUpperCase(), // Convert to uppercase to match original format
        isCommonAllergen: ing.is_allergen
      })),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error deleting ingredient:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
