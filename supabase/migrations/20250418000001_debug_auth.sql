-- Debug Auth Function
CREATE OR REPLACE FUNCTION debug_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  RAISE LOG 'New auth user: id=%, email=%, raw_meta=%', 
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Disable the original trigger temporarily to see if it's causing issues
DROP TRIGGER IF EXISTS after_auth_user_created ON auth.users;

-- Create debug trigger
CREATE TRIGGER debug_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION debug_auth_user();

-- Simplified user creation function that focuses only on the essentials
CREATE OR REPLACE FUNCTION basic_user_creation() 
RETURNS TRIGGER AS $$
BEGIN
  -- Very minimal user creation with just the ID
  INSERT INTO public.users (id, email, display_name, created_at, updated_at, is_deleted)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NOW(),
    NOW(),
    FALSE
  );
  
  -- Very minimal profile creation with just the ID
  INSERT INTO public.profiles (id, role, created_at, updated_at, is_deleted)
  VALUES (NEW.id, 'user', NOW(), NOW(), FALSE);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in basic_user_creation: %', SQLERRM;
  RETURN NEW; -- Return NEW anyway to not block auth
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger with the simplified function
CREATE TRIGGER basic_user_creation_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION basic_user_creation(); 