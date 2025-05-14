-- Migration to improve profile images path structure and deletion
-- This ensures files in profile-images bucket are properly linked to profiles.id

BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Update upload policy to enforce profiles/{profile_id}/* path structure
-- and verify the user owns the profile specified in the path
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  starts_with(name, 'profiles/') AND
  split_part(name, '/', 2) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Update policy for updating profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  starts_with(name, 'profiles/') AND
  split_part(name, '/', 2) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Update policy for deleting profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  starts_with(name, 'profiles/') AND
  split_part(name, '/', 2) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Update the function to delete profile images when a profile is deleted
-- This simplifies the deletion by using a precise path match
CREATE OR REPLACE FUNCTION delete_profile_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all files in the profile's directory
  DELETE FROM storage.objects
  WHERE bucket_id = 'profile-images' AND starts_with(name, 'profiles/' || OLD.id::text || '/');
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a comment to document the path structure
COMMENT ON FUNCTION delete_profile_images() IS 
  'Deletes all profile images when a profile is deleted. Files must be stored in path format: profiles/{profile_id}/{filename}';

COMMIT; 