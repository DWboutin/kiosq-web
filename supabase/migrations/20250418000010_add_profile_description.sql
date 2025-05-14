-- Add description_translations column to profiles table
-- This migration adds a JSONB column for multilingual profile descriptions

BEGIN;

-- Add the description_translations column
ALTER TABLE profiles ADD COLUMN description_translations JSONB DEFAULT '{}';

-- Create GIN index for description_translations to improve search performance
CREATE INDEX idx_profiles_description_translations ON profiles USING GIN (description_translations);

-- Update the handle_auth_user_insert function to initialize the new column
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
        description_translations,
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
        '{}'::jsonb,
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

COMMIT; 