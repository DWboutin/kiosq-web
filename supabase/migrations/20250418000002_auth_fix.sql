-- Add CASCADE options to foreign keys to handle auth deletions better
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_id_fkey,
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop and recreate the auth user trigger with a more robust implementation
DROP TRIGGER IF EXISTS basic_user_creation_trigger ON auth.users;
DROP TRIGGER IF EXISTS debug_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS after_auth_user_created ON auth.users;

-- Create a maximally robust user creation function
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
      INSERT INTO public.profiles (id, role, metadata, created_at, updated_at, is_deleted)
      VALUES (NEW.id, 'user', '{}'::jsonb, NOW(), NOW(), FALSE);
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but allow auth to continue
  RAISE LOG 'Error in handle_auth_user_insert: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a fresh trigger with the new function
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_auth_user_insert(); 