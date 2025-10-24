import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { Session } from '@/lib/auth'

/**
 * GET /api/admin/restaurants
 * Lista todos los restaurantes (solo para admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión admin
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const session: Session = JSON.parse(sessionCookie.value)

    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden acceder.' },
        { status: 403 }
      )
    }

    // Obtener todos los restaurantes (excepto el admin)
    const supabase = createAdminClient()

    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching restaurants:', error)
      return NextResponse.json(
        { error: 'Error al obtener restaurantes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error('Error in GET /api/admin/restaurants:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/restaurants
 * Crear nuevo restaurante (solo para admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión admin
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const session: Session = JSON.parse(sessionCookie.value)

    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden crear restaurantes.' },
        { status: 403 }
      )
    }

    // Obtener datos del body
    const body = await request.json()
    const { name, slug, password, subscription_status = 'active' } = body

    // Validar campos requeridos
    if (!name || !slug || !password) {
      return NextResponse.json(
        { error: 'Nombre, slug y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar que el slug no sea el del admin
    if (slug === 'restoranmaestroadmin') {
      return NextResponse.json(
        { error: 'El slug "restoranmaestroadmin" está reservado' },
        { status: 400 }
      )
    }

    // Hashear contraseña
    const bcrypt = require('bcryptjs')
    const password_hash = await bcrypt.hash(password, 10)

    // Crear restaurante
    const supabase = createAdminClient()

    const { data: newRestaurant, error } = await supabase
      .from('restaurants')
      .insert({
        name,
        slug,
        password_hash,
        subscription_status,
        is_admin: false,
        is_demo: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'El slug ya está en uso. Elige otro.' },
          { status: 400 }
        )
      }

      console.error('Error creating restaurant:', error)
      return NextResponse.json(
        { error: 'Error al crear restaurante' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      restaurant: newRestaurant
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/restaurants:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
