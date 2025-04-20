-- E-commerce Database Schema

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Audit Fields Function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_vendor BOOLEAN DEFAULT FALSE,
  vendor_banner_image TEXT,
  vendor_name_translations JSONB DEFAULT '{}',
  vendor_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','vendor','admin')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_translations JSONB NOT NULL DEFAULT '{}',
  description_translations JSONB DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  order_rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_translations JSONB NOT NULL DEFAULT '{}',
  description_translations JSONB DEFAULT '{}',
  features_translations JSONB DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  main_image_url TEXT,
  additional_images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Product Variants Table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  option_values JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'piece' CHECK (unit IN ('piece', 'gram', 'kilogram', 'milliliter', 'liter')),
  low_stock_threshold NUMERIC(10,2) DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Product Prices Table (Partitioned)
CREATE TABLE product_prices (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  base_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'flat' CHECK (discount_type IN ('flat', 'percentage')),
  final_price NUMERIC(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN discount_type = 'flat' THEN GREATEST(base_price - discount_amount, 0)
      WHEN discount_type = 'percentage' THEN GREATEST(base_price - (base_price * discount_amount / 100), 0)
      ELSE base_price 
    END
  ) STORED,
  currency VARCHAR(3) DEFAULT 'CAD' CHECK (currency IN ('CAD', 'USD')),
  is_tax_inclusive BOOLEAN DEFAULT FALSE,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (id, effective_from)
) PARTITION BY RANGE (effective_from);

-- Create initial partition for 2025
CREATE TABLE product_prices_2025 PARTITION OF product_prices
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Tax Components Table
CREATE TABLE tax_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  region VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Product Tax Associations
CREATE TABLE product_taxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tax_component_id UUID NOT NULL REFERENCES tax_components(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, tax_component_id)
);

-- Create Indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'published';
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX idx_product_prices_variant_id ON product_prices(variant_id);

-- Create GIN indexes for JSONB and full-text search
CREATE INDEX idx_products_name_translations ON products USING GIN (name_translations);
CREATE INDEX idx_categories_name_translations ON categories USING GIN (name_translations);

-- Create update timestamp triggers
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_product_variants
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_inventory
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_product_prices
BEFORE UPDATE ON product_prices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tax_components
BEFORE UPDATE ON tax_components
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create user function and trigger
CREATE OR REPLACE FUNCTION create_user_and_profile()
RETURNS TRIGGER AS $$
DECLARE
  _email TEXT;
  _display_name TEXT;
BEGIN
  -- Handle potentially NULL email (could happen with phone auth)
  _email := COALESCE(NEW.email, '');
  
  -- Extract display name from metadata with fallbacks
  _display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(_email, '@', 1),
    'User ' || substr(NEW.id::text, 1, 8)
  );
  
  -- Create entry in custom users table with exception handling
  BEGIN
    INSERT INTO public.users (
      id, 
      email, 
      display_name,
      is_vendor,
      vendor_name_translations,
      created_at,
      updated_at,
      is_deleted
    )
    VALUES (
      NEW.id, 
      _email,
      _display_name,
      FALSE,
      '{}'::jsonb,
      NOW(),
      NOW(),
      FALSE
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating user: %', SQLERRM;
    -- Continue even if user creation fails, don't block auth
  END;
  
  -- Create entry in profiles table with exception handling
  BEGIN
    INSERT INTO public.profiles (
      id, 
      role, 
      metadata,
      created_at,
      updated_at,
      is_deleted
    )
    VALUES (
      NEW.id, 
      'user', 
      '{}'::jsonb,
      NOW(),
      NOW(),
      FALSE
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile: %', SQLERRM;
    -- Continue even if profile creation fails, don't block auth
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER after_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_user_and_profile();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own data
CREATE POLICY users_view_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles can be viewed by the owner
CREATE POLICY profiles_view_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles can be updated by the owner
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products can be viewed by anyone if published
CREATE POLICY products_view_published ON products
  FOR SELECT USING (status = 'published' AND NOT is_deleted);

-- Products can be viewed by their owner regardless of status
CREATE POLICY products_view_own ON products
  FOR SELECT USING (auth.uid() = user_id);

-- Products can be updated by their owner
CREATE POLICY products_update_own ON products
  FOR UPDATE USING (auth.uid() = user_id);

-- Product variants can be viewed with published products
CREATE POLICY product_variants_view_published ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.status = 'published'
      AND NOT products.is_deleted
    )
  );

-- Categories can be viewed by anyone
CREATE POLICY categories_view_all ON categories
  FOR SELECT USING (NOT is_deleted);

-- Creating a materialized view for product search
CREATE MATERIALIZED VIEW product_search AS
SELECT
  p.id,
  p.name_translations,
  p.description_translations,
  p.slug,
  p.main_image_url,
  p.status,
  p.is_featured,
  c.name_translations AS category_name,
  c.slug AS category_slug,
  u.display_name AS vendor_name,
  u.vendor_slug,
  MIN(pp.final_price) AS min_price,
  MAX(pp.final_price) AS max_price,
  COALESCE(SUM(i.quantity), 0) AS total_inventory
FROM
  products p
LEFT JOIN
  categories c ON p.category_id = c.id
LEFT JOIN
  users u ON p.user_id = u.id
LEFT JOIN
  product_variants pv ON p.id = pv.product_id
LEFT JOIN
  product_prices pp ON pv.id = pp.variant_id
LEFT JOIN
  inventory i ON pv.id = i.variant_id
WHERE
  p.status = 'published'
  AND NOT p.is_deleted
  AND NOT c.is_deleted
  AND NOT u.is_deleted
  AND (pp.effective_to IS NULL OR pp.effective_to > NOW())
GROUP BY
  p.id, c.name_translations, c.slug, u.display_name, u.vendor_slug;

-- Create index on the materialized view
CREATE INDEX idx_product_search_name ON product_search USING GIN (name_translations);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_product_search()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_search;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the materialized view
CREATE TRIGGER refresh_product_search_on_product_change
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

CREATE TRIGGER refresh_product_search_on_variant_change
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

CREATE TRIGGER refresh_product_search_on_price_change
AFTER INSERT OR UPDATE OR DELETE ON product_prices
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search();

CREATE TRIGGER refresh_product_search_on_inventory_change
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH STATEMENT EXECUTE FUNCTION refresh_product_search(); 