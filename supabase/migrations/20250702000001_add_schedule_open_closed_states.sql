-- Add open/closed state columns to schedules table
-- This migration adds boolean columns for each day to track if the store is open or closed

BEGIN;

-- Add boolean columns for each day (default to true = open)
ALTER TABLE schedules 
  ADD COLUMN monday_is_open BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN tuesday_is_open BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN wednesday_is_open BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN thursday_is_open BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN friday_is_open BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN saturday_is_open BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN sunday_is_open BOOLEAN DEFAULT TRUE NOT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN schedules.monday_is_open IS 'Whether the store is open on Monday';
COMMENT ON COLUMN schedules.tuesday_is_open IS 'Whether the store is open on Tuesday';
COMMENT ON COLUMN schedules.wednesday_is_open IS 'Whether the store is open on Wednesday';
COMMENT ON COLUMN schedules.thursday_is_open IS 'Whether the store is open on Thursday';
COMMENT ON COLUMN schedules.friday_is_open IS 'Whether the store is open on Friday';
COMMENT ON COLUMN schedules.saturday_is_open IS 'Whether the store is open on Saturday';
COMMENT ON COLUMN schedules.sunday_is_open IS 'Whether the store is open on Sunday';

-- Update existing schedules to have all days open by default
UPDATE schedules 
SET 
  monday_is_open = TRUE,
  tuesday_is_open = TRUE,
  wednesday_is_open = TRUE,
  thursday_is_open = TRUE,
  friday_is_open = TRUE,
  saturday_is_open = TRUE,
  sunday_is_open = TRUE
WHERE 
  monday_is_open IS NULL 
  OR tuesday_is_open IS NULL 
  OR wednesday_is_open IS NULL 
  OR thursday_is_open IS NULL 
  OR friday_is_open IS NULL 
  OR saturday_is_open IS NULL 
  OR sunday_is_open IS NULL;

COMMIT; 