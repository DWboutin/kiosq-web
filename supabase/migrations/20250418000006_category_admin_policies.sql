BEGIN;

-- Admin category management policies
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

CREATE POLICY categories_admin_insert ON categories
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'::user_role
  )
);

COMMIT; 