-- Add schedule_id column to kiosqs table for direct schedule assignment
-- This allows kiosqs to have their own specific operating schedules
-- Created: 2025-07-03

BEGIN;

-- Add schedule_id column to kiosqs table
-- Column is nullable to allow kiosqs without specific schedules
-- (they would fall back to profile's default schedule)
ALTER TABLE kiosqs 
ADD COLUMN schedule_id UUID;

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE kiosqs 
ADD CONSTRAINT fk_kiosqs_schedule_id 
FOREIGN KEY (schedule_id) 
REFERENCES schedules(id) 
ON DELETE SET NULL;

-- Create index for performance on schedule_id lookups
CREATE INDEX idx_kiosqs_schedule_id ON kiosqs(schedule_id);

-- Add comment to document the relationship
COMMENT ON COLUMN kiosqs.schedule_id IS 'Optional direct reference to a specific schedule. If null, kiosq inherits schedule from its profile.';

-- Update the existing RLS policies to ensure users can only reference schedules they own
-- This is handled by the existing schedule policies and profile ownership checks

COMMIT; 