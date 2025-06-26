-- Migration to add social media URL fields to profiles table
-- These fields are optional and can be null

BEGIN;

-- Add social media URL columns to profiles table
ALTER TABLE profiles
  ADD COLUMN facebook_page_url TEXT DEFAULT NULL,
  ADD COLUMN x_page_url TEXT DEFAULT NULL,
  ADD COLUMN instagram_page_url TEXT DEFAULT NULL;

-- Add comments to clarify the column purposes
COMMENT ON COLUMN profiles.facebook_page_url IS 'URL to Facebook page/profile';
COMMENT ON COLUMN profiles.x_page_url IS 'URL to X (Twitter) profile';
COMMENT ON COLUMN profiles.instagram_page_url IS 'URL to Instagram profile';

-- Add check constraints to ensure valid URL formats for each platform
ALTER TABLE profiles
  ADD CONSTRAINT facebook_page_url_format_check
  CHECK (
    facebook_page_url IS NULL OR
    facebook_page_url ~* '^https?://(www\.)?(facebook\.com|m\.facebook\.com)/.+'
  );

ALTER TABLE profiles
  ADD CONSTRAINT x_page_url_format_check
  CHECK (
    x_page_url IS NULL OR
    x_page_url ~* '^https?://(www\.)?(x\.com|twitter\.com)/.+'
  );

ALTER TABLE profiles
  ADD CONSTRAINT instagram_page_url_format_check
  CHECK (
    instagram_page_url IS NULL OR
    instagram_page_url ~* '^https?://(www\.)?instagram\.com/.+'
  );

COMMIT; 