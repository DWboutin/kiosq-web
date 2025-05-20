-- Migration to fix RLS policies for products and related tables
-- This migration drops all existing policies and recreates them with the correct structure

BEGIN;

-- 1. Ensure the product_status type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('published', 'draft', 'deleted');
  END IF;
END $$;

-- 2. Ensure the status column exists on products table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    ALTER TABLE products ADD COLUMN status product_status DEFAULT 'draft';
  END IF;
END $$;

-- 3. Drop all existing product-related policies
DROP POLICY IF EXISTS products_view_published ON products;
DROP POLICY IF EXISTS products_view_own ON products;
DROP POLICY IF EXISTS products_update_own ON products;
DROP POLICY IF EXISTS products_insert_own ON products;
DROP POLICY IF EXISTS products_delete_own ON products;

DROP POLICY IF EXISTS product_variants_view_published ON product_variants;
DROP POLICY IF EXISTS product_variants_insert_own ON product_variants;
DROP POLICY IF EXISTS product_variants_update_own ON product_variants;
DROP POLICY IF EXISTS product_variants_delete_own ON product_variants;

DROP POLICY IF EXISTS product_prices_view_all ON product_prices;
DROP POLICY IF EXISTS product_prices_insert_own ON product_prices;
DROP POLICY IF EXISTS product_prices_update_own ON product_prices;
DROP POLICY IF EXISTS product_prices_delete_own ON product_prices;

-- 4. Create new products policies

-- 4.1 Public read access for published products
CREATE POLICY products_view_published ON products
  FOR SELECT
  TO authenticated, anon
  USING (status = 'published' AND NOT is_deleted);

-- 4.2 Owners can view their own products regardless of status
CREATE POLICY products_view_own ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = products.profile_id
    )
  );

-- 4.3 Owners can create new products
CREATE POLICY products_insert_own ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = products.profile_id
    )
  );

-- 4.4 Owners can update their own products
CREATE POLICY products_update_own ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = products.profile_id
    )
  );

-- 4.5 Owners can delete their own products
CREATE POLICY products_delete_own ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = products.profile_id
    )
  );

-- 5. Create new product_variants policies

-- 5.1 Public read access for variants of published products
CREATE POLICY product_variants_view_published ON product_variants
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.status = 'published'
      AND NOT products.is_deleted
    ) AND NOT is_deleted
  );

-- 5.2 Owners can view their own variants regardless of product status
CREATE POLICY product_variants_view_own ON product_variants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.id = products.profile_id
      )
    )
  );

-- 5.3 Owners can create variants for their own products
CREATE POLICY product_variants_insert_own ON product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.id = products.profile_id
      )
    )
  );

-- 5.4 Owners can update their own variants
CREATE POLICY product_variants_update_own ON product_variants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.id = products.profile_id
      )
    )
  );

-- 5.5 Owners can delete their own variants
CREATE POLICY product_variants_delete_own ON product_variants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.id = products.profile_id
      )
    )
  );

-- 6. Create new product_prices policies

-- 6.1 Public read access for prices of published products
CREATE POLICY product_prices_view_all ON product_prices
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM product_variants
      WHERE product_variants.id = product_prices.variant_id
      AND NOT product_variants.is_deleted
      AND EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_variants.product_id
        AND products.status = 'published'
        AND NOT products.is_deleted
      )
    )
  );

-- 6.2 Owners can view their own prices regardless of product status
CREATE POLICY product_prices_view_own ON product_prices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_variants
      WHERE product_variants.id = product_prices.variant_id
      AND EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_variants.product_id
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.id = products.profile_id
        )
      )
    )
  );

-- 6.3 Owners can create prices for their own variants
CREATE POLICY product_prices_insert_own ON product_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_variants
      WHERE product_variants.id = product_prices.variant_id
      AND EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_variants.product_id
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.id = products.profile_id
        )
      )
    )
  );

-- 6.4 Owners can update their own prices
CREATE POLICY product_prices_update_own ON product_prices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_variants
      WHERE product_variants.id = product_prices.variant_id
      AND EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_variants.product_id
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.id = products.profile_id
        )
      )
    )
  );

-- 6.5 Owners can delete their own prices
CREATE POLICY product_prices_delete_own ON product_prices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_variants
      WHERE product_variants.id = product_prices.variant_id
      AND EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_variants.product_id
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.id = products.profile_id
        )
      )
    )
  );

-- 7. Update server action to explicitly set status when creating products
CREATE OR REPLACE FUNCTION set_default_product_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is NULL, set it to 'draft'
  IF NEW.status IS NULL THEN
    NEW.status = 'draft';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure status is set
DROP TRIGGER IF EXISTS trigger_set_default_product_status ON products;
CREATE TRIGGER trigger_set_default_product_status
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_default_product_status();

-- Add comments to document the policies
COMMENT ON TABLE products IS 'Products with RLS policies for CRUD operations by owners and public read access';
COMMENT ON TABLE product_variants IS 'Product variants with RLS policies for CRUD operations by product owners and public read access';
COMMENT ON TABLE product_prices IS 'Product prices with RLS policies for CRUD operations by product owners and public read access';

COMMIT;