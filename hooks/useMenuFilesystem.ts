'use client'

import { useState, useEffect } from 'react'
import { Menu, Category, MenuItem } from '@/types'
import { DEMO_MENU } from '@/lib/demo-data'

/**
 * Hook for filesystem-based menu storage
 * Uses API routes to read/write data to local files
 * Each restaurant has its own folder: data/{slug}/
 */
export function useMenuFilesystem(restaurantSlug: string) {
  const [menu, setMenu] = useState<Menu>(DEMO_MENU)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from filesystem on mount
  useEffect(() => {
    loadData()
  }, [restaurantSlug])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load categories
      const categoriesRes = await fetch(`/api/restaurants/${restaurantSlug}/categories`)
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      // Load items
      const itemsRes = await fetch(`/api/restaurants/${restaurantSlug}/items`)
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setItems(itemsData)
      }

      // Load menu
      const menuRes = await fetch(`/api/restaurants/${restaurantSlug}/menu`)
      if (menuRes.ok) {
        const menuData = await menuRes.json()
        setMenu(menuData)
      }
    } catch (err) {
      console.error('Error loading menu data:', err)
      setError('Error al cargar los datos del menú')
    } finally {
      setIsLoading(false)
    }
  }

  // Save categories to filesystem
  const saveCategories = async (newCategories: Category[]) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantSlug}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategories)
      })

      if (!res.ok) {
        throw new Error('Failed to save categories')
      }

      // IMPORTANT: Use the categories returned by the API (they have correct IDs)
      const savedCategories = await res.json()
      setCategories(savedCategories)
    } catch (err) {
      console.error('Error saving categories:', err)
      throw err
    }
  }

  // Save items to filesystem
  const saveItems = async (newItems: MenuItem[]) => {
    try {
      console.log('💾 saveItems - Sending to API:', {
        count: newItems.length,
        sample: newItems[0],
        url: `/api/restaurants/${restaurantSlug}/items`
      })

      const res = await fetch(`/api/restaurants/${restaurantSlug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems)
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ API Error:', res.status, errorText)
        throw new Error('Failed to save items')
      }

      const savedItems = await res.json()
      console.log('✅ Items saved successfully:', {
        count: savedItems.length,
        sample: savedItems[0]
      })
      setItems(savedItems)
    } catch (err) {
      console.error('Error saving items:', err)
      throw err
    }
  }

  // Add category
  const addCategory = async (name: string, description?: string, imageUrl?: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      menu_id: menu.id,
      name,
      description,
      image_url: imageUrl,
      position: categories.length,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedCategories = [...categories, newCategory]
    await saveCategories(updatedCategories)
    return newCategory
  }

  // Update category
  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(c =>
      c.id === categoryId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    )
    await saveCategories(updatedCategories)
  }

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId)
    const updatedItems = items.filter(i => i.category_id !== categoryId)

    await saveCategories(updatedCategories)
    await saveItems(updatedItems)
  }

  // Reorder categories
  const reorderCategories = async (reorderedCategories: Category[]) => {
    const updatedCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      position: index,
      updated_at: new Date().toISOString(),
    }))
    await saveCategories(updatedCategories)
  }

  // Add menu item
  const addMenuItem = async (categoryId: string, itemData: Partial<MenuItem>) => {
    const categoryItems = items.filter(i => i.category_id === categoryId)

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      category_id: categoryId,
      name: itemData.name || 'Nuevo Plato',
      description: itemData.description,
      price: itemData.price || 0,
      image_url: itemData.image_url,
      position: categoryItems.length,
      is_available: true,
      is_promotion: false,
      allergens: itemData.allergens,
      ingredients: itemData.ingredients,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedItems = [...items, newItem]
    await saveItems(updatedItems)
    return newItem
  }

  // Update menu item
  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    console.log('🔧 useMenuFilesystem - updateMenuItem called:', {
      itemId,
      updates,
      currentItem: items.find(i => i.id === itemId)
    })

    const updatedItems = items.map(i =>
      i.id === itemId ? { ...i, ...updates, updated_at: new Date().toISOString() } : i
    )

    console.log('📝 Updated item:', updatedItems.find(i => i.id === itemId))

    await saveItems(updatedItems)
  }

  // Delete menu item
  const deleteMenuItem = async (itemId: string) => {
    const updatedItems = items.filter(i => i.id !== itemId)
    await saveItems(updatedItems)
  }

  // Reorder items
  const reorderItems = async (categoryId: string, reorderedItems: MenuItem[]) => {
    const updatedItemsForCategory = reorderedItems.map((item, index) => ({
      ...item,
      position: index,
      updated_at: new Date().toISOString(),
    }))

    const otherItems = items.filter(i => i.category_id !== categoryId)
    const allUpdatedItems = [...otherItems, ...updatedItemsForCategory]

    await saveItems(allUpdatedItems)
  }

  const refreshMenu = async () => {
    await loadData()
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
    refreshMenu,
  }
}
