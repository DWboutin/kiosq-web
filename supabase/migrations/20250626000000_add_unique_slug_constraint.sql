-- Migration to enforce unique slug translations across all languages
-- This ensures that all slug values within slug_translations are unique globally

BEGIN;

-- Drop the existing partial unique constraint on English slugs only
DROP INDEX IF EXISTS profiles_en_slug_idx;

-- Create a function to extract all slug values from slug_translations JSONB
CREATE OR REPLACE FUNCTION extract_all_slug_values(slug_translations JSONB)
RETURNS TEXT[] AS $$
BEGIN
  IF slug_translations IS NULL OR slug_translations = '{}'::jsonb THEN
    RETURN ARRAY[]::TEXT[];
  END IF;
  
  RETURN ARRAY(
    SELECT value::text
    FROM jsonb_each_text(slug_translations)
    WHERE value IS NOT NULL AND value != ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to check if a slug value exists in any profile's slug_translations
CREATE OR REPLACE FUNCTION check_slug_uniqueness(
  new_slug_translations JSONB, 
  excluding_profile_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  new_slugs TEXT[];
  existing_slug TEXT;
BEGIN
  -- Extract all slug values from the new slug_translations
  new_slugs := extract_all_slug_values(new_slug_translations);
  
  -- Check if any of the new slug values already exist in other profiles
  FOR existing_slug IN SELECT unnest(new_slugs) LOOP
    IF EXISTS (
      SELECT 1 
      FROM profiles p
      WHERE p.id != COALESCE(excluding_profile_id, uuid_nil())
        AND p.slug_translations ? (
          SELECT key 
          FROM jsonb_each_text(p.slug_translations) 
          WHERE value = existing_slug 
          LIMIT 1
        )
        AND NOT p.is_deleted
    ) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to enforce slug uniqueness
CREATE OR REPLACE FUNCTION enforce_slug_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_slug_uniqueness(NEW.slug_translations, NEW.id) THEN
    RAISE EXCEPTION 'Profile slug must be unique across all languages. One or more slug values already exist in another profile.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER profile_slug_uniqueness_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_slug_uniqueness();

CREATE TRIGGER profile_slug_uniqueness_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.slug_translations IS DISTINCT FROM NEW.slug_translations)
  EXECUTE FUNCTION enforce_slug_uniqueness();

-- Create an index to help with slug lookups (for performance)
CREATE INDEX idx_profiles_slug_translations_gin ON profiles USING GIN (slug_translations);

COMMIT; 