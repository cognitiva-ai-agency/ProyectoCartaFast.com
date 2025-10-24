import { cookies } from 'next/headers'

export interface Session {
  restaurantId: string
  slug: string
  ownerId: string
  name: string
  isDemo?: boolean
  isAdmin?: boolean
}

/**
 * Get current session from cookies (Server-side)
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    console.log('🍪 Reading session cookie:', sessionCookie ? 'FOUND' : 'NOT FOUND')

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    console.log('✅ Session parsed:', session)
    return session
  } catch (error) {
    console.error('❌ Error getting session:', error)
    return null
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession()

  if (!session) {
    throw new Error('No autenticado')
  }

  return session
}
