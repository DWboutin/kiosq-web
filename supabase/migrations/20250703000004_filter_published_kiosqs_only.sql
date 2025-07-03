-- Filter get_nearby_profiles to only return published kiosqs
-- This migration adds the missing k.status = 'published' filter to ensure only published kiosqs are returned

-- Update get_nearby_profiles function to include published status filter
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
    k.country::TEXT, -- Explicit cast from CHAR(2) to TEXT
    k.latitude,
    k.longitude,
    k.status::TEXT, -- Cast status to TEXT for consistency
    (ST_Distance(k.location, user_location) / 1000)::DECIMAL(8,2) -- Convert meters to km
  FROM kiosqs k
  JOIN profiles p ON k.profile_id = p.id
  WHERE 
    k.location IS NOT NULL
    AND NOT k.is_deleted
    AND NOT p.is_deleted
    AND p.is_active = true
    AND p.is_reviewed = true
    AND p.type = 'vendor'
    AND k.status = 'published' -- Added this filter to only return published kiosqs
    AND ST_DWithin(k.location, user_location, search_radius_km * 1000) -- ST_DWithin uses meters
  ORDER BY ST_Distance(k.location, user_location)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_kiosqs_in_bounds function for consistency
CREATE OR REPLACE FUNCTION get_kiosqs_in_bounds(
  min_lat DECIMAL(9,6),
  min_lng DECIMAL(9,6),
  max_lat DECIMAL(9,6),
  max_lng DECIMAL(9,6),
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE(
  profile_id UUID,
  profile_name JSONB,
  profile_slug JSONB,
  kiosq_id UUID,
  kiosq_name JSONB,
  kiosq_address TEXT,
  kiosq_city TEXT,
  kiosq_latitude DECIMAL(9,6),
  kiosq_longitude DECIMAL(9,6),
  kiosq_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name_translations,
    p.slug_translations,
    k.id,
    k.name_translations,
    k.address,
    k.city,
    k.latitude,
    k.longitude,
    k.status::TEXT
  FROM kiosqs k
  JOIN profiles p ON k.profile_id = p.id
  WHERE 
    k.location IS NOT NULL
    AND NOT k.is_deleted
    AND NOT p.is_deleted
    AND p.is_active = true
    AND p.is_reviewed = true
    AND p.type = 'vendor'
    AND k.status = 'published' -- Added this filter to only return published kiosqs
    AND k.location && ST_SetSRID(ST_MakeBox2D(
      ST_Point(min_lng, min_lat), 
      ST_Point(max_lng, max_lat)
    ), 4326)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure permissions are maintained
GRANT EXECUTE ON FUNCTION get_nearby_profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_kiosqs_in_bounds TO authenticated, anon;

-- Update function comments
COMMENT ON FUNCTION get_nearby_profiles IS 'Find nearby vendor profiles within a specified radius using PostGIS. Only returns active, reviewed vendor profiles with published kiosqs.';
COMMENT ON FUNCTION get_kiosqs_in_bounds IS 'Get published kiosqs within a bounding box for map views. Only returns active, reviewed vendor profiles with published kiosqs.'; 