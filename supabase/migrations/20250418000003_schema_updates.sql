-- Update profiles table: remove metadata and change role to type
ALTER TABLE profiles DROP COLUMN metadata;  
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ALTER COLUMN role TYPE VARCHAR(20);
ALTER TABLE profiles RENAME COLUMN role TO type;

-- Add type check constraint for the new field
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_type_check 
  CHECK (type IN ('personal', 'vendor'));

-- Update existing profiles to use the new type values
UPDATE profiles 
  SET type = CASE 
    WHEN type = 'user' THEN 'personal'
    WHEN type = 'vendor' THEN 'vendor'
    WHEN type = 'admin' THEN 'vendor'
    ELSE 'personal'
  END;

-- Drop materialized view and triggers that reference categories.slug
DROP TRIGGER IF EXISTS refresh_product_search_on_product_change ON products;
DROP TRIGGER IF EXISTS refresh_product_search_on_variant_change ON product_variants;
DROP TRIGGER IF EXISTS refresh_product_search_on_price_change ON product_prices;
DROP TRIGGER IF EXISTS refresh_product_search_on_inventory_change ON inventory;
DROP FUNCTION IF EXISTS refresh_product_search();
DROP MATERIALIZED VIEW IF EXISTS product_search;

-- Change categories.slug to handle translations
ALTER TABLE categories ALTER COLUMN slug TYPE JSONB USING jsonb_build_object('en', slug);
ALTER TABLE categories ALTER COLUMN slug SET DEFAULT '{}';

-- Add unique constraint for English slug to maintain uniqueness
CREATE UNIQUE INDEX categories_en_slug_idx ON categories ((slug->>'en'));

-- Add updated_by field to relevant tables
ALTER TABLE products ADD COLUMN updated_by UUID REFERENCES users(id);
ALTER TABLE product_variants ADD COLUMN updated_by UUID REFERENCES users(id);
ALTER TABLE categories ADD COLUMN updated_by UUID REFERENCES users(id);
ALTER TABLE inventory ADD COLUMN updated_by UUID REFERENCES users(id);
ALTER TABLE product_prices ADD COLUMN updated_by UUID REFERENCES users(id);
ALTER TABLE tax_components ADD COLUMN updated_by UUID REFERENCES users(id);

-- Create function to auto-set updated_by field
CREATE OR REPLACE FUNCTION trigger_set_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to set updated_by field automatically
CREATE TRIGGER set_updated_by_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

CREATE TRIGGER set_updated_by_product_variants
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

CREATE TRIGGER set_updated_by_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

CREATE TRIGGER set_updated_by_inventory
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

CREATE TRIGGER set_updated_by_product_prices
BEFORE UPDATE ON product_prices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

CREATE TRIGGER set_updated_by_tax_components
BEFORE UPDATE ON tax_components
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

-- Recreate materialized view with updated slug field reference
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
  u.vendor_slug,
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
  p.id, c.name_translations, c.slug, u.display_name, u.vendor_slug;

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

-- Update create_user_and_profile function to match new structure
CREATE OR REPLACE FUNCTION handle_auth_user_insert()
RETURNS TRIGGER AS $$
DECLARE
  _user_exists BOOLEAN;
BEGIN
  -- Check if user already exists (to handle potential duplicates)
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) INTO _user_exists;
  
  IF NOT _user_exists THEN
    -- Insert with minimal required fields and explicit defaults for NULL values
    INSERT INTO public.users (
      id, 
      email, 
      display_name,
      is_vendor,
      vendor_name_translations,
      created_at,
      updated_at,
      is_deleted
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''),
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        split_part(COALESCE(NEW.email, ''), '@', 1),
        'User ' || substr(NEW.id::text, 1, 8)
      ),
      FALSE,
      '{}'::jsonb,
      NOW(),
      NOW(),
      FALSE
    );

    -- Check if profile already exists (to handle potential duplicates)
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      INSERT INTO public.profiles (id, type, created_at, updated_at, is_deleted)
      VALUES (NEW.id, 'personal', NOW(), NOW(), FALSE);
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but allow auth to continue
  RAISE LOG 'Error in handle_auth_user_insert: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 