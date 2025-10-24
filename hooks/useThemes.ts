'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Theme } from '@/types'
import { DEFAULT_THEMES } from '@/lib/default-themes'

/**
 * Hook to fetch available themes
 * Uses hardcoded themes if Supabase is not configured or themes table is empty
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

        // Try to load from Supabase first
        if (supabase) {
          try {
            const { data, error: fetchError } = await supabase
              .from('themes')
              .select('*')
              .eq('is_active', true)
              .order('name', { ascending: true })

            // If we got themes from DB, use them
            if (!fetchError && data && data.length > 0) {
              setThemes(data)
              setIsLoading(false)
              return
            }
          } catch (dbError) {
            console.log('Could not load themes from DB, using defaults')
          }
        }

        // Fallback to default hardcoded themes
        setThemes(DEFAULT_THEMES)
      } catch (err: any) {
        console.error('Error fetching themes:', err)
        // On error, still provide default themes
        setThemes(DEFAULT_THEMES)
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

  // Función para recargar el tema desde la base de datos
  const refreshTheme = async () => {
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

  useEffect(() => {
    if (restaurantId) {
      refreshTheme()
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
    refreshTheme,
    isUpdating,
    error,
  }
}
