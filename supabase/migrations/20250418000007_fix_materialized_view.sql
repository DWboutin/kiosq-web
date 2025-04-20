-- Drop existing materialized view and related triggers to avoid conflicts
DROP TRIGGER IF EXISTS refresh_product_search_on_product_change ON products;
DROP TRIGGER IF EXISTS refresh_product_search_on_variant_change ON product_variants;
DROP TRIGGER IF EXISTS refresh_product_search_on_price_change ON product_prices;
DROP TRIGGER IF EXISTS refresh_product_search_on_inventory_change ON inventory;
DROP FUNCTION IF EXISTS refresh_product_search() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_search;

-- Recreate the materialized view with proper ownership
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

-- Create function to refresh the materialized view - removed CONCURRENTLY which requires a unique index
CREATE OR REPLACE FUNCTION refresh_product_search()
RETURNS TRIGGER AS $$
BEGIN
  -- Changed from CONCURRENTLY to regular refresh to avoid error
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

-- Create a function to handle materialized view when deleting categories
CREATE OR REPLACE FUNCTION handle_category_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Set products' category_id to NULL where it matches the deleted category
  UPDATE products 
  SET category_id = NULL 
  WHERE category_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle materialized view when deleting categories
CREATE TRIGGER category_delete_trigger
BEFORE DELETE ON categories
FOR EACH ROW
EXECUTE FUNCTION handle_category_delete(); 