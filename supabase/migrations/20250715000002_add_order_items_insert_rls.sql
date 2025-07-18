-- Migration to add FOR INSERT RLS policy for order_items table
-- Allows customers to insert order items for their own orders
-- Created: 2025-07-15

BEGIN;

CREATE POLICY order_items_insert_customer ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND customer_id = auth.uid()
    )
  );

COMMIT; 