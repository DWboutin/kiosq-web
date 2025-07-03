-- Add PostGIS extension and geolocation support
-- This migration adds PostGIS extension, geography columns, spatial indexes, and RPC functions

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Grant usage on PostGIS schema to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Add geography columns to existing tables (keeping lat/lng for backwards compatibility)
ALTER TABLE kiosqs ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Create spatial indexes for efficient geospatial queries
CREATE INDEX IF NOT EXISTS idx_kiosqs_location ON kiosqs USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);

-- Function to sync geography columns with lat/lng coordinates
CREATE OR REPLACE FUNCTION sync_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update location geography column when lat/lng changes
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically sync geography columns
DROP TRIGGER IF EXISTS kiosqs_sync_location ON kiosqs;
CREATE TRIGGER kiosqs_sync_location
  BEFORE INSERT OR UPDATE ON kiosqs
  FOR EACH ROW EXECUTE FUNCTION sync_location_from_coordinates();

DROP TRIGGER IF EXISTS users_sync_location ON users;
CREATE TRIGGER users_sync_location
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION sync_location_from_coordinates();

-- Update existing data to populate geography columns
UPDATE kiosqs 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

UPDATE users 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- RPC function to get nearby profiles using PostGIS
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
    k.country,
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
    AND p.type = 'vendor'
    AND ST_DWithin(k.location, user_location, search_radius_km * 1000) -- ST_DWithin uses meters
  ORDER BY ST_Distance(k.location, user_location)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_profiles TO authenticated, anon;

-- Additional helper function to get distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_postgis(
  lat1 DECIMAL(9,6),
  lng1 DECIMAL(9,6),
  lat2 DECIMAL(9,6),
  lng2 DECIMAL(9,6)
) RETURNS DECIMAL(8,2) AS $$
BEGIN
  RETURN (ST_Distance(
    ST_SetSRID(ST_MakePoint(lng1, lat1), 4326),
    ST_SetSRID(ST_MakePoint(lng2, lat2), 4326)
  ) / 1000)::DECIMAL(8,2); -- Convert meters to km
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_distance_postgis TO authenticated, anon;

-- Function to get kiosqs within a bounding box (useful for map views)
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
    k.store_status
  FROM kiosqs k
  JOIN profiles p ON k.profile_id = p.id
  WHERE 
    k.location IS NOT NULL
    AND NOT k.is_deleted
    AND NOT p.is_deleted
    AND p.is_active = true
    AND p.type = 'vendor'
    AND k.location && ST_SetSRID(ST_MakeBox2D(
      ST_Point(min_lng, min_lat), 
      ST_Point(max_lng, max_lat)
    ), 4326)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_kiosqs_in_bounds TO authenticated, anon;

-- Add comments for documentation
COMMENT ON FUNCTION get_nearby_profiles IS 'Find nearby vendor profiles within a specified radius using PostGIS';
COMMENT ON FUNCTION calculate_distance_postgis IS 'Calculate distance between two geographic points using PostGIS';
COMMENT ON FUNCTION get_kiosqs_in_bounds IS 'Get kiosqs within a bounding box for map views';
COMMENT ON COLUMN kiosqs.location IS 'PostGIS geography point for efficient spatial queries';
COMMENT ON COLUMN users.location IS 'PostGIS geography point for user location'; 