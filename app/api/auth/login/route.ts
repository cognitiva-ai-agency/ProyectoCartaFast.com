import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { DEMO_RESTAURANT } from '@/lib/demo-data'

/**
 * POST /api/auth/login
 * Authenticate restaurant owner by slug and password
 */
export async function POST(request: NextRequest) {
  try {
    const { slug, password } = await request.json()

    console.log('🔐 Login attempt:', { slug, password: password ? '***' : 'empty' })

    // Validate input
    if (!slug || !password) {
      console.log('❌ Validation failed: missing credentials')
      return NextResponse.json(
        { error: 'Slug y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Authentication flow: Supabase → Filesystem fallback
    console.log('⚠️ Checking production database...')

    // PRODUCTION MODE: Check Supabase first, fallback to filesystem
    // Try Supabase if environment variables are configured
    let supabaseAttempted = false
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAttempted = true
      console.log('✅ Supabase configured, attempting Supabase auth first...')

      try {
        // Get Supabase admin client
        const supabase = createAdminClient()

        // Find restaurant by slug
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, slug, password_hash, subscription_status, is_admin')
          .eq('slug', slug)
          .single()

        if (restaurant && !restaurantError) {
          console.log('✅ Restaurant found in Supabase')

          if (restaurant.subscription_status === 'cancelled' || restaurant.subscription_status === 'suspended') {
            return NextResponse.json(
              { error: 'Esta cuenta está desactivada o suspendida' },
              { status: 403 }
            )
          }

          // Verify password
          const bcrypt = require('bcryptjs')
          const isPasswordValid = await bcrypt.compare(password, restaurant.password_hash)

          if (!isPasswordValid) {
            return NextResponse.json(
              { error: 'Contraseña incorrecta' },
              { status: 401 }
            )
          }

          // Create session cookie
          const sessionData = {
            restaurantId: restaurant.id,
            slug: restaurant.slug,
            ownerId: restaurant.id,
            name: restaurant.name,
            isDemo: false,
            isAdmin: restaurant.is_admin || false,
          }

          const cookieStore = cookies()
          cookieStore.set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          })

          return NextResponse.json({
            success: true,
            isDemo: false,
            isAdmin: restaurant.is_admin || false,
            restaurant: {
              id: restaurant.id,
              name: restaurant.name,
              slug: restaurant.slug,
            },
          })
        } else {
          console.log('⚠️ Restaurant not found in Supabase, trying filesystem fallback...')
        }
      } catch (supabaseError) {
        console.error('⚠️ Supabase error, trying filesystem fallback:', supabaseError)
      }
    }

    // FILESYSTEM FALLBACK: Try filesystem-based auth if Supabase failed or wasn't attempted
    if (!supabaseAttempted || true) { // Always try filesystem as fallback
      console.log('⚠️ Trying filesystem-based auth...')

      // Filesystem fallback for local development
      // Check if restaurant data exists in filesystem
      const fs = require('fs')
      const path = require('path')
      const restaurantDir = path.join(process.cwd(), 'data', 'restaurants', slug)

      if (!fs.existsSync(restaurantDir)) {
        return NextResponse.json(
          { error: 'Restaurante no encontrado. Verifica el slug.' },
          { status: 404 }
        )
      }

      // For filesystem mode, read password from auth.json
      let validPassword = '123456' // Default fallback
      try {
        const authFile = path.join(restaurantDir, 'auth.json')
        if (fs.existsSync(authFile)) {
          const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
          validPassword = authData.password || '123456'
        }
      } catch (err) {
        console.error('Error loading auth config:', err)
      }

      if (password !== validPassword) {
        return NextResponse.json(
          { error: 'Contraseña incorrecta' },
          { status: 401 }
        )
      }

      // Load restaurant name from theme.json
      let restaurantName = 'Restaurante'
      try {
        const themeFile = path.join(restaurantDir, 'theme.json')
        if (fs.existsSync(themeFile)) {
          const themeData = JSON.parse(fs.readFileSync(themeFile, 'utf-8'))
          restaurantName = themeData.restaurantName || 'Restaurante'
        }
      } catch (err) {
        console.error('Error loading theme:', err)
      }

      // Create session for filesystem-based restaurant
      const sessionData = {
        restaurantId: `fs-${slug}`, // Filesystem-based ID
        slug: slug,
        ownerId: `fs-owner-${slug}`,
        name: restaurantName,
        isDemo: false, // NOT demo - it's a real production restaurant
      }

      console.log('📝 Creating filesystem-based session:', sessionData)

      const cookieStore = cookies()
      cookieStore.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      console.log('✅ Filesystem session created successfully')

      return NextResponse.json({
        success: true,
        isDemo: false,
        restaurant: {
          id: `fs-${slug}`,
          name: restaurantName,
          slug: slug,
        },
      })
    }

    // If we reached here, authentication failed
    return NextResponse.json(
      { error: 'Restaurante no encontrado' },
      { status: 404 }
    )
  } catch (error) {
    console.error('❌ Login error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    )
  }
}
