-- Migration to handle deprecated columns from products table
-- Created: 2025-05-17

BEGIN;

-- Instead of dropping columns with dependencies, rename them to clearly indicate they're deprecated
-- This preserves any existing dependencies while marking the columns as obsolete

-- Rename the user_id column
ALTER TABLE products RENAME COLUMN user_id TO user_id_deprecated;

-- Update the comment to reflect the new status
COMMENT ON COLUMN products.user_id_deprecated IS 'DEPRECATED: This column is no longer used. Use profile_id instead.';

-- Rename the status column
ALTER TABLE products RENAME COLUMN status TO status_deprecated;

-- Update the comment to reflect the new status
COMMENT ON COLUMN products.status_deprecated IS 'DEPRECATED: This column is no longer used.';

-- Set all values to NULL to reinforce that these columns should not be used
UPDATE products SET 
  user_id_deprecated = NULL,
  status_deprecated = NULL;

COMMIT; 