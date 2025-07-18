-- Migration to add FOR INSERT RLS policy for reservations table
-- Allows only the customer to insert their own reservation
-- Created: 2025-07-15

BEGIN;

CREATE POLICY reservations_insert_customer ON reservations
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

COMMIT; 