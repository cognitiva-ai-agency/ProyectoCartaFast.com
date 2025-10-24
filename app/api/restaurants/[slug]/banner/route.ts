import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface BannerConfig {
  enabled: boolean
  message: string
  backgroundColor: string
  textColor: string
  updated_at: string
}

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

    // Get promotion banner
    const { data: banner, error: bannerError } = await supabase
      .from('promotion_banners')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .single()

    if (bannerError || !banner) {
      // Return default banner if none exists
      return NextResponse.json({
        enabled: false,
        message: 'Ofertas especiales disponibles',
        backgroundColor: '#FF9500',
        textColor: '#FFFFFF',
        updated_at: new Date().toISOString()
      })
    }

    // Map database fields to API response
    const bannerConfig: BannerConfig = {
      enabled: banner.is_visible,
      message: banner.title + (banner.subtitle ? ` - ${banner.subtitle}` : ''),
      // Read colors from database (with fallback to defaults)
      backgroundColor: banner.background_color || '#FF9500',
      textColor: banner.text_color || '#FFFFFF',
      updated_at: banner.updated_at
    }

    console.log('✅ Banner loaded from DB:', bannerConfig)

    return NextResponse.json(bannerConfig)
  } catch (err) {
    console.error('Error getting banner:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const slug = params.slug
    const banner = await request.json()

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

    // Check if banner exists
    const { data: existingBanner } = await supabase
      .from('promotion_banners')
      .select('id')
      .eq('restaurant_id', restaurant.id)
      .single()

    const bannerData = {
      restaurant_id: restaurant.id,
      title: banner.message || 'Ofertas especiales',
      subtitle: null,
      is_visible: banner.enabled || false,
      background_color: banner.backgroundColor || '#FF9500',
      text_color: banner.textColor || '#FFFFFF'
    }

    console.log('💾 Saving banner to DB:', bannerData)

    if (existingBanner) {
      // Update existing banner
      const { error: updateError } = await supabase
        .from('promotion_banners')
        .update(bannerData)
        .eq('id', existingBanner.id)

      if (updateError) {
        console.error('❌ Error updating banner:', updateError)
        return NextResponse.json(
          { error: 'Failed to save banner: ' + updateError.message },
          { status: 500 }
        )
      }
      console.log('✅ Banner updated successfully')
    } else {
      // Insert new banner
      const { error: insertError } = await supabase
        .from('promotion_banners')
        .insert(bannerData)

      if (insertError) {
        console.error('❌ Error inserting banner:', insertError)
        return NextResponse.json(
          { error: 'Failed to save banner: ' + insertError.message },
          { status: 500 }
        )
      }
      console.log('✅ Banner created successfully')
    }

    return NextResponse.json({
      ...banner,
      updated_at: new Date().toISOString()
    })
  } catch (err) {
    console.error('Error saving banner:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
