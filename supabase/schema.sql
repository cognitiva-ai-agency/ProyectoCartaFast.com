-- =====================================================
-- MenusCarta.com - Database Schema
-- Supabase PostgreSQL Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: restaurants
-- Stores restaurant information
-- =====================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255),
  owner_phone VARCHAR(50),
  password_hash TEXT NOT NULL,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  logo_url TEXT,
  logo_style VARCHAR(50) DEFAULT 'circular',
  theme_id VARCHAR(50) DEFAULT 'elegant',
  currency VARCHAR(10) DEFAULT 'CLP',
  timezone VARCHAR(100) DEFAULT 'America/Santiago',
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- =====================================================
-- TABLE: categories
-- Menu categories for each restaurant
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for restaurant queries
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_sort ON categories(restaurant_id, sort_order);

-- =====================================================
-- TABLE: items
-- Menu items (dishes) for each category
-- =====================================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  final_price DECIMAL(10, 2) GENERATED ALWAYS AS (
    base_price * (100 - COALESCE(discount_percentage, 0)) / 100
  ) STORED,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_promotion BOOLEAN DEFAULT false,
  calories INTEGER,
  preparation_time INTEGER,
  spicy_level INTEGER DEFAULT 0,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  allergens TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_items_restaurant ON items(restaurant_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_sort ON items(category_id, sort_order);
CREATE INDEX idx_items_promotion ON items(restaurant_id, is_promotion) WHERE is_promotion = true;

-- =====================================================
-- TABLE: ingredients
-- Available ingredients for each restaurant
-- =====================================================
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_allergen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, category, name)
);

-- Index for restaurant queries
CREATE INDEX idx_ingredients_restaurant ON ingredients(restaurant_id);
CREATE INDEX idx_ingredients_category ON ingredients(restaurant_id, category);

-- =====================================================
-- TABLE: item_ingredients
-- Many-to-many relationship between items and ingredients
-- =====================================================
CREATE TABLE item_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, ingredient_id)
);

-- Indexes
CREATE INDEX idx_item_ingredients_item ON item_ingredients(item_id);
CREATE INDEX idx_item_ingredients_ingredient ON item_ingredients(ingredient_id);

-- =====================================================
-- TABLE: unavailable_ingredients
-- Temporarily unavailable ingredients
-- =====================================================
CREATE TABLE unavailable_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  reason VARCHAR(255),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, ingredient_id)
);

-- Index for restaurant queries
CREATE INDEX idx_unavailable_ingredients_restaurant ON unavailable_ingredients(restaurant_id);

-- =====================================================
-- TABLE: scheduled_discounts
-- Scheduled discounts for categories
-- =====================================================
CREATE TABLE scheduled_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active discounts
CREATE INDEX idx_scheduled_discounts_restaurant ON scheduled_discounts(restaurant_id);
CREATE INDEX idx_scheduled_discounts_active ON scheduled_discounts(restaurant_id, is_active) WHERE is_active = true;

-- =====================================================
-- TABLE: promotion_banners
-- Promotional banners for restaurants
-- =====================================================
CREATE TABLE promotion_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  is_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS: Auto-update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_discounts_updated_at BEFORE UPDATE ON scheduled_discounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_banners_updated_at BEFORE UPDATE ON promotion_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS: Table documentation
-- =====================================================
COMMENT ON TABLE restaurants IS 'Stores restaurant profiles and configuration';
COMMENT ON TABLE categories IS 'Menu categories for each restaurant';
COMMENT ON TABLE items IS 'Menu items (dishes) with pricing and details';
COMMENT ON TABLE ingredients IS 'Available ingredients library per restaurant';
COMMENT ON TABLE item_ingredients IS 'Links items to their ingredients';
COMMENT ON TABLE unavailable_ingredients IS 'Temporarily unavailable ingredients';
COMMENT ON TABLE scheduled_discounts IS 'Time-based automatic discounts';
COMMENT ON TABLE promotion_banners IS 'Promotional banners displayed on menus';
