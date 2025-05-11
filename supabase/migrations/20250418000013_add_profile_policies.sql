-- Migration to add new RLS policies for profiles table
-- This adds proper INSERT, SELECT, and UPDATE policies for the profiles table

BEGIN;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS profiles_view_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_view_active ON profiles;

-- Allow users to create their own profiles
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow anyone to view active and reviewed profiles
CREATE POLICY profiles_view_public ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = TRUE
    AND is_reviewed = TRUE
    AND NOT is_deleted
  );

-- Allow authenticated users to view all their own profiles regardless of status
CREATE POLICY profiles_view_own ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own profiles
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies: Allow admins to read, update, and delete any profile
CREATE POLICY profiles_admin_select ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

CREATE POLICY profiles_admin_delete ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Add comment to document the policies
COMMENT ON TABLE profiles IS 'User profiles with vendor/personal types and status flags. Policies control visibility and edit permissions.';

COMMIT; 