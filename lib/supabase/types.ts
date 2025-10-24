/**
 * TypeScript Types for Supabase Database
 * Auto-generated types based on schema.sql
 */

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant
        Insert: RestaurantInsert
        Update: RestaurantUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      items: {
        Row: MenuItem
        Insert: MenuItemInsert
        Update: MenuItemUpdate
      }
      ingredients: {
        Row: Ingredient
        Insert: IngredientInsert
        Update: IngredientUpdate
      }
      item_ingredients: {
        Row: ItemIngredient
        Insert: ItemIngredientInsert
        Update: ItemIngredientUpdate
      }
      unavailable_ingredients: {
        Row: UnavailableIngredient
        Insert: UnavailableIngredientInsert
        Update: UnavailableIngredientUpdate
      }
      scheduled_discounts: {
        Row: ScheduledDiscount
        Insert: ScheduledDiscountInsert
        Update: ScheduledDiscountUpdate
      }
      promotion_banners: {
        Row: PromotionBanner
        Insert: PromotionBannerInsert
        Update: PromotionBannerUpdate
      }
    }
  }
}

// Restaurant Types
export interface Restaurant {
  id: string
  slug: string
  name: string
  owner_email: string | null
  owner_phone: string | null
  password_hash: string
  subscription_plan: string
  subscription_status: string
  trial_ends_at: string | null
  logo_url: string | null
  logo_style: string
  theme_id: string
  currency: string
  timezone: string
  is_demo: boolean
  created_at: string
  updated_at: string
}

export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>
export type RestaurantUpdate = Partial<RestaurantInsert>

// Category Types
export interface Category {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>
export type CategoryUpdate = Partial<CategoryInsert>

// MenuItem Types
export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  description: string | null
  base_price: number
  discount_percentage: number
  final_price: number
  image_url: string | null
  sort_order: number
  is_available: boolean
  is_promotion: boolean
  calories: number | null
  preparation_time: number | null
  spicy_level: number
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  allergens: string[] | null
  created_at: string
  updated_at: string
}

export type MenuItemInsert = Omit<MenuItem, 'id' | 'final_price' | 'created_at' | 'updated_at'>
export type MenuItemUpdate = Partial<MenuItemInsert>

// Ingredient Types
export interface Ingredient {
  id: string
  restaurant_id: string
  category: string
  name: string
  is_allergen: boolean
  created_at: string
  updated_at: string
}

export type IngredientInsert = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>
export type IngredientUpdate = Partial<IngredientInsert>

// ItemIngredient Types
export interface ItemIngredient {
  id: string
  item_id: string
  ingredient_id: string
  is_optional: boolean
  created_at: string
}

export type ItemIngredientInsert = Omit<ItemIngredient, 'id' | 'created_at'>
export type ItemIngredientUpdate = Partial<ItemIngredientInsert>

// UnavailableIngredient Types
export interface UnavailableIngredient {
  id: string
  restaurant_id: string
  ingredient_id: string
  reason: string | null
  marked_at: string
}

export type UnavailableIngredientInsert = Omit<UnavailableIngredient, 'id' | 'marked_at'>
export type UnavailableIngredientUpdate = Partial<UnavailableIngredientInsert>

// ScheduledDiscount Types
export interface ScheduledDiscount {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  discount_percentage: number
  start_time: string
  end_time: string
  days_of_week: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ScheduledDiscountInsert = Omit<ScheduledDiscount, 'id' | 'created_at' | 'updated_at'>
export type ScheduledDiscountUpdate = Partial<ScheduledDiscountInsert>

// PromotionBanner Types
export interface PromotionBanner {
  id: string
  restaurant_id: string
  title: string
  subtitle: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type PromotionBannerInsert = Omit<PromotionBanner, 'id' | 'created_at' | 'updated_at'>
export type PromotionBannerUpdate = Partial<PromotionBannerInsert>
