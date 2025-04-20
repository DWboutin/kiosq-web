-- Add new fields to profiles table
ALTER TABLE profiles ADD COLUMN banner_image TEXT;
ALTER TABLE profiles ADD COLUMN name_translations JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN slug_translations JSONB DEFAULT '{}';

-- Migrate existing data from users to profiles
UPDATE profiles p 
SET 
  banner_image = u.vendor_banner_image,
  name_translations = u.vendor_name_translations,
  slug_translations = jsonb_build_object('en', u.vendor_slug)
FROM users u
WHERE p.id = u.id 
  AND (u.vendor_banner_image IS NOT NULL 
       OR u.vendor_name_translations != '{}'
       OR u.vendor_slug IS NOT NULL);

-- Add index for slug translations
CREATE UNIQUE INDEX profiles_en_slug_idx ON profiles ((slug_translations->>'en')) 
WHERE slug_translations->>'en' IS NOT NULL;

-- Create GIN index on name translations for search
CREATE INDEX idx_profiles_name_translations ON profiles USING GIN (name_translations);

-- Add triggers for updated_by
CREATE TRIGGER set_updated_by_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

-- Drop product_search materialized view that references vendor_slug
DROP TRIGGER IF EXISTS refresh_product_search_on_product_change ON products;
DROP TRIGGER IF EXISTS refresh_product_search_on_variant_change ON product_variants;
DROP TRIGGER IF EXISTS refresh_product_search_on_price_change ON product_prices;
DROP TRIGGER IF EXISTS refresh_product_search_on_inventory_change ON inventory;
DROP FUNCTION IF EXISTS refresh_product_search() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_search;

-- Drop any unique constraint on vendor_slug
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_vendor_slug_key;

-- Remove old columns from users table
ALTER TABLE users DROP COLUMN vendor_banner_image;
ALTER TABLE users DROP COLUMN vendor_name_translations;
ALTER TABLE users DROP COLUMN vendor_slug;
ALTER TABLE users DROP COLUMN is_vendor;

-- Update the user creation function to match new schema
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
      created_at,
      updated_at,
      is_deleted
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''),
      _display_name,
      NOW(),
      NOW(),
      FALSE
    );

    -- Check if profile already exists (to handle potential duplicates)
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      INSERT INTO public.profiles (
        id, 
        type, 
        banner_image,
        name_translations,
        slug_translations,
        created_at,
        updated_at,
        is_deleted
      )
      VALUES (
        NEW.id, 
        'personal', 
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

-- Recreate materialized view with updated references
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
  profiles pr ON u.id = pr.id
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
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_search;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the materialized view
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