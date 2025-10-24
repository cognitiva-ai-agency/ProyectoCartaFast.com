'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface Session {
  restaurantId: string
  slug: string
  ownerId: string
  name: string
  isDemo?: boolean
}

/**
 * Client-side authentication hook
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check session status
    checkSession()
  }, [])

  const checkSession = async () => {
    console.log('🔍 Checking session...')
    try {
      const response = await fetch('/api/auth/session')
      console.log('📡 Session check response:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Session found:', data.session)
        setSession(data.session)
      } else {
        console.log('❌ No session found')
        setSession(null)
      }
    } catch (error) {
      console.error('❌ Error checking session:', error)
      setSession(null)
    } finally {
      setIsLoading(false)
      console.log('✅ Session check complete')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setSession(null)
      router.push('/clientes')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    logout,
    checkSession,
  }
}
