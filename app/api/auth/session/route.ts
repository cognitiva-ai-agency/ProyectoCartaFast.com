import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * GET /api/auth/session
 * Get current user session
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { session: null },
        { status: 401 }
      )
    }

    return NextResponse.json({
      session,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    )
  }
}
