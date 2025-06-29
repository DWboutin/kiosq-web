-- Update schedule time format to support minutes
-- Change from hour-only (0-23) to HHMM format (0000-2359)
-- Add name_translations and is_default fields

BEGIN;

-- Remove old constraints that limited to 0-23 hours
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_monday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_monday_close_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_tuesday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_tuesday_close_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_wednesday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_wednesday_close_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_thursday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_thursday_close_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_friday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_friday_close_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_saturday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_saturday_close_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_sunday_open_time_check;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_sunday_close_time_check;

-- Add new constraints for HHMM format (0000-2359)
ALTER TABLE schedules ADD CONSTRAINT monday_open_time_format 
  CHECK (monday_open_time IS NULL OR (monday_open_time >= 0 AND monday_open_time <= 2359 AND monday_open_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT monday_close_time_format 
  CHECK (monday_close_time IS NULL OR (monday_close_time >= 0 AND monday_close_time <= 2359 AND monday_close_time % 100 < 60));

ALTER TABLE schedules ADD CONSTRAINT tuesday_open_time_format 
  CHECK (tuesday_open_time IS NULL OR (tuesday_open_time >= 0 AND tuesday_open_time <= 2359 AND tuesday_open_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT tuesday_close_time_format 
  CHECK (tuesday_close_time IS NULL OR (tuesday_close_time >= 0 AND tuesday_close_time <= 2359 AND tuesday_close_time % 100 < 60));

ALTER TABLE schedules ADD CONSTRAINT wednesday_open_time_format 
  CHECK (wednesday_open_time IS NULL OR (wednesday_open_time >= 0 AND wednesday_open_time <= 2359 AND wednesday_open_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT wednesday_close_time_format 
  CHECK (wednesday_close_time IS NULL OR (wednesday_close_time >= 0 AND wednesday_close_time <= 2359 AND wednesday_close_time % 100 < 60));

ALTER TABLE schedules ADD CONSTRAINT thursday_open_time_format 
  CHECK (thursday_open_time IS NULL OR (thursday_open_time >= 0 AND thursday_open_time <= 2359 AND thursday_open_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT thursday_close_time_format 
  CHECK (thursday_close_time IS NULL OR (thursday_close_time >= 0 AND thursday_close_time <= 2359 AND thursday_close_time % 100 < 60));

ALTER TABLE schedules ADD CONSTRAINT friday_open_time_format 
  CHECK (friday_open_time IS NULL OR (friday_open_time >= 0 AND friday_open_time <= 2359 AND friday_open_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT friday_close_time_format 
  CHECK (friday_close_time IS NULL OR (friday_close_time >= 0 AND friday_close_time <= 2359 AND friday_close_time % 100 < 60));

ALTER TABLE schedules ADD CONSTRAINT saturday_open_time_format 
  CHECK (saturday_open_time IS NULL OR (saturday_open_time >= 0 AND saturday_open_time <= 2359 AND saturday_open_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT saturday_close_time_format 
  CHECK (saturday_close_time IS NULL OR (saturday_close_time >= 0 AND saturday_close_time <= 2359 AND saturday_close_time % 100 < 60));

ALTER TABLE schedules ADD CONSTRAINT sunday_open_time_format 
  CHECK (sunday_open_time IS NULL OR (sunday_open_time >= 0 AND sunday_open_time <= 2359 AND sunday_close_time % 100 < 60));
ALTER TABLE schedules ADD CONSTRAINT sunday_close_time_format 
  CHECK (sunday_close_time IS NULL OR (sunday_close_time >= 0 AND sunday_close_time <= 2359 AND sunday_close_time % 100 < 60));

-- Add name_translations and is_default columns
ALTER TABLE schedules ADD COLUMN name_translations JSONB DEFAULT '{}' NOT NULL;
ALTER TABLE schedules ADD COLUMN is_default BOOLEAN DEFAULT FALSE NOT NULL;

-- Create unique partial index to ensure only one default schedule per profile
CREATE UNIQUE INDEX idx_schedules_unique_default_per_profile 
  ON schedules (profile_id) 
  WHERE is_default = true;

-- Update existing data: convert hour-only values to HHMM format
-- For example: 9 becomes 900, 17 becomes 1700
UPDATE schedules SET
  monday_open_time = CASE WHEN monday_open_time IS NOT NULL AND monday_open_time < 100 THEN monday_open_time * 100 ELSE monday_open_time END,
  monday_close_time = CASE WHEN monday_close_time IS NOT NULL AND monday_close_time < 100 THEN monday_close_time * 100 ELSE monday_close_time END,
  tuesday_open_time = CASE WHEN tuesday_open_time IS NOT NULL AND tuesday_open_time < 100 THEN tuesday_open_time * 100 ELSE tuesday_open_time END,
  tuesday_close_time = CASE WHEN tuesday_close_time IS NOT NULL AND tuesday_close_time < 100 THEN tuesday_close_time * 100 ELSE tuesday_close_time END,
  wednesday_open_time = CASE WHEN wednesday_open_time IS NOT NULL AND wednesday_open_time < 100 THEN wednesday_open_time * 100 ELSE wednesday_open_time END,
  wednesday_close_time = CASE WHEN wednesday_close_time IS NOT NULL AND wednesday_close_time < 100 THEN wednesday_close_time * 100 ELSE wednesday_close_time END,
  thursday_open_time = CASE WHEN thursday_open_time IS NOT NULL AND thursday_open_time < 100 THEN thursday_open_time * 100 ELSE thursday_open_time END,
  thursday_close_time = CASE WHEN thursday_close_time IS NOT NULL AND thursday_close_time < 100 THEN thursday_close_time * 100 ELSE thursday_close_time END,
  friday_open_time = CASE WHEN friday_open_time IS NOT NULL AND friday_open_time < 100 THEN friday_open_time * 100 ELSE friday_open_time END,
  friday_close_time = CASE WHEN friday_close_time IS NOT NULL AND friday_close_time < 100 THEN friday_close_time * 100 ELSE friday_close_time END,
  saturday_open_time = CASE WHEN saturday_open_time IS NOT NULL AND saturday_open_time < 100 THEN saturday_open_time * 100 ELSE saturday_open_time END,
  saturday_close_time = CASE WHEN saturday_close_time IS NOT NULL AND saturday_close_time < 100 THEN saturday_close_time * 100 ELSE saturday_close_time END,
  sunday_open_time = CASE WHEN sunday_open_time IS NOT NULL AND sunday_open_time < 100 THEN sunday_open_time * 100 ELSE sunday_open_time END,
  sunday_close_time = CASE WHEN sunday_close_time IS NOT NULL AND sunday_close_time < 100 THEN sunday_close_time * 100 ELSE sunday_close_time END;

-- Update the default values in the create_default_schedule_for_vendor_profile function
CREATE OR REPLACE FUNCTION create_default_schedule_for_vendor_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create schedule for vendor profiles
  IF NEW.type = 'vendor' THEN
    INSERT INTO schedules (
      profile_id,
      timezone,
      monday_open_time,
      monday_close_time,
      tuesday_open_time,
      tuesday_close_time,
      wednesday_open_time,
      wednesday_close_time,
      thursday_open_time,
      thursday_close_time,
      friday_open_time,
      friday_close_time,
      saturday_open_time,
      saturday_close_time,
      sunday_open_time,
      sunday_close_time,
      name_translations,
      is_default,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'America/Toronto',
      900,  -- 9:00 AM
      1700, -- 5:00 PM
      900,  -- 9:00 AM
      1700, -- 5:00 PM
      900,  -- 9:00 AM
      1700, -- 5:00 PM
      900,  -- 9:00 AM
      2100, -- 9:00 PM
      900,  -- 9:00 AM
      2100, -- 9:00 PM
      900,  -- 9:00 AM
      1700, -- 5:00 PM
      900,  -- 9:00 AM
      1700, -- 5:00 PM
      '{"en": "Default Schedule", "fr": "Horaire par défaut"}',
      true,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT; 