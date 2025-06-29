-- Create schedules table for vendor operating hours
-- This table stores weekly schedules for vendor profiles with timezone support

BEGIN;

-- Create schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  
  -- Monday schedule
  monday_open_time INTEGER DEFAULT 9 CHECK (monday_open_time >= 0 AND monday_open_time <= 23),
  monday_close_time INTEGER DEFAULT 17 CHECK (monday_close_time >= 0 AND monday_close_time <= 23),
  monday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Tuesday schedule
  tuesday_open_time INTEGER DEFAULT 9 CHECK (tuesday_open_time >= 0 AND tuesday_open_time <= 23),
  tuesday_close_time INTEGER DEFAULT 17 CHECK (tuesday_close_time >= 0 AND tuesday_close_time <= 23),
  tuesday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Wednesday schedule
  wednesday_open_time INTEGER DEFAULT 9 CHECK (wednesday_open_time >= 0 AND wednesday_open_time <= 23),
  wednesday_close_time INTEGER DEFAULT 17 CHECK (wednesday_close_time >= 0 AND wednesday_close_time <= 23),
  wednesday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Thursday schedule (special close time: 21)
  thursday_open_time INTEGER DEFAULT 9 CHECK (thursday_open_time >= 0 AND thursday_open_time <= 23),
  thursday_close_time INTEGER DEFAULT 21 CHECK (thursday_close_time >= 0 AND thursday_close_time <= 23),
  thursday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Friday schedule (special close time: 21)
  friday_open_time INTEGER DEFAULT 9 CHECK (friday_open_time >= 0 AND friday_open_time <= 23),
  friday_close_time INTEGER DEFAULT 21 CHECK (friday_close_time >= 0 AND friday_close_time <= 23),
  friday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Saturday schedule
  saturday_open_time INTEGER DEFAULT 9 CHECK (saturday_open_time >= 0 AND saturday_open_time <= 23),
  saturday_close_time INTEGER DEFAULT 17 CHECK (saturday_close_time >= 0 AND saturday_close_time <= 23),
  saturday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Sunday schedule
  sunday_open_time INTEGER DEFAULT 9 CHECK (sunday_open_time >= 0 AND sunday_open_time <= 23),
  sunday_close_time INTEGER DEFAULT 17 CHECK (sunday_close_time >= 0 AND sunday_close_time <= 23),
  sunday_pauses JSONB DEFAULT '[]'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES users(id)
);

-- Add constraints to ensure pauses array has at most 3 items
ALTER TABLE schedules ADD CONSTRAINT monday_pauses_max_3 
  CHECK (jsonb_array_length(monday_pauses) <= 3);
ALTER TABLE schedules ADD CONSTRAINT tuesday_pauses_max_3 
  CHECK (jsonb_array_length(tuesday_pauses) <= 3);
ALTER TABLE schedules ADD CONSTRAINT wednesday_pauses_max_3 
  CHECK (jsonb_array_length(wednesday_pauses) <= 3);
ALTER TABLE schedules ADD CONSTRAINT thursday_pauses_max_3 
  CHECK (jsonb_array_length(thursday_pauses) <= 3);
ALTER TABLE schedules ADD CONSTRAINT friday_pauses_max_3 
  CHECK (jsonb_array_length(friday_pauses) <= 3);
ALTER TABLE schedules ADD CONSTRAINT saturday_pauses_max_3 
  CHECK (jsonb_array_length(saturday_pauses) <= 3);
ALTER TABLE schedules ADD CONSTRAINT sunday_pauses_max_3 
  CHECK (jsonb_array_length(sunday_pauses) <= 3);

-- Ensure each profile has only one schedule
ALTER TABLE schedules ADD CONSTRAINT unique_profile_schedule 
  UNIQUE (profile_id);

-- Create indexes for performance
CREATE INDEX idx_schedules_profile_id ON schedules(profile_id);
CREATE INDEX idx_schedules_timezone ON schedules(timezone);

-- Add timestamp trigger
CREATE TRIGGER set_timestamp_schedules
BEFORE UPDATE ON schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add updated_by trigger
CREATE TRIGGER set_updated_by_schedules
BEFORE UPDATE ON schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_by();

-- Create function to automatically create schedule when vendor profile is created
CREATE OR REPLACE FUNCTION create_default_schedule_for_vendor_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create schedule for vendor profiles
  IF NEW.type = 'vendor' THEN
    INSERT INTO schedules (
      profile_id,
      timezone,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'America/Toronto',
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create schedule for new vendor profiles
CREATE TRIGGER create_schedule_on_vendor_profile_insert
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_schedule_for_vendor_profile();

-- Update existing create_vendor_profile function to create schedule
CREATE OR REPLACE FUNCTION create_vendor_profile(
  user_id UUID,
  name_translations JSONB,
  slug_translations JSONB,
  description_translations JSONB DEFAULT '{}'::jsonb,
  banner_image TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  -- Insert new vendor profile
  INSERT INTO profiles (
    id,
    user_id,
    type,
    banner_image,
    name_translations,
    slug_translations,
    description_translations,
    is_active,
    is_reviewed,
    created_at,
    updated_at,
    is_deleted
  ) VALUES (
    uuid_generate_v4(),
    user_id,
    'vendor'::profile_type,
    banner_image,
    name_translations,
    slug_translations,
    description_translations,
    FALSE,  -- Vendor profiles start inactive
    FALSE,  -- Vendor profiles require review
    NOW(),
    NOW(),
    FALSE
  )
  RETURNING id INTO new_profile_id;
  
  -- Schedule will be automatically created by the trigger
  
  RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on schedules table
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read schedules (public visibility)
CREATE POLICY schedules_select_all ON schedules
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow profile owners to insert their own schedules
CREATE POLICY schedules_insert_own ON schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Allow profile owners to update their own schedules
CREATE POLICY schedules_update_own ON schedules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Allow profile owners to delete their own schedules
CREATE POLICY schedules_delete_own ON schedules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admin policies: Allow admins to manage all schedules
CREATE POLICY schedules_admin_all ON schedules
  FOR ALL
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

-- Add comment to document the table
COMMENT ON TABLE schedules IS 'Weekly operating schedules for vendor profiles with timezone support and pause periods';

COMMIT; 