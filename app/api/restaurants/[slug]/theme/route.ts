import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  uploadImage,
  deleteImage,
  generateImagePath,
  getExtensionFromDataUrl,
  getContentTypeFromDataUrl
} from '@/lib/supabase/storage'

interface ThemeConfig {
  themeId: string
  currency: string
  restaurantName?: string
  logoUrl?: string
  logoStyle?: 'circular' | 'rectangular' | 'none'
  timezone?: string
  updated_at: string
}

/**
 * GET /api/restaurants/[slug]/theme
 * Get theme configuration for a restaurant
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug

    const supabase = createAdminClient()

    // Get restaurant with theme info
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('name, theme_id, currency, timezone, logo_url, logo_style, updated_at')
      .eq('slug', slug)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const theme: ThemeConfig = {
      themeId: restaurant.theme_id || 'elegant',
      currency: restaurant.currency || 'CLP',
      restaurantName: restaurant.name || undefined,
      logoUrl: restaurant.logo_url || undefined,
      logoStyle: (restaurant.logo_style as any) || 'circular',
      timezone: restaurant.timezone || 'America/Santiago',
      updated_at: restaurant.updated_at
    }

    return NextResponse.json(theme)
  } catch (err) {
    console.error('Error getting theme:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/restaurants/[slug]/theme
 * Update theme configuration for a restaurant
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const theme = await request.json()

    const supabase = createAdminClient()

    // Get existing restaurant to compare logo
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, logo_url')
      .eq('slug', slug)
      .single()

    if (fetchError || !existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Process logo image if it's base64
    let logoUrl = theme.logoUrl
    if (logoUrl && logoUrl.startsWith('data:image/')) {
      console.log('📤 Uploading new logo to Supabase Storage...')

      // Delete old logo from Supabase Storage if it exists
      if (existingRestaurant.logo_url && existingRestaurant.logo_url !== logoUrl) {
        console.log('🗑️  Deleting old logo from Supabase Storage')
        await deleteImage(existingRestaurant.logo_url)
      }

      // Upload new logo to Supabase Storage
      const extension = getExtensionFromDataUrl(logoUrl)
      const contentType = getContentTypeFromDataUrl(logoUrl)
      const imagePath = generateImagePath(slug, 'logos', 'logo', extension)

      const publicUrl = await uploadImage(imagePath, logoUrl, contentType)

      if (!publicUrl) {
        console.error('❌ Failed to upload logo to Supabase Storage')
        return NextResponse.json(
          { error: 'Failed to upload logo image' },
          { status: 500 }
        )
      }

      console.log('✅ Logo uploaded successfully:', publicUrl)
      logoUrl = publicUrl
    }
    // If logo was removed
    else if (existingRestaurant.logo_url && (!logoUrl || logoUrl === '')) {
      console.log('🗑️  Removing logo from Supabase Storage')
      await deleteImage(existingRestaurant.logo_url)
      logoUrl = null
    }

    // Update restaurant with new theme
    const updateData = {
      name: theme.restaurantName,
      theme_id: theme.themeId,
      currency: theme.currency,
      timezone: theme.timezone || 'America/Santiago',
      logo_url: logoUrl || null,
      logo_style: theme.logoStyle || 'circular',
      updated_at: new Date().toISOString()
    }

    console.log('💾 Updating restaurant in Supabase:', updateData)

    const { data: updatedRestaurant, error: updateError } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', existingRestaurant.id)
      .select('name, theme_id, currency, timezone, logo_url, logo_style, updated_at')
      .single()

    if (updateError) {
      console.error('❌ Error saving theme to database:', updateError)
      return NextResponse.json(
        { error: 'Failed to save theme: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Restaurant updated successfully:', updatedRestaurant)

    const themeConfig: ThemeConfig = {
      themeId: updatedRestaurant.theme_id,
      currency: updatedRestaurant.currency,
      restaurantName: updatedRestaurant.name,
      logoUrl: updatedRestaurant.logo_url || undefined,
      logoStyle: (updatedRestaurant.logo_style as any) || 'circular',
      timezone: updatedRestaurant.timezone,
      updated_at: updatedRestaurant.updated_at
    }

    return NextResponse.json(themeConfig)
  } catch (err) {
    console.error('Error saving theme:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
