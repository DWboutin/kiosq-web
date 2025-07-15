-- Migration to remove unused columns from reservations table
-- Removes stripe_payment_intent_id and reservation_time columns
-- Created: 2025-07-14

BEGIN;

-- Remove stripe_payment_intent_id column from reservations table
ALTER TABLE reservations DROP COLUMN IF EXISTS stripe_payment_intent_id;

-- Remove reservation_time column from reservations table
ALTER TABLE reservations DROP COLUMN IF EXISTS reservation_time;

COMMIT; 