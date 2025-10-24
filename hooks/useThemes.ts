'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Theme } from '@/types'

/**
 * Hook to fetch available themes
 * NOTE: This hook requires Supabase to be configured.
 */
export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client lazily
  let supabase: ReturnType<typeof createClient> | null = null
  try {
    supabase = createClient()
  } catch (err) {
    // Supabase not configured
  }

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!supabase) {
          throw new Error('Supabase not configured')
        }

        const { data, error: fetchError } = await supabase
          .from('themes')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (fetchError) throw fetchError

        setThemes(data || [])
      } catch (err: any) {
        console.error('Error fetching themes:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemes()
  }, [])

  return {
    themes,
    isLoading,
    error,
  }
}

/**
 * Hook to get and update restaurant theme
 */
export function useRestaurantTheme(restaurantId: string) {
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client lazily
  let supabase: ReturnType<typeof createClient> | null = null
  try {
    supabase = createClient()
  } catch (err) {
    // Supabase not configured
  }

  useEffect(() => {
    const fetchRestaurantTheme = async () => {
      try {
        if (!supabase) {
          return
        }

        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('theme_id')
          .eq('id', restaurantId)
          .single()

        if (fetchError) throw fetchError

        setCurrentThemeId(data.theme_id)
      } catch (err: any) {
        console.error('Error fetching restaurant theme:', err)
        setError(err.message)
      }
    }

    if (restaurantId) {
      fetchRestaurantTheme()
    }
  }, [restaurantId])

  const updateTheme = async (themeId: string) => {
    try {
      setIsUpdating(true)
      setError(null)

      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ theme_id: themeId })
        .eq('id', restaurantId)

      if (updateError) throw updateError

      setCurrentThemeId(themeId)
      return true
    } catch (err: any) {
      console.error('Error updating theme:', err)
      setError(err.message)
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    currentThemeId,
    updateTheme,
    isUpdating,
    error,
  }
}
