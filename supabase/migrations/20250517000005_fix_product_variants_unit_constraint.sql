-- Migration to fix the product_variants unit constraint issue
-- This removes the constraint entirely without setting defaults or standardizing data

BEGIN;

-- Drop the existing constraint
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_unit_check;

-- Remove the default value
ALTER TABLE product_variants ALTER COLUMN unit DROP DEFAULT;

-- Ensure the product_prices table constraints won't cause similar issues
-- Currency check constraint (update the existing one if it exists)
ALTER TABLE product_prices DROP CONSTRAINT IF EXISTS product_prices_currency_check;
ALTER TABLE product_prices ADD CONSTRAINT product_prices_currency_check
  CHECK (currency IN ('CAD', 'USD'));

-- Add comments to document the changes
COMMENT ON COLUMN product_variants.unit IS 'Unit of measurement for product variant. No constraints applied.';
COMMENT ON COLUMN product_prices.currency IS 'Currency code (CAD, USD)';

COMMIT; 