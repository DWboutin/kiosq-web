-- Create a storage bucket for profile images if it doesn't exist, or update it to be public
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'profile-images',
      'profile-images',
      true, -- Set to public to allow direct access via public URLs
      5242880, -- 5MB size limit
      ARRAY['image/jpeg', 'image/png', 'image/webp']::text[] -- Allowed image types
    );
  ELSE
    -- Update existing bucket to be public
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'profile-images';
  END IF;
END $$;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- POLICY 1: Allow all users to view profile images
CREATE POLICY "Profile images are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- POLICY 2: Allow authenticated users to upload their own profile images
-- Path format: user_id/profile_id_[type].ext
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- POLICY 3: Allow authenticated users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- POLICY 4: Allow admin users to delete any profile images
CREATE POLICY "Admins can delete any profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- POLICY 5: Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Create a function to delete profile images when a profile is deleted
CREATE OR REPLACE FUNCTION delete_profile_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Use a more direct approach to delete profile images
  -- This bypasses RLS policies for more reliable deletion
  EXECUTE format('
    DELETE FROM storage.objects
    WHERE 
      bucket_id = ''profile-images'' AND 
      (name LIKE ''%%/%s_%%'' OR name LIKE ''%s/%%'')
  ', OLD.id, OLD.id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to automatically delete profile images when a profile is deleted
DROP TRIGGER IF EXISTS trigger_delete_profile_images ON profiles;
CREATE TRIGGER trigger_delete_profile_images
AFTER DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION delete_profile_images();