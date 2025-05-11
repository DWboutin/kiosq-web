-- Add status tracking fields to profiles table
-- This migration adds is_active and is_reviewed fields to control profile visibility

BEGIN;

-- Add status columns to profiles table
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN is_reviewed BOOLEAN DEFAULT FALSE;

-- Create index for is_active to improve filtering of active profiles
CREATE INDEX idx_profiles_is_active ON profiles(is_active) WHERE is_active = TRUE;

-- Update the handle_auth_user_insert function to initialize the new columns
-- Set personal profiles to active by default, but vendor profiles require review
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
        is_active,
        is_reviewed,
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
        TRUE,  -- Personal profiles are active by default
        TRUE,  -- Personal profiles are considered reviewed by default
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

-- Create function to manage vendor profiles
CREATE OR REPLACE FUNCTION create_vendor_profile(
  user_id UUID,
  name_translations JSONB,
  slug_translations JSONB,
  description_translations JSONB DEFAULT '{}'::jsonb,
  banner_image TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  -- Insert new vendor profile
  INSERT INTO profiles (
    id,
    user_id,
    type,
    banner_image,
    name_translations,
    slug_translations,
    description_translations,
    is_active,
    is_reviewed,
    created_at,
    updated_at,
    is_deleted
  ) VALUES (
    uuid_generate_v4(),
    user_id,
    'vendor'::profile_type,
    banner_image,
    name_translations,
    slug_translations,
    description_translations,
    FALSE,  -- Vendor profiles start inactive
    FALSE,  -- Vendor profiles require review
    NOW(),
    NOW(),
    FALSE
  )
  RETURNING id INTO new_profile_id;
  
  RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION create_vendor_profile(UUID, JSONB, JSONB, JSONB, TEXT) TO authenticated;

-- Create admin function to review and activate profiles
CREATE OR REPLACE FUNCTION review_profile(
  profile_id UUID,
  set_active BOOLEAN,
  set_reviewed BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the current user has admin role
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin'::user_role, 'vendor-admin'::user_role)
  ) INTO is_admin;
  
  -- Only proceed if the user is an admin
  IF is_admin THEN
    UPDATE profiles
    SET 
      is_active = set_active,
      is_reviewed = set_reviewed,
      updated_at = NOW(),
      updated_by = auth.uid()
    WHERE id = profile_id;
    
    RETURN TRUE;
  ELSE
    RAISE EXCEPTION 'Access denied. Admin or vendor-admin role required.';
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the review function to authenticated users
GRANT EXECUTE ON FUNCTION review_profile(UUID, BOOLEAN, BOOLEAN) TO authenticated;

-- Add policy to allow only active profiles to be visible to the public
CREATE POLICY profiles_view_active ON profiles
  FOR SELECT
  USING (
    is_active = TRUE
    AND NOT is_deleted
  );

COMMIT; 