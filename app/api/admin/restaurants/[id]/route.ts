import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { Session } from '@/lib/auth'
import bcrypt from 'bcryptjs'

/**
 * PATCH /api/admin/restaurants/[id]
 * Actualizar restaurante (solo para admin)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Resolve params (Next.js 14 compatibility)
    const params = await Promise.resolve(context.params)
    const id = params.id

    // Verificar sesión admin
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const session: Session = JSON.parse(sessionCookie.value)

    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      )
    }
    const body = await request.json()
    const { name, slug, password, subscription_status } = body

    // Construir objeto de actualización
    const updates: any = {}

    if (name !== undefined) updates.name = name
    if (slug !== undefined) {
      if (slug === 'restoranmaestroadmin') {
        return NextResponse.json(
          { error: 'El slug "restoranmaestroadmin" está reservado' },
          { status: 400 }
        )
      }
      updates.slug = slug
    }
    if (subscription_status !== undefined) updates.subscription_status = subscription_status

    // Si hay nueva contraseña, hashearla
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10)
    }

    updates.updated_at = new Date().toISOString()

    // Actualizar restaurante
    const supabase = createAdminClient()

    const { data: updatedRestaurant, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'El slug ya está en uso. Elige otro.' },
          { status: 400 }
        )
      }

      console.error('Error updating restaurant:', error)
      return NextResponse.json(
        { error: 'Error al actualizar restaurante' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      restaurant: updatedRestaurant
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/restaurants/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/restaurants/[id]
 * Eliminar restaurante (soft delete - cambia a cancelled)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Resolve params (Next.js 14 compatibility)
    const params = await Promise.resolve(context.params)
    const id = params.id

    // Verificar sesión admin
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const session: Session = JSON.parse(sessionCookie.value)

    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      )
    }

    // Soft delete: cambiar a cancelled
    const supabase = createAdminClient()

    const { data: deletedRestaurant, error } = await supabase
      .from('restaurants')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting restaurant:', error)
      return NextResponse.json(
        { error: 'Error al eliminar restaurante' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurante cancelado exitosamente'
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/restaurants/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
