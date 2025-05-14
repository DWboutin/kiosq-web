-- Update profile status and add missing updated_by fields
-- This migration updates existing profiles and adds updated_by to remaining tables

BEGIN;

-- First, add updated_by field to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Check and fix the trigger_set_updated_by function to handle missing columns gracefully
CREATE OR REPLACE FUNCTION trigger_set_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the NEW record has the updated_by field
  IF TG_OP = 'UPDATE' AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = TG_TABLE_SCHEMA
    AND table_name = TG_TABLE_NAME
    AND column_name = 'updated_by'
  ) THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now update existing profiles based on their type
-- Set personal profiles to active and reviewed by default
UPDATE profiles
SET 
  is_active = CASE WHEN type = 'personal' THEN TRUE ELSE is_active END,
  is_reviewed = CASE WHEN type = 'personal' THEN TRUE ELSE is_reviewed END
WHERE 
  (is_active IS NULL OR is_active = FALSE OR is_reviewed IS NULL OR is_reviewed = FALSE)
  AND type = 'personal';

-- Add missing updated_by field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Create trigger to set updated_by field automatically for users table
DROP TRIGGER IF EXISTS set_updated_by_users ON users;
CREATE TRIGGER set_updated_by_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

-- Ensure all tables have updated_by fields
-- Check core tables from the schema
DO $$
DECLARE
  tbl_name text;  -- Renamed variable to avoid column name conflict
  column_exists boolean;
BEGIN
  -- List of core tables to check
  FOR tbl_name IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN (
        'users', 'products', 'product_variants', 'categories', 
        'inventory', 'product_prices', 'tax_components', 'profiles'
      )
  LOOP
    -- Check if updated_by column exists
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = tbl_name  -- Use renamed variable
        AND column_name = 'updated_by'
    ) INTO column_exists;
    
    -- Add column and trigger if needed
    IF NOT column_exists THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN updated_by UUID REFERENCES users(id)', tbl_name);
      EXECUTE format('
        DROP TRIGGER IF EXISTS set_updated_by_%I ON %I;
        CREATE TRIGGER set_updated_by_%I
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_updated_by()', 
        tbl_name, tbl_name, tbl_name, tbl_name
      );
    END IF;
  END LOOP;
END $$;

-- Add a comment to document this migration's purpose
COMMENT ON TABLE profiles IS 'User profiles with vendor/personal types and status flags. Personal profiles are active by default.';

COMMIT; 