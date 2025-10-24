'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Menu, Category, MenuItem } from '@/types'

/**
 * Hook to fetch and manage menu data with real-time updates
 * NOTE: This hook requires Supabase to be configured. Use useMenuDemo for demo mode.
 */
export function useMenu(restaurantId: string) {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client lazily
  let supabase: ReturnType<typeof createSupabaseClient> | null = null
  try {
    supabase = createSupabaseClient()
  } catch (err) {
    // Supabase not configured - will be caught in fetchMenu
  }

  // Fetch menu data
  const fetchMenu = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!supabase) {
        throw new Error('Supabase not configured. Use demo mode or configure .env.local')
      }

      // Fetch active menu
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .single()

      if (menuError) {
        // If no menu exists, create one
        if (menuError.code === 'PGRST116') {
          const { data: newMenu, error: createError } = await supabase
            .from('menus')
            .insert({
              restaurant_id: restaurantId,
              name: 'Menú Principal',
              is_active: true,
            })
            .select()
            .single()

          if (createError) throw createError
          setMenu(newMenu)
          setCategories([])
          setItems([])
        } else {
          throw menuError
        }
      } else {
        setMenu(menuData)

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('menu_id', menuData.id)
          .order('position', { ascending: true })

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])

        // Fetch all items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .in('category_id', categoriesData?.map(c => c.id) || [])
          .order('position', { ascending: true })

        if (itemsError) throw itemsError
        setItems(itemsData || [])
      }
    } catch (err: any) {
      console.error('Error fetching menu:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (restaurantId) {
      fetchMenu()
    }
  }, [restaurantId])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!menu) return

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `menu_id=eq.${menu.id}`,
        },
        () => {
          fetchMenu()
        }
      )
      .subscribe()

    const itemsChannel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
        },
        () => {
          fetchMenu()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(categoriesChannel)
      supabase.removeChannel(itemsChannel)
    }
  }, [menu?.id])

  // Add category
  const addCategory = async (name: string) => {
    if (!menu) return null

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          menu_id: menu.id,
          name,
          position: categories.length,
          is_visible: true,
        })
        .select()
        .single()

      if (error) throw error
      setCategories([...categories, data])
      return data
    } catch (err: any) {
      console.error('Error adding category:', err)
      setError(err.message)
      return null
    }
  }

  // Update category
  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)

      if (error) throw error

      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, ...updates } : c
      ))
    } catch (err: any) {
      console.error('Error updating category:', err)
      setError(err.message)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      setCategories(categories.filter(c => c.id !== categoryId))
      setItems(items.filter(i => i.category_id !== categoryId))
    } catch (err: any) {
      console.error('Error deleting category:', err)
      setError(err.message)
    }
  }

  // Reorder categories
  const reorderCategories = async (reorderedCategories: Category[]) => {
    try {
      const updates = reorderedCategories.map((cat, index) => ({
        id: cat.id,
        position: index,
      }))

      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ position: update.position })
          .eq('id', update.id)
      }

      setCategories(reorderedCategories)
    } catch (err: any) {
      console.error('Error reordering categories:', err)
      setError(err.message)
    }
  }

  // Add menu item
  const addMenuItem = async (categoryId: string, itemData: Partial<MenuItem>) => {
    try {
      const categoryItems = items.filter(i => i.category_id === categoryId)

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          category_id: categoryId,
          position: categoryItems.length,
          is_available: true,
          ...itemData,
        })
        .select()
        .single()

      if (error) throw error
      setItems([...items, data])
      return data
    } catch (err: any) {
      console.error('Error adding menu item:', err)
      setError(err.message)
      return null
    }
  }

  // Update menu item
  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error

      setItems(items.map(i =>
        i.id === itemId ? { ...i, ...updates } : i
      ))
    } catch (err: any) {
      console.error('Error updating menu item:', err)
      setError(err.message)
    }
  }

  // Delete menu item
  const deleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setItems(items.filter(i => i.id !== itemId))
    } catch (err: any) {
      console.error('Error deleting menu item:', err)
      setError(err.message)
    }
  }

  // Reorder items
  const reorderItems = async (categoryId: string, reorderedItems: MenuItem[]) => {
    try {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        position: index,
      }))

      for (const update of updates) {
        await supabase
          .from('menu_items')
          .update({ position: update.position })
          .eq('id', update.id)
      }

      setItems(items.map(item => {
        const update = updates.find(u => u.id === item.id)
        return update ? { ...item, position: update.position } : item
      }))
    } catch (err: any) {
      console.error('Error reordering items:', err)
      setError(err.message)
    }
  }

  return {
    menu,
    categories,
    items,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderItems,
    refreshMenu: fetchMenu,
  }
}
