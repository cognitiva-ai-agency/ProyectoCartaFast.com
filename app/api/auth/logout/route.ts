import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/logout
 * Clear session cookie and log out user
 */
export async function POST() {
  try {
    const cookieStore = cookies()
    cookieStore.delete('session')

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
