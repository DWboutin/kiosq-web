-- Migration to remove partitioning from product_prices table
-- This eliminates the partition-related error when inserting data
-- Also removes the final_price generated column

BEGIN;

-- 1. Create a temporary table to hold existing data
CREATE TEMP TABLE temp_product_prices AS
SELECT 
  id, 
  variant_id, 
  base_price, 
  discount_amount, 
  discount_type, 
  -- Exclude final_price
  currency, 
  is_tax_inclusive, 
  effective_from, 
  effective_to, 
  created_at, 
  updated_at
FROM product_prices;

-- 2. Drop existing partitioned tables (child partitions first, then parent)
DROP TABLE IF EXISTS product_prices_2025;
DROP TABLE IF EXISTS product_prices;

-- 3. Recreate the product_prices table without partitioning and without final_price
CREATE TABLE product_prices (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  base_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'flat' CHECK (discount_type IN ('flat', 'percentage')),
  -- Remove final_price column
  currency VARCHAR(3) DEFAULT 'CAD' CHECK (currency IN ('CAD', 'USD')),
  is_tax_inclusive BOOLEAN DEFAULT FALSE,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (id)
);

-- 4. Copy data back from the temporary table
INSERT INTO product_prices
SELECT 
  id, 
  variant_id, 
  base_price, 
  discount_amount, 
  discount_type, 
  -- Exclude final_price
  currency, 
  is_tax_inclusive, 
  effective_from, 
  effective_to, 
  created_at, 
  updated_at
FROM temp_product_prices;

-- 5. Create indexes to maintain performance
CREATE INDEX idx_product_prices_variant_id ON product_prices(variant_id);
CREATE INDEX idx_product_prices_effective_range ON product_prices(effective_from, effective_to);

-- 6. Recreate the timestamp trigger
CREATE TRIGGER set_timestamp_product_prices
BEFORE UPDATE ON product_prices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments to document the changes
COMMENT ON TABLE product_prices IS 'Product prices with base price and optional discounts. No longer partitioned by date. Final price can be calculated in application code.';
COMMENT ON COLUMN product_prices.base_price IS 'Base price before any discounts';
COMMENT ON COLUMN product_prices.discount_amount IS 'Amount or percentage to discount from base price';
COMMENT ON COLUMN product_prices.discount_type IS 'Type of discount (flat or percentage)';
COMMENT ON COLUMN product_prices.effective_from IS 'Date from which this price is effective. Defaults to creation time.';

COMMIT; 