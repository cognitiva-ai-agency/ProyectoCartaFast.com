/**
 * Core types for MenusCarta application
 */

export interface Restaurant {
  id: string
  name: string
  slug: string // Unique URL identifier (e.g., 'restoran1')
  owner_id: string
  created_at: string
  updated_at: string
  theme_id: string
  qr_code_url?: string
  is_active?: boolean
}

export interface Menu {
  id: string
  restaurant_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  menu_id: string
  name: string
  description?: string
  image_url?: string
  position: number
  is_visible: boolean
  created_at: string
  updated_at?: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description?: string
  base_price?: number // Base price before discounts
  discount_percentage?: number // Discount percentage (0-100)
  final_price?: number // Calculated price (generated in DB)
  image_url?: string
  position: number // For ordering (maps to sort_order in DB)
  is_available: boolean
  is_promotion: boolean
  allergens?: string[]
  ingredients?: string[] // Main ingredients for filtering
  created_at: string
  updated_at: string

  // Legacy fields for backward compatibility
  price?: number // Use base_price instead (required if base_price not provided)
  promotion_price?: number // Use discount_percentage instead
}

export interface Theme {
  id: string
  name: string
  description: string
  preview_image?: string
  config: ThemeConfig
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    textSecondary: string
  }
  typography: {
    fontFamily: string
    headingFont: string
    fontSize: {
      base: string
      heading: string
      small: string
    }
  }
  spacing: {
    cardPadding: string
    sectionGap: string
  }
  borderRadius: string
  currency?: string // Currency code (EUR, USD, MXN, etc.)
}

export interface Promotion {
  id: string
  restaurant_id: string
  name: string
  description?: string
  discount_percentage?: number
  discount_fixed?: number
  start_date: string
  end_date: string
  days_of_week?: number[] // 0 = Sunday, 6 = Saturday
  start_time?: string // HH:mm format
  end_time?: string // HH:mm format
  is_active: boolean
  applies_to?: 'all' | 'category' | 'items'
  category_ids?: string[]
  item_ids?: string[]
}

/**
 * Scheduled Discount - Automatic time-based discounts by category
 * Used for recurring promotions like happy hours
 */
export interface ScheduledDiscount {
  id: string
  restaurant_id: string
  name: string // e.g., "Happy Hour Bebidas"
  category_id: string
  discount_percentage: number // Discount percentage (0-100)
  days_of_week: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string // Format "HH:mm" (e.g., "17:00")
  end_time: string // Format "HH:mm" (e.g., "19:00")
  is_active: boolean // Whether the schedule is enabled
  created_at: string
  updated_at: string
}

/**
 * Container for storing scheduled discounts in filesystem
 */
export interface ScheduledDiscountsConfig {
  discounts: ScheduledDiscount[]
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'owner'
  created_at: string
}

// UI Types
export type DragItem = {
  id: string
  type: 'category' | 'item'
  position: number
}

export type ViewMode = 'edit' | 'preview'
