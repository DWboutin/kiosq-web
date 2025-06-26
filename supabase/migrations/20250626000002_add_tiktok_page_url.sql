-- Migration to add tiktok_page_url field to profiles table
-- This field is optional and can be null

BEGIN;

-- Add tiktok_page_url column to profiles table
ALTER TABLE profiles
  ADD COLUMN tiktok_page_url TEXT DEFAULT NULL;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN profiles.tiktok_page_url IS 'URL to TikTok profile';

-- Add check constraint to ensure valid URL format for TikTok
ALTER TABLE profiles
  ADD CONSTRAINT tiktok_page_url_format_check
  CHECK (
    tiktok_page_url IS NULL OR
    tiktok_page_url ~* '^https?://(www\.)?(tiktok\.com|vm\.tiktok\.com)/.+'
  );

COMMIT; 