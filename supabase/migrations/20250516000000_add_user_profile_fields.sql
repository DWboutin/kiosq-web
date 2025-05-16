-- Migration to add user profile fields to the users table
-- Users get either geolocation or postal code for location-based services

BEGIN;

-- Add new columns to users table
ALTER TABLE users
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN postal_code TEXT,
  ADD COLUMN latitude DECIMAL(9,6),
  ADD COLUMN longitude DECIMAL(9,6),
  ADD COLUMN search_radius INTEGER DEFAULT 100 CHECK (search_radius >= 50 AND search_radius <= 500),
  ADD COLUMN interests TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN is_onboarded BOOLEAN NOT NULL DEFAULT FALSE;

-- Add check constraint to ensure either postal_code or geolocation is provided
-- But allow both to be NULL for existing users
ALTER TABLE users
  ADD CONSTRAINT postal_code_or_geolocation_check 
  CHECK (
    (postal_code IS NOT NULL AND (latitude IS NULL OR longitude IS NULL)) OR 
    (postal_code IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL) OR
    (postal_code IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL) OR
    (postal_code IS NULL AND (latitude IS NULL OR longitude IS NULL))
  );

-- Add check constraint to ensure interests has exactly 3 elements
ALTER TABLE users
  ADD CONSTRAINT interests_length_check
  CHECK (array_length(interests, 1) = 3);

-- Add index for location-based queries
CREATE INDEX idx_users_postal_code ON users(postal_code) WHERE postal_code IS NOT NULL;
CREATE INDEX idx_users_coordinates ON users(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_users_interests ON users USING GIN (interests);
CREATE INDEX idx_users_is_onboarded ON users(is_onboarded);

-- Update the handle_auth_user_insert function to handle new fields
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
      FALSE,
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

COMMIT; 