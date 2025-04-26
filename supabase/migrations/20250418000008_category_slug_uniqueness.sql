-- Ensure category slug uniqueness across all languages
-- This migration adds a trigger that checks for uniqueness of category slugs
-- across all languages in the JSONB slug field

-- Function to ensure slug uniqueness across all languages
CREATE OR REPLACE FUNCTION check_category_slug_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
  lang TEXT;
  slug_value TEXT;
  conflicting_category UUID;
BEGIN
  -- Check each key/value pair in the JSONB
  FOR lang, slug_value IN SELECT * FROM jsonb_each_text(NEW.slug)
  LOOP
    -- Skip empty values
    IF slug_value IS NOT NULL AND slug_value != '' THEN
      -- Check if this slug exists in ANY language in ANY other category
      SELECT id INTO conflicting_category
      FROM categories
      WHERE id != NEW.id 
        AND (slug @> jsonb_build_object(lang, slug_value) 
             OR slug ?& array[lang] AND slug->>lang = slug_value)
        AND NOT is_deleted;
      
      IF conflicting_category IS NOT NULL THEN
        RAISE EXCEPTION 'Slug "%" already exists in language "%"', slug_value, lang;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the categories table
CREATE TRIGGER enforce_category_slug_uniqueness
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION check_category_slug_uniqueness();

-- Drop the old index that only enforced uniqueness on English slugs
DROP INDEX IF EXISTS categories_en_slug_idx;

-- Create a new index optimized for the slug lookups performed in the trigger
CREATE INDEX idx_categories_slug_jsonb ON categories USING gin (slug jsonb_path_ops)
WHERE NOT is_deleted;

-- Add comment to explain this constraint
COMMENT ON FUNCTION check_category_slug_uniqueness() IS 
  'Ensures that category slugs are unique across all languages, preventing duplicates even in different language keys.'; 