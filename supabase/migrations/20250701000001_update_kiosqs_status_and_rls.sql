-- Migration to update kiosqs status columns and add RLS policies
-- Created: 2025-07-01

BEGIN;

-- 1. Ensure the product_status type exists (it should from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('published', 'draft', 'deleted');
  END IF;
END $$;

-- 2. Rename the current status column to store_status
ALTER TABLE kiosqs RENAME COLUMN status TO store_status;

-- 3. Add the new status column with product_status enum
ALTER TABLE kiosqs ADD COLUMN status product_status DEFAULT 'draft';

-- 4. Update the check constraint for store_status column (since the column was renamed)
ALTER TABLE kiosqs DROP CONSTRAINT IF EXISTS kiosqs_status_check;
ALTER TABLE kiosqs ADD CONSTRAINT kiosqs_store_status_check 
  CHECK (store_status IN ('open', 'temporary closed', 'closed'));

-- 5. Enable Row Level Security on kiosqs table
ALTER TABLE kiosqs ENABLE ROW LEVEL SECURITY;

-- 6. Drop any existing policies (in case they exist)
DROP POLICY IF EXISTS kiosqs_view_all ON kiosqs;
DROP POLICY IF EXISTS kiosqs_view_own ON kiosqs;
DROP POLICY IF EXISTS kiosqs_insert_own ON kiosqs;
DROP POLICY IF EXISTS kiosqs_update_own ON kiosqs;
DROP POLICY IF EXISTS kiosqs_delete_own ON kiosqs;

-- 7. Create RLS policies

-- 7.1 Public read access for all kiosqs (everyone can see all kiosqs)
CREATE POLICY kiosqs_view_all ON kiosqs
  FOR SELECT
  TO authenticated, anon
  USING (NOT is_deleted);

-- 7.2 Owners can create new kiosqs
CREATE POLICY kiosqs_insert_own ON kiosqs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = kiosqs.profile_id
    )
  );

-- 7.3 Owners can update their own kiosqs
CREATE POLICY kiosqs_update_own ON kiosqs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = kiosqs.profile_id
    )
  );

-- 7.4 Owners can delete their own kiosqs
CREATE POLICY kiosqs_delete_own ON kiosqs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = kiosqs.profile_id
    )
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kiosqs_profile_id ON kiosqs(profile_id);
CREATE INDEX IF NOT EXISTS idx_kiosqs_status ON kiosqs(status);
CREATE INDEX IF NOT EXISTS idx_kiosqs_store_status ON kiosqs(store_status);
CREATE INDEX IF NOT EXISTS idx_kiosqs_is_deleted ON kiosqs(is_deleted);

COMMIT; 