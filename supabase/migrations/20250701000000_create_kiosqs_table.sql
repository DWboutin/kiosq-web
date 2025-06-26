-- Kiosqs Table and Storage Bucket Migration

-- Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create kiosqs table
CREATE TABLE kiosqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_translations JSONB NOT NULL DEFAULT '{}',
  description_translations JSONB DEFAULT '{}',
  address TEXT,
  city TEXT,
  state TEXT,
  country CHAR(2),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  image_url TEXT,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'temporary closed', 'closed')),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON kiosqs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create storage bucket for kiosqs images
insert into storage.buckets (id, name, public) values ('kiosqs-images', 'kiosqs-images', true)
  on conflict (id) do nothing; 