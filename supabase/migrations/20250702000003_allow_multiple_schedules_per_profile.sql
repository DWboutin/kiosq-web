-- Allow multiple schedules per profile
-- Remove the constraint that only allows one schedule per profile
-- The partial unique index for is_default=true is already in place from the previous migration

BEGIN;

-- Drop the old constraint that only allowed one schedule per profile
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS unique_profile_schedule;

-- Add comment to document the change
COMMENT ON TABLE schedules IS 'Weekly operating schedules for vendor profiles. Multiple schedules allowed per profile, but only one can be marked as default.';

COMMIT; 