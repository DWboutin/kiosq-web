-- Migration to update products, product_variants, and related tables
-- Created: 2025-05-17

BEGIN;

-- Step 1: Create temporary tables to preserve data for migration
-- Map user_id to profile_id for products
CREATE TEMP TABLE temp_products AS 
SELECT 
  p.id, 
  p.user_id, 
  pr.id as profile_id,
  p.category_id,
  p.name_translations,
  p.description_translations,
  p.created_at,
  p.updated_at,
  p.is_deleted,
  p.is_featured
FROM products p
JOIN profiles pr ON p.user_id = pr.user_id;

-- Preserve inventory data to migrate to product_variants
CREATE TEMP TABLE temp_inventory AS
SELECT 
  pv.id as variant_id,
  i.quantity,
  i.unit
FROM inventory i
JOIN product_variants pv ON i.variant_id = pv.id;

-- Step 2: Drop dependent objects (materialized view, triggers, etc.)
DROP TRIGGER IF EXISTS refresh_product_search_on_product_change ON products;
DROP TRIGGER IF EXISTS refresh_product_search_on_variant_change ON product_variants;
DROP TRIGGER IF EXISTS refresh_product_search_on_price_change ON product_prices;
DROP TRIGGER IF EXISTS refresh_product_search_on_inventory_change ON inventory;
DROP FUNCTION IF EXISTS refresh_product_search() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_search;

-- Step 3: Drop tables to be removed completely
DROP TABLE IF EXISTS product_prices_2025;
DROP TABLE IF EXISTS product_taxes;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS tax_components;

-- Step 4: Check for views or functions that might reference the status column
DO $$
DECLARE
    view_name text;
    function_name text;
BEGIN
    -- Find and drop views that reference the status column
    FOR view_name IN (
        SELECT v.relname
        FROM pg_class v
        JOIN pg_depend d ON d.refobjid = v.oid
        JOIN pg_class t ON t.oid = d.objid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.objsubid
        WHERE v.relkind = 'v' 
          AND t.relname = 'products'
          AND a.attname = 'status'
    )
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_name || ' CASCADE';
    END LOOP;
    
    -- Find and drop functions that might reference the status column
    FOR function_name IN (
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_depend d ON d.refobjid = p.oid
        JOIN pg_class t ON t.oid = d.objid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.objsubid
        WHERE t.relname = 'products'
          AND a.attname = 'status'
    )
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || function_name || ' CASCADE';
    END LOOP;
END $$;

-- Step 5: Handle dependencies on columns
-- First, disable triggers temporarily
SET session_replication_role = replica;

-- Drop indexes that involve the columns we're changing
DROP INDEX IF EXISTS idx_products_user_id;
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_products_slug;

-- Step 6: Modify products table
-- Add new profile_id column first
ALTER TABLE products ADD COLUMN profile_id UUID;

-- Update products with profile_id data
UPDATE products p
SET profile_id = tp.profile_id
FROM temp_products tp
WHERE p.id = tp.id;

-- Set NOT NULL constraint after updating data
ALTER TABLE products ALTER COLUMN profile_id SET NOT NULL;

-- Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE products ADD CONSTRAINT products_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Now remove columns that are no longer needed - excluding status and user_id
ALTER TABLE products DROP COLUMN IF EXISTS features_translations;
ALTER TABLE products DROP COLUMN IF EXISTS slug;
ALTER TABLE products DROP COLUMN IF EXISTS metadata;
ALTER TABLE products DROP COLUMN IF EXISTS main_image_url;
ALTER TABLE products DROP COLUMN IF EXISTS additional_images;

-- Instead of dropping user_id, nullify it and make it nullable
-- This keeps any dependent objects working, but marks it as deprecated
COMMENT ON COLUMN products.user_id IS 'DEPRECATED: Use profile_id instead. Will be removed in a future migration.';
UPDATE products SET user_id = NULL;
ALTER TABLE products ALTER COLUMN user_id DROP NOT NULL;

-- Handle the status column the same way - deprecated but not dropped
COMMENT ON COLUMN products.status IS 'DEPRECATED: No longer used. Will be removed in a future migration.';
UPDATE products SET status = NULL;
ALTER TABLE products ALTER COLUMN status DROP NOT NULL;

-- Add checklist_translations column
ALTER TABLE products ADD COLUMN checklist_translations JSONB DEFAULT '{}';

-- Re-enable triggers
SET session_replication_role = default;

-- Step 7: Modify product_variants table
ALTER TABLE product_variants ADD COLUMN quantity NUMERIC(10,2) DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN unit VARCHAR(20) DEFAULT 'piece' 
  CHECK (unit IN ('piece', 'gram', 'kilogram', 'milliliter', 'liter'));

-- Step 8: Update product_variants with inventory data
UPDATE product_variants pv
SET 
  quantity = ti.quantity,
  unit = ti.unit
FROM temp_inventory ti
WHERE pv.id = ti.variant_id;

-- Step 9: Create product_variants_images bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-variants-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'product-variants-images',
      'product-variants-images',
      true, -- Set to public to allow direct access via public URLs
      10485760, -- 10MB size limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[] -- Allowed image types
    );
  ELSE
    -- Update existing bucket to be public
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'product-variants-images';
  END IF;
END $$;

-- Step 10: Set up RLS policies for product_variants_images bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Product variant images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can upload their own product variant images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update their own product variant images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any product variant images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete their own product variant images" ON storage.objects;

-- POLICY 1: Allow all users to view product variant images
CREATE POLICY "Product variant images are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-variants-images');

-- POLICY 2: Allow vendors to upload their own product variant images
-- Path format: profile_id/product_id/variant_id_[purpose].ext
CREATE POLICY "Vendors can upload their own product variant images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-variants-images' AND
  EXISTS (
    SELECT 1 
    FROM products p
    JOIN product_variants pv ON p.id = pv.product_id
    WHERE 
      p.profile_id::text = split_part(name, '/', 1) AND
      p.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
);

-- POLICY 3: Allow vendors to update their own product variant images
CREATE POLICY "Vendors can update their own product variant images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-variants-images' AND
  EXISTS (
    SELECT 1 
    FROM products p
    JOIN product_variants pv ON p.id = pv.product_id
    WHERE 
      p.profile_id::text = split_part(name, '/', 1) AND
      p.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
);

-- POLICY 4: Allow admin users to delete any product variant images
CREATE POLICY "Admins can delete any product variant images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-variants-images' AND
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- POLICY 5: Allow vendors can delete their own product variant images
CREATE POLICY "Vendors can delete their own product variant images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-variants-images' AND
  EXISTS (
    SELECT 1 
    FROM products p
    JOIN product_variants pv ON p.id = pv.product_id
    WHERE 
      p.profile_id::text = split_part(name, '/', 1) AND
      p.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
);

-- Step 11: Create function to delete product variant images when a variant is deleted
CREATE OR REPLACE FUNCTION delete_product_variant_images()
RETURNS TRIGGER AS $$
DECLARE
  _product_id UUID;
  _profile_id UUID;
BEGIN
  -- Get the product_id and profile_id for this variant
  SELECT p.id, p.profile_id INTO _product_id, _profile_id
  FROM products p
  WHERE p.id = OLD.product_id;

  -- Delete all images for this variant
  EXECUTE format('
    DELETE FROM storage.objects
    WHERE 
      bucket_id = ''product-variants-images'' AND 
      name LIKE ''%s/%s/%s_%%''
  ', _profile_id, _product_id, OLD.id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to automatically delete variant images when a variant is deleted
DROP TRIGGER IF EXISTS trigger_delete_product_variant_images ON product_variants;
CREATE TRIGGER trigger_delete_product_variant_images
AFTER DELETE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION delete_product_variant_images();

-- Step 12: Update existing indexes and add new ones
CREATE INDEX idx_products_profile_id ON products(profile_id);

COMMIT; 