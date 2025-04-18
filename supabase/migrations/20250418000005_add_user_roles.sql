-- Create custom type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'vendor-admin', 'vendor-manager', 'user');

-- Add role field to users table
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create index for faster queries on role
CREATE INDEX idx_users_role ON users(role);

-- Update the user creation function to use the new role field
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
      is_deleted
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''),
      _display_name,
      'user',
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
        is_deleted
      )
      VALUES (
        NEW.id, 
        'personal', 
        NULL,
        jsonb_build_object('en', _display_name),
        jsonb_build_object('en', _slug),
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

-- Helper function to check if a user has at least a specific role level
CREATE OR REPLACE FUNCTION has_role_permission(
  user_id UUID, 
  required_role user_role
) RETURNS BOOLEAN AS $$
DECLARE
  user_current_role user_role;
BEGIN
  -- Get user's current role
  SELECT role INTO user_current_role
  FROM users
  WHERE id = user_id;
  
  -- Return true if user has the required role or higher
  RETURN CASE
    WHEN user_current_role = 'admin' THEN TRUE
    WHEN user_current_role = 'vendor-admin' AND required_role IN ('vendor-admin', 'vendor-manager', 'user') THEN TRUE
    WHEN user_current_role = 'vendor-manager' AND required_role IN ('vendor-manager', 'user') THEN TRUE
    WHEN user_current_role = 'user' AND required_role = 'user' THEN TRUE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy that only allows admins to change user roles
CREATE POLICY update_own_user_data ON users
  FOR UPDATE
  USING (auth.uid() = id OR has_role_permission(auth.uid(), 'admin'::user_role));

-- Create a trigger function to enforce role change restrictions
CREATE OR REPLACE FUNCTION check_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Users can't change their own role
  IF NEW.id = auth.uid() AND OLD.role <> NEW.role THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  
  -- Only admins can change roles
  IF OLD.role <> NEW.role AND NOT has_role_permission(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to enforce role change restrictions
CREATE TRIGGER enforce_role_change_rules
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_role_change(); 