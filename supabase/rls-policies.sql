-- =====================================================
-- MenusCarta.com - Row Level Security Policies
-- Ensures data isolation between restaurants
-- =====================================================

-- =====================================================
-- Enable RLS on all tables
-- =====================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_banners ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY: restaurants
-- =====================================================

-- Allow public read access (for public menu display)
CREATE POLICY "Public can view restaurants"
  ON restaurants FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can update their own restaurant
CREATE POLICY "Users can update own restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access to restaurants"
  ON restaurants FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: categories
-- =====================================================

-- Public can view all categories (for public menu)
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage categories for their restaurant
CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE auth.uid()::text = id::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to categories"
  ON categories FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: items
-- =====================================================

-- Public can view all items (for public menu)
CREATE POLICY "Public can view items"
  ON items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage items for their restaurant
CREATE POLICY "Users can manage own items"
  ON items FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE auth.uid()::text = id::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to items"
  ON items FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: ingredients
-- =====================================================

-- Public can view ingredients (for allergen information)
CREATE POLICY "Public can view ingredients"
  ON ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage ingredients for their restaurant
CREATE POLICY "Users can manage own ingredients"
  ON ingredients FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE auth.uid()::text = id::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to ingredients"
  ON ingredients FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: item_ingredients
-- =====================================================

-- Public can view item-ingredient relationships
CREATE POLICY "Public can view item ingredients"
  ON item_ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage item-ingredient for their items
CREATE POLICY "Users can manage own item ingredients"
  ON item_ingredients FOR ALL
  TO authenticated
  USING (
    item_id IN (
      SELECT id FROM items WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE auth.uid()::text = id::text
      )
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to item ingredients"
  ON item_ingredients FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: unavailable_ingredients
-- =====================================================

-- Public can view unavailable ingredients
CREATE POLICY "Public can view unavailable ingredients"
  ON unavailable_ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage unavailable ingredients for their restaurant
CREATE POLICY "Users can manage own unavailable ingredients"
  ON unavailable_ingredients FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE auth.uid()::text = id::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to unavailable ingredients"
  ON unavailable_ingredients FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: scheduled_discounts
-- =====================================================

-- Public can view active scheduled discounts
CREATE POLICY "Public can view scheduled discounts"
  ON scheduled_discounts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage scheduled discounts for their restaurant
CREATE POLICY "Users can manage own scheduled discounts"
  ON scheduled_discounts FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE auth.uid()::text = id::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to scheduled discounts"
  ON scheduled_discounts FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- POLICY: promotion_banners
-- =====================================================

-- Public can view promotion banners
CREATE POLICY "Public can view promotion banners"
  ON promotion_banners FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage banners for their restaurant
CREATE POLICY "Users can manage own promotion banners"
  ON promotion_banners FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE auth.uid()::text = id::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to promotion banners"
  ON promotion_banners FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- NOTES:
-- - anon: unauthenticated users (public menu viewers)
-- - authenticated: logged-in restaurant owners
-- - service_role: backend API with full privileges
-- =====================================================
