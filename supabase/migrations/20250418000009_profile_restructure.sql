-- Migration to restructure profiles table
-- Change to use unique UUID for each profile and add userId reference

-- Start transaction to ensure all changes succeed or fail together
BEGIN;

-- Create ENUM type for profile types
CREATE TYPE profile_type AS ENUM ('personal', 'vendor');

-- Temporarily save existing relationships
CREATE TEMP TABLE temp_profiles AS
SELECT * FROM profiles;

-- Drop materialized view that references profiles.type first
DROP TRIGGER IF EXISTS refresh_product_search_on_product_change ON products;
DROP TRIGGER IF EXISTS refresh_product_search_on_variant_change ON product_variants;
DROP TRIGGER IF EXISTS refresh_product_search_on_price_change ON product_prices;
DROP TRIGGER IF EXISTS refresh_product_search_on_inventory_change ON inventory;
DROP FUNCTION IF EXISTS refresh_product_search() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_search;

-- Drop related triggers and constraints first to avoid conflicts
DROP TRIGGER IF EXISTS set_timestamp_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_by_profiles ON profiles;

-- Drop primary key constraint and foreign key reference
ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;

-- Rename current id column to user_id to maintain relationship
ALTER TABLE profiles RENAME COLUMN id TO user_id;

-- Add a new UUID primary key column
ALTER TABLE profiles 
  ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();

-- Convert type column from VARCHAR to ENUM
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_type_check;
ALTER TABLE profiles ALTER COLUMN type DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN type TYPE profile_type USING type::profile_type;
ALTER TABLE profiles ALTER COLUMN type SET DEFAULT 'personal';

-- Re-establish foreign key relationship to users
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Restore timestamp triggers
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Restore updated_by trigger
CREATE TRIGGER set_updated_by_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

-- Update handle_auth_user_insert function to work with new structure
CREATE OR REPLACE FUNCTION handle_auth_user_insert()
RETURNS TRIGGER AS $$
DECLARE
  _user_exists BOOLEAN;
  _display_name TEXT;
  _slug TEXT;
BEGIN
  -- Check if user already exists (to handle potential duplicates)
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) INTO _user_exists;
  
  IF NOT _user_exists THEN
    -- Prepare display name with fallbacks
    _display_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User ' || substr(NEW.id::text, 1, 8)
    );
    
    -- Generate slug from display name
    _slug := lower(regexp_replace(_display_name, '[^a-zA-Z0-9]+', '-', 'g'));
    
    -- Insert with minimal required fields and explicit defaults for NULL values
    INSERT INTO public.users (
      id, 
      email, 
      display_name,
      role,
      created_at,
      updated_at,
      is_deleted
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''),
      _display_name,
      'user',
      NOW(),
      NOW(),
      FALSE
    );

    -- Check if profile already exists for this user (to handle potential duplicates)
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
      INSERT INTO public.profiles (
        id,
        user_id,
        type, 
        banner_image,
        name_translations,
        slug_translations,
        created_at,
        updated_at,
        is_deleted
      )
      VALUES (
        uuid_generate_v4(),
        NEW.id, 
        'personal'::profile_type, 
        NULL,
        jsonb_build_object('en', _display_name),
        jsonb_build_object('en', _slug),
        NOW(),
        NOW(),
        FALSE
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but allow auth to continue
  RAISE LOG 'Error in handle_auth_user_insert: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the materialized view with updated references
CREATE MATERIALIZED VIEW product_search AS
SELECT
  p.id,
  p.name_translations,
  p.description_translations,
  p.slug,
  p.main_image_url,
  p.status,
  p.is_featured,
  c.name_translations AS category_name,
  c.slug AS category_slug,
  u.display_name AS vendor_name,
  pr.slug_translations->>'en' AS vendor_slug,
  pr.type AS profile_type,
  MIN(pp.final_price) AS min_price,
  MAX(pp.final_price) AS max_price,
  COALESCE(SUM(i.quantity), 0) AS total_inventory
FROM
  products p
LEFT JOIN
  categories c ON p.category_id = c.id
LEFT JOIN
  users u ON p.user_id = u.id
LEFT JOIN
  profiles pr ON u.id = pr.user_id
LEFT JOIN
  product_variants pv ON p.id = pv.product_id
LEFT JOIN
  product_prices pp ON pv.id = pp.variant_id
LEFT JOIN
  inventory i ON pv.id = i.variant_id
WHERE
  p.status = 'published'
  AND NOT p.is_deleted
  AND NOT c.is_deleted
  AND NOT u.is_deleted
  AND (pp.effective_to IS NULL OR pp.effective_to > NOW())
GROUP BY
  p.id, c.name_translations, c.slug, u.display_name, pr.slug_translations, pr.type;

-- Create index on the materialized view
CREATE INDEX idx_product_search_name ON product_search USING GIN (name_translations);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_product_search()
RETURNS TRIGGER AS $$
BEGIN
  -- Regular refresh
  REFRESH MATERIALIZED VIEW product_search;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh the materialized view
CREATE TRIGGER refresh_product_search_on_product_change
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

CREATE TRIGGER refresh_product_search_on_variant_change
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

CREATE TRIGGER refresh_product_search_on_price_change
AFTER INSERT OR UPDATE OR DELETE ON product_prices
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

CREATE TRIGGER refresh_product_search_on_inventory_change
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

COMMIT; 