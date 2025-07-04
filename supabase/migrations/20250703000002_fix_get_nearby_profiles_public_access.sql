-- Fix get_nearby_profiles function to align with public visibility policies
-- This migration updates the function to include is_reviewed check for proper public access

-- Update the get_nearby_profiles function to include is_reviewed check
CREATE OR REPLACE FUNCTION get_nearby_profiles(
  user_latitude DECIMAL(9,6),
  user_longitude DECIMAL(9,6),
  search_radius_km INTEGER DEFAULT 100,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  profile_id UUID,
  profile_name JSONB,
  profile_slug JSONB,
  profile_description JSONB,
  profile_image TEXT,
  profile_banner_image TEXT,
  kiosq_id UUID,
  kiosq_name JSONB,
  kiosq_description JSONB,
  kiosq_address TEXT,
  kiosq_city TEXT,
  kiosq_state TEXT,
  kiosq_country TEXT,
  kiosq_latitude DECIMAL(9,6),
  kiosq_longitude DECIMAL(9,6),
  kiosq_status TEXT,
  distance_km DECIMAL(8,2)
) AS $$
DECLARE
  user_location GEOGRAPHY;
BEGIN
  -- Create user location point
  user_location := ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name_translations,
    p.slug_translations,
    p.description_translations,
    p.profile_image,
    p.banner_image,
    k.id,
    k.name_translations,
    k.description_translations,
    k.address,
    k.city,
    k.state,
    k.country::TEXT, -- Cast CHAR(2) to TEXT to fix type mismatch
    k.latitude,
    k.longitude,
    k.store_status,
    (ST_Distance(k.location, user_location) / 1000)::DECIMAL(8,2) -- Convert meters to km
  FROM kiosqs k
  JOIN profiles p ON k.profile_id = p.id
  WHERE 
    k.location IS NOT NULL
    AND NOT k.is_deleted
    AND NOT p.is_deleted
    AND p.is_active = true
    AND p.is_reviewed = true  -- Added this check to align with public visibility policy
    AND p.type = 'vendor'
    AND ST_DWithin(k.location, user_location, search_radius_km * 1000) -- ST_DWithin uses meters
  ORDER BY ST_Distance(k.location, user_location)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure permissions are still granted (redundant but explicit)
GRANT EXECUTE ON FUNCTION get_nearby_profiles TO authenticated, anon;

-- Update function comment
COMMENT ON FUNCTION get_nearby_profiles IS 'Find nearby vendor profiles within a specified radius using PostGIS. Only returns active and reviewed profiles for public access.'; 