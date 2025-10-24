-- MenusCarta Database Schema for Supabase
-- Execute this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('admin', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes table (predefined themes)
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  preview_image TEXT,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL identifier (e.g., 'restoran1')
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
  qr_code_url TEXT,
  password_hash TEXT NOT NULL, -- Hashed password for client login
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menus table
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_promotion BOOLEAN DEFAULT false,
  promotion_price DECIMAL(10,2),
  allergens TEXT[], -- Array of allergen names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions table (Happy Hours, etc.)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_fixed DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) IS NULL OR (SELECT bool_and(d >= 0 AND d <= 6) FROM unnest(days_of_week) d)),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'items')),
  category_ids UUID[],
  item_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_menu_id ON public.categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_categories_position ON public.categories(position);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON public.menu_items(position);
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant_id ON public.promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON public.promotions(start_date, end_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Themes policies (public read)
CREATE POLICY "Anyone can view active themes" ON public.themes
  FOR SELECT USING (is_active = true);

-- Restaurants policies
CREATE POLICY "Owners can view own restaurants" ON public.restaurants
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert own restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own restaurants" ON public.restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own restaurants" ON public.restaurants
  FOR DELETE USING (auth.uid() = owner_id);

-- Public read access for active restaurants (for menu display)
CREATE POLICY "Anyone can view active restaurants by slug" ON public.restaurants
  FOR SELECT USING (is_active = true);

-- Menus policies
CREATE POLICY "Owners can manage own restaurant menus" ON public.menus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = menus.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Public read access for active menus
CREATE POLICY "Anyone can view active menus" ON public.menus
  FOR SELECT USING (is_active = true);

-- Categories policies
CREATE POLICY "Owners can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.menus
      JOIN public.restaurants ON restaurants.id = menus.restaurant_id
      WHERE menus.id = categories.menu_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Public read access for visible categories
CREATE POLICY "Anyone can view visible categories" ON public.categories
  FOR SELECT USING (is_visible = true);

-- Menu Items policies
CREATE POLICY "Owners can manage menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.categories
      JOIN public.menus ON menus.id = categories.menu_id
      JOIN public.restaurants ON restaurants.id = menus.restaurant_id
      WHERE categories.id = menu_items.category_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Public read access for available items
CREATE POLICY "Anyone can view available items" ON public.menu_items
  FOR SELECT USING (is_available = true);

-- Promotions policies
CREATE POLICY "Owners can manage promotions" ON public.promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = promotions.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Public read access for active promotions
CREATE POLICY "Anyone can view active promotions" ON public.promotions
  FOR SELECT USING (is_active = true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Default Themes
-- =====================================================

INSERT INTO public.themes (name, description, config) VALUES
('Classic Elegance', 'Tema clásico y elegante con tonos oscuros',
'{
  "colors": {
    "primary": "#1C1C1E",
    "secondary": "#8E8E93",
    "accent": "#FF9500",
    "background": "#FFFFFF",
    "text": "#1C1C1E",
    "textSecondary": "#8E8E93"
  },
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "headingFont": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "fontSize": {
      "base": "16px",
      "heading": "32px",
      "small": "14px"
    }
  },
  "spacing": {
    "cardPadding": "24px",
    "sectionGap": "48px"
  },
  "borderRadius": "12px"
}'),

('Fresh & Modern', 'Tema moderno con tonos azules y verdes',
'{
  "colors": {
    "primary": "#007AFF",
    "secondary": "#34C759",
    "accent": "#5AC8FA",
    "background": "#F2F2F7",
    "text": "#1C1C1E",
    "textSecondary": "#636366"
  },
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "headingFont": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "fontSize": {
      "base": "16px",
      "heading": "36px",
      "small": "14px"
    }
  },
  "spacing": {
    "cardPadding": "20px",
    "sectionGap": "40px"
  },
  "borderRadius": "16px"
}'),

('Warm Bistro', 'Tema cálido y acogedor con tonos tierra',
'{
  "colors": {
    "primary": "#8B4513",
    "secondary": "#D2691E",
    "accent": "#FFD700",
    "background": "#FFF8DC",
    "text": "#3A3A3C",
    "textSecondary": "#8E8E93"
  },
  "typography": {
    "fontFamily": "Georgia, serif",
    "headingFont": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "fontSize": {
      "base": "17px",
      "heading": "34px",
      "small": "15px"
    }
  },
  "spacing": {
    "cardPadding": "28px",
    "sectionGap": "44px"
  },
  "borderRadius": "10px"
}'),

('Minimalist Dark', 'Tema minimalista con modo oscuro',
'{
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#C7C7CC",
    "accent": "#AF52DE",
    "background": "#1C1C1E",
    "text": "#FFFFFF",
    "textSecondary": "#AEAEB2"
  },
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "headingFont": "-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif",
    "fontSize": {
      "base": "16px",
      "heading": "38px",
      "small": "14px"
    }
  },
  "spacing": {
    "cardPadding": "24px",
    "sectionGap": "56px"
  },
  "borderRadius": "14px"
}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- REALTIME
-- =====================================================

-- Enable realtime for menu updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promotions;
