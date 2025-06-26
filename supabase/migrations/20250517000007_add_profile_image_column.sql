-- Migration to add profile_image column to profiles table
-- This will use the same storage bucket as banner images (profile-images)

BEGIN;

-- Add profile_image column to profiles table
ALTER TABLE profiles
  ADD COLUMN profile_image TEXT DEFAULT NULL;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN profiles.profile_image IS 'URL to profile image stored in profile-images bucket';

COMMIT; 