'use client'

import { useState, useEffect } from 'react'
import { Menu, Category, MenuItem } from '@/types'
import { DEMO_MENU, DEMO_CATEGORIES, DEMO_ITEMS } from '@/lib/demo-data'

const DEMO_CATEGORIES_KEY = 'menuscarta_demo_categories'
const DEMO_ITEMS_KEY = 'menuscarta_demo_items'

/**
 * Demo hook that simulates useMenu with local state
 * No Supabase connection required
 * Persists changes to localStorage and syncs across tabs
 */
export function useMenuDemo() {
  const [menu] = useState<Menu>(DEMO_MENU)
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES)
  const [items, setItems] = useState<MenuItem[]>(DEMO_ITEMS)
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem(DEMO_CATEGORIES_KEY)
    const savedItems = localStorage.getItem(DEMO_ITEMS_KEY)

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories))
      } catch (err) {
        console.error('Error loading categories from localStorage:', err)
      }
    }

    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems))
      } catch (err) {
        console.error('Error loading items from localStorage:', err)
      }
    }
  }, [])

  // Save categories to localStorage and dispatch event whenever they change
  useEffect(() => {
    localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(categories))
    window.dispatchEvent(new CustomEvent('demo-menu-change', {
      detail: { categories, items }
    }))
  }, [categories, items])

  // Save items to localStorage and dispatch event whenever they change
  useEffect(() => {
    localStorage.setItem(DEMO_ITEMS_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('demo-menu-change', {
      detail: { categories, items }
    }))
  }, [items, categories])

  // Add category
  const addCategory = async (name: string) => {
    const newCategory: Category = {
      id: `demo-cat-${Date.now()}`,
      menu_id: menu.id,
      name,
      position: categories.length,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setCategories([...categories, newCategory])
    return newCategory
  }

  // Update category
  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    setCategories(categories.map(c =>
      c.id === categoryId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    ))
  }

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId))
    setItems(items.filter(i => i.category_id !== categoryId))
  }

  // Reorder categories
  const reorderCategories = async (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories.map((cat, index) => ({
      ...cat,
      position: index,
      updated_at: new Date().toISOString(),
    })))
  }

  // Add menu item
  const addMenuItem = async (categoryId: string, itemData: Partial<MenuItem>) => {
    const categoryItems = items.filter(i => i.category_id === categoryId)

    const newItem: MenuItem = {
      id: `demo-item-${Date.now()}`,
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

    setItems([...items, newItem])
    return newItem
  }

  // Update menu item
  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    setItems(items.map(i =>
      i.id === itemId ? { ...i, ...updates, updated_at: new Date().toISOString() } : i
    ))
  }

  // Delete menu item
  const deleteMenuItem = async (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId))
  }

  // Reorder items
  const reorderItems = async (categoryId: string, reorderedItems: MenuItem[]) => {
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      position: index,
      updated_at: new Date().toISOString(),
    }))

    setItems(items.map(item => {
      const updated = updatedItems.find(u => u.id === item.id)
      return updated || item
    }))
  }

  const refreshMenu = async () => {
    // No-op in demo mode
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
