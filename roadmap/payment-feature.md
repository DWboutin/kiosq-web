Ran tool

Read file: /Users/mikaelboutin/Desktop/coding-projects/kiosq-web/supabase/migrations/20250418000000_ecommerce_schema.sql
Ran tool

Read file: /Users/mikaelboutin/Desktop/coding-projects/kiosq-web/supabase/migrations/20250701000000_create_kiosqs_table.sql
Ran tool

Read file: /Users/mikaelboutin/Desktop/coding-projects/kiosq-web/supabase/migrations/20250702000000_create_schedules_table.sql
Ran tool

Ran tool

Ran tool

Ran tool

Based on a sequential analysis of your migration files (tracing from the initial e-commerce schema through updates to products, profiles, kiosqs, schedules, and geolocation), your DB structure, and your project's code layout (including actions, features for product/schedule management, dashboard components, and hooks), I'll explain the plan for implementing the reservation feature without making any code changes at this stage. I'll address your specific questions about needing a new table and managing product/variant prices, while outlining how the overall feature (including Stripe integration and vendor acceptance) would be handled. This is a high-level design proposal grounded in your existing setup—vendors have profiles with associated kiosqs (locations) and schedules (operating hours), products have variants with pricing/inventory, and there's no existing orders/reservations table or payment integration.

### Do You Need a New Table?

Yes, you'll need at least one new table (e.g., `reservations`) to store reservation data, as your current schema lacks anything for tracking orders, bookings, or payments. Based on the migrations, your DB is built around users/profiles (vendors), products/variants (with prices and inventory), kiosqs (vendor locations), and schedules (operating times). Reservations would tie into these but require dedicated storage for tracking status, payments, and acceptance. Optionally, you could add a related table for reservation items if a single reservation can include multiple products/variants (similar to line items in an order).

- **Proposed `reservations` Table Structure** (to be added via a new migration, e.g., `202507XX_create_reservations_table.sql`):

  - `id` (UUID, primary key).
  - `customer_id` (UUID, references `users.id` or `profiles.id` for the buyer).
  - `vendor_profile_id` (UUID, references `profiles.id` for the seller).
  - `kiosq_id` (UUID, references `kiosqs.id`, to tie to a specific vendor location—assuming reservations are location-based, per your kiosq-focused app).
  - `schedule_id` (UUID, references `schedules.id`, if reservations need to align with vendor availability; later migrations allow multiple schedules per profile/kiosq).
  - `reservation_time` (TIMESTAMPTZ, for the requested pickup/delivery time, validated against the schedule).
  - `status` (VARCHAR, e.g., 'pending', 'accepted', 'rejected', 'completed', 'canceled'—starts as 'pending' until vendor accepts).
  - `total_amount` (NUMERIC, calculated from product/variant prices; stored for audit).
  - `stripe_payment_intent_id` (TEXT, to link to Stripe for held payments).
  - `stripe_account_id` (TEXT, the vendor's connected Stripe account ID).
  - `notes` (TEXT or JSONB, for customer/vendor comments).
  - Audit fields: `created_at`, `updated_at`, `is_deleted` (matching your schema patterns).
  - RLS policies: Customers view their own; vendors view/accept for their profile; admins manage all (similar to your product/profile policies).

- **Optional Related Table (`reservation_items`)**:
  - If reservations can include multiple items: `id`, `reservation_id` (foreign key), `product_variant_id` (references `product_variants.id`), `quantity` (NUMERIC, checked against `inventory.quantity`).
  - This allows line-item details, with prices pulled from `product_prices`.

This table would be created in a migration that also adds indexes (e.g., on `vendor_profile_id` for fast vendor queries), triggers for timestamps (like your `trigger_set_timestamp`), and possibly a materialized view for reservation search (similar to your `product_search` view).

### How to Manage the Feature for Products/Variants Prices

We'll leverage your existing `product_prices` and `product_variants` tables (from early migrations like `20250418000000_ecommerce_schema.sql` and updates in `20250517000000_update_product_tables.sql`) without altering them—prices are already per variant with `base_price`, `discount_amount/type`, `final_price` (generated), and currency. Inventory is handled in `inventory` (tied to variants). No new price-related tables or columns needed; instead, reservations will reference and calculate from these at creation time.

- **Price Calculation and Management**:
  - When a customer initiates a reservation (e.g., via a new form in your product details page), fetch the current `final_price` from `product_prices` for the selected variant (considering `effective_from/to` dates and any partitioning).
  - Multiply by quantity (validate against `inventory.quantity` to prevent over-reservation; deduct temporarily on creation or fully on acceptance).
  - Add any taxes from `tax_components`/`product_taxes` if applicable (your schema supports this).
  - Store the snapshot total in `reservations.total_amount` for immutability (in case prices change later).
  - Handle units from `inventory.unit` (e.g., 'kilogram') in the UI for user-friendly display.
  - Edge cases: If variants have options (JSONB in `product_variants`), ensure the reservation specifies them; use your existing hooks like `use-products-invalidator` to refresh prices dynamically.

This keeps pricing logic simple and reusable—your actions like `create-product-variant.ts` and requests like `get-authenticated-user-product-by-id.ts` can be extended for validation.

### Overall Feature Management and Flow

The feature would be implemented as a marketplace-style reservation system using Stripe Connect (for vendors to receive payments) and Stripe Payment Intents (for holding/capturing funds). Your app is a Next.js project with Supabase backend, so we'd add new actions (in `/actions`), features (in `/features`), components (in `/components`), and dashboard routes (in `/app/[locale]/dashboard`). Accessibility (e.g., keyboard navigation in forms) and functional programming (e.g., pure functions for price calcs) would be prioritized per your rules. No Supabase commands would be run without approval.

- **Vendor Stripe Connection**:

  - Add a field to `profiles` (via migration, e.g., `stripe_account_id` TEXT) to store the connected account ID.
  - In the vendor dashboard (e.g., extending `dashboard-your-store.tsx` or `vendor-profile-form-drawer.tsx`), add a "Connect Stripe" button that redirects to Stripe's OAuth flow (using Stripe.js). On callback, store the account ID via a new action (e.g., `connect-stripe-account.ts`).
  - This ensures vendors have "data ready to receive payments" (e.g., bank details via Stripe dashboard). Only connected vendors can receive reservations.

- **Reservation Creation (Customer Side)**:

  - On product pages (e.g., extending `product-details.tsx` or `related-products.tsx`), add a "Reserve" button/form.
  - Customer selects variant, quantity, kiosq (from vendor's options via `get-authenticated-user-kiosq-by-id.ts`), and time (validated against schedules using your `schedule-form-drawer.tsx` logic).
  - Create a Stripe Payment Intent (server-side action, e.g., `create-reservation.ts`) to authorize (not capture) the payment—total from prices above, held on customer's card.
  - Insert into `reservations` with status 'pending'; link to Stripe ID.
  - Notify vendor (e.g., via email or in-app, using your existing notification setup if any).

- **Vendor Acceptance and Payment Release**:

  - In vendor dashboard (new section, e.g., `dashboard-reservations.tsx` under `/app/[locale]/dashboard`), list pending reservations (query via new request like `get-vendor-reservations.ts`, filtered by `vendor_profile_id`).
  - Vendor reviews details (product/variant, price, time, customer info) and accepts/rejects via button (action like `accept-reservation.ts`).
  - On acceptance: Update status to 'accepted', capture the Payment Intent (releases funds), and transfer to vendor's Stripe account (using Stripe Connect transfers, deducting any platform fee).
  - On rejection: Cancel the intent (refund auth hold), update status.
  - Inventory deduction happens on acceptance; use revalidators (like `product-revalidator.ts`) to update caches.

- **Additional Management**:
  - Status updates trigger notifications/emails.
  - Integrate with geolocation (from `add_postgis_geolocation.sql`) for nearest kiosqs in reservation forms.
  - Edge cases: Timeouts (auto-reject if not accepted in 24h), cancellations (with partial refunds), multi-item support via `reservation_items`.
  - Security: RLS ensures vendors only access their reservations; use your middleware for auth.
  - Testing: Start dev server only after checking if it's running (per rules); use your skeletons for loading states.

This plan fits your project's structure (e.g., reusing translation JSONB for multi-locale, hooks for state), adds the feature modularly, and ensures payments are held until acceptance. If this aligns, I can proceed to implement via code edits (e.g., starting with the migration) in the next step—let me know!
