-- Migration to add RLS policies for products, product_variants, and product_prices
-- This migration adds proper INSERT, UPDATE, and DELETE policies for authenticated users

BEGIN;

-- Create product_status ENUM type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('published', 'draft', 'deleted');
  END IF;
END $$;

-- Add status column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS status product_status DEFAULT 'draft';

-- Products policies
-- Allow authenticated users to create new products linked to their profiles
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

-- Allow authenticated users to update their own products
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

-- Allow authenticated users to delete their own products
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

-- Product Variants policies
-- Allow authenticated users to create product variants for their own products
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

-- Allow authenticated users to update their own product variants
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

-- Allow authenticated users to delete their own product variants
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

-- Product Prices policies
-- Allow authenticated users to create product prices for their own product variants
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

-- Allow authenticated users to update their own product prices
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

-- Allow authenticated users to delete their own product prices
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

-- Public read access policies
-- These policies ensure all products, variants and prices are readable publicly
-- Some of these might already exist, but we're setting them explicitly for clarity

-- Ensure products are publicly readable
DROP POLICY IF EXISTS products_view_published ON products;
CREATE POLICY products_view_published ON products
  FOR SELECT
  TO authenticated, anon
  USING (status = 'published' AND NOT is_deleted);

-- Ensure product variants are publicly readable
DROP POLICY IF EXISTS product_variants_view_published ON product_variants;
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

-- Ensure product prices are publicly readable
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

-- Add comments to document the policies
COMMENT ON TABLE products IS 'Products with RLS policies for CRUD operations by owners and public read access';
COMMENT ON TABLE product_variants IS 'Product variants with RLS policies for CRUD operations by product owners and public read access';
COMMENT ON TABLE product_prices IS 'Product prices with RLS policies for CRUD operations by product owners and public read access';

COMMIT;