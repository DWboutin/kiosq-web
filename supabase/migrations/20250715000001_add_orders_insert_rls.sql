-- Migration to add FOR INSERT RLS policy for orders table
-- Allows only the customer to insert their own order
-- Created: 2025-07-15

BEGIN;

CREATE POLICY orders_insert_customer ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

COMMIT; 