BEGIN;

-- Admin category management policies
-- This policy allows admins to perform all operations (select, insert, update, delete)
CREATE POLICY categories_admin_full_access ON categories
FOR ALL TO authenticated
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

-- We're removing the redundant categories_admin_insert policy since it's covered by the full access policy above

-- For service role access, no additional policy is needed as service role bypasses RLS by default

-- Create a simpler delete function that doesn't try to handle materialized view recreation
-- This function will check if the current user has admin role before performing the delete
CREATE OR REPLACE FUNCTION delete_category(category_id UUID)
RETURNS VOID AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the current user has admin role
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'::user_role
  ) INTO is_admin;
  
  -- Only proceed if the user is an admin
  IF is_admin THEN
    -- Simply delete the category
    DELETE FROM categories WHERE id = category_id;
  ELSE
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION delete_category(UUID) TO authenticated;

COMMIT; 