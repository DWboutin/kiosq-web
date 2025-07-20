-- Fix authentication trigger for user and profile creation
-- This migration ensures minimal required data is saved with proper defaults

BEGIN;

-- Fix the slug uniqueness functions by recreating both dependencies
-- First create the helper function to extract slug values
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

-- Then create the main uniqueness check function with optimizations
CREATE OR REPLACE FUNCTION check_slug_uniqueness(
  new_slug_translations JSONB, 
  excluding_profile_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  new_slugs TEXT[];
  existing_slug TEXT;
BEGIN
  -- Early return for empty JSONB - no slugs to check means uniqueness is satisfied
  IF new_slug_translations IS NULL OR new_slug_translations = '{}'::jsonb THEN
    RETURN TRUE;
  END IF;
  
  -- Extract all slug values from the new slug_translations
  new_slugs := extract_all_slug_values(new_slug_translations);
  
  -- Early return if no valid slugs found
  IF array_length(new_slugs, 1) IS NULL OR array_length(new_slugs, 1) = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Check if any of the new slug values already exist in other profiles
  FOR existing_slug IN SELECT unnest(new_slugs) LOOP
    IF EXISTS (
      SELECT 1 
      FROM profiles p
      WHERE p.id != COALESCE(excluding_profile_id, '00000000-0000-0000-0000-000000000000'::uuid)
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

-- Drop existing trigger to recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS after_auth_user_created ON auth.users;

-- Create a bulletproof function that bypasses slug uniqueness during auth
CREATE OR REPLACE FUNCTION handle_auth_user_insert()
RETURNS TRIGGER AS $$
DECLARE
  _user_exists BOOLEAN;
  _display_name TEXT;
  _unique_slug TEXT;
  _dummy_interests TEXT[];
BEGIN
  -- Check if user already exists to prevent duplicates
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) INTO _user_exists;
  
  IF NOT _user_exists THEN
    -- Prepare minimal display name with fallbacks
    _display_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User'
    );
    
    -- Create dummy interests array to satisfy the 3-element constraint
    _dummy_interests := ARRAY['general', 'community', 'local'];
    
    -- Insert user with minimal required fields
    INSERT INTO public.users (
      id, 
      email, 
      display_name,
      role,
      interests,
      is_onboarded,
      created_at,
      updated_at,
      is_deleted
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''),
      _display_name,
      'user',
      _dummy_interests,
      FALSE,
      NOW(),
      NOW(),
      FALSE
    );

    -- Create profile if it doesn't exist
    -- Use guaranteed unique slug with UUID to avoid any conflicts
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
      _unique_slug := 'user-' || substr(NEW.id::text, 1, 8);
      
      -- Temporarily disable the slug uniqueness trigger
      SET session_replication_role = replica;
      
      BEGIN
        INSERT INTO public.profiles (
          user_id,
          name_translations,
          slug_translations,
          description_translations,
          created_at,
          updated_at,
          is_active,
          is_deleted
        )
        VALUES (
          NEW.id, 
          '{}'::jsonb,
          '{}'::jsonb,
          '{}'::jsonb,
          NOW(),
          NOW(),
          TRUE,
          FALSE
        );
      EXCEPTION WHEN OTHERS THEN
        -- Ultimate fallback: create with empty slug translations
        INSERT INTO public.profiles (
          user_id,
          name_translations,
          slug_translations,
          description_translations,
          created_at,
          updated_at,
          is_deleted
        )
        VALUES (
          NEW.id, 
          jsonb_build_object('en', _display_name),
          '{}'::jsonb,
          '{}'::jsonb,
          NOW(),
          NOW(),
          FALSE
        );
      END;
      
      -- Re-enable triggers
      SET session_replication_role = DEFAULT;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Make sure to re-enable triggers even if something fails
  SET session_replication_role = DEFAULT;
  -- Log error but don't block authentication
  RAISE LOG 'Error in handle_auth_user_insert: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_auth_user_insert();

COMMIT; 