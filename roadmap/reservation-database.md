# Reservation/Order Feature: Database Roadmap

This file outlines the database-related steps for implementing the reservation and order feature, building on the existing migration in supabase/migrations/20250713000000_create_orders_reservations.sql.

## 1. Review and Apply Migration

- Ensure the migration adds `reservations`, `orders`, and `order_items` tables with appropriate fields, indexes, triggers, and RLS policies.
- Add `stripe_account_id` to `profiles` with CHECK constraint to restrict to vendor profiles only.
- Run `supabase db push` (with user approval) to apply to local/dev DB.

## 2. Add Triggers and Functions

- Create a trigger to auto-calculate `orders.total_amount` from `order_items` on insert/update (functional approach).
- Add a function to snapshot prices/quantities from `product_prices` and `inventory` when creating order_items.

## 3. RLS Refinements

- Enhance policies for multi-user access (e.g., admin view all).
- Ensure policies align with user roles from `20250418000005_add_user_roles.sql`.

## 4. Materialized Views/Indexes

- If needed, add a view for reservation search, similar to `product_search` in `20250418000007_fix_materialized_view.sql`.
- Optimize indexes for common queries (e.g., by status or vendor_profile_id).

## 5. Data Validation

- Add CHECK constraints for valid statuses and positive quantities.
- Integrate with existing schemas (e.g., link to kiosqs/schedules without overlaps).

## Next Steps

- After DB setup, proceed to backend actions for CRUD operations.
