# Phase 1 Pattern Map

**Phase:** 01 - Reservation Ledger and Status Model
**Created:** 2026-04-29
**Purpose:** Map new Phase 1 files to closest existing codebase patterns.

## Target Files and Analogs

| New or Modified File | Role | Closest Existing Analog | Pattern to Follow |
|----------------------|------|-------------------------|-------------------|
| `supabase/migrations/20260429000000_reservation_ledger_foundation.sql` | Corrective schema foundation | `supabase/migrations/20250713000000_create_orders_reservations.sql` | `BEGIN;`, explicit tables, indexes, RLS, `trigger_set_timestamp()` reuse, `COMMIT;` |
| `supabase/migrations/20260429000001_reservation_status_activity_rpc.sql` | Status/activity RPC migration | `supabase/migrations/20250714000000_update_reservations_orders_workflow.sql` | Drop/replace old constraints/triggers, migrate status data, create PL/pgSQL functions and triggers |
| `supabase/migrations/20260429000002_reservation_idempotency_indexes.sql` | Uniqueness/idempotency/index migration | `supabase/migrations/20250701000001_update_kiosqs_status_and_rls.sql` | `CREATE INDEX IF NOT EXISTS`, targeted RLS, explicit checks |
| `utils/reservations/money.ts` | Money constants and calculations | `utils/slugify.ts`, `utils/cache-keys.ts` | Small named exports, no side effects, pure helpers |
| `utils/reservations/status.ts` | Lifecycle constants, status labels, transition map | `utils/constants.ts` | UPPER_SNAKE_CASE constants, typed arrays, named exports |
| `types/app.ts` | App-level type aliases | Existing `RawReservation`, `RawOrder`, `RawOrderItem` aliases | Add aliases without disrupting current DTO types |
| `types/supabase.ts` | Generated database contract | Existing generated file | Regenerate with `npm run update-types`, do not hand-edit beyond generated output |
| `actions/create-reservation.ts` | Legacy status compatibility | Existing server action style | `"use server"`, named export, Supabase client, throw on errors |
| `app/api/payment-success/route.ts` | Legacy status compatibility | Existing route handler style | Keep route handler shape; only status literals needed for Phase 1 compatibility |

## Required Schema Patterns

- Use `BIGINT` for authoritative `_minor` money columns.
- Use uppercase `TEXT` currency with checks equivalent to `currency = upper(currency)` and `char_length(currency) = 3`.
- Use `JSONB NOT NULL DEFAULT '{}'::jsonb` for policy and checkout snapshots.
- Use deterministic `idempotency_key TEXT` columns with unique constraints on financial/audit/idempotency tables.
- Use `FOR UPDATE` in transition RPCs before changing reservation lifecycle state.
- Use append-only tables for activity and ledger entries; normal app flows should insert, not update existing history rows.

## Required Activity Events

Use these event keys exactly so later bilingual copy can map them without parsing prose:

- `payment_received`
- `reservation_confirmed`
- `qr_generated`
- `pickup_confirmed`
- `early_cancelled`
- `late_cancelled`
- `no_show`
- `refund_completed`
- `transfer_completed`
- `admin_review_changed`
- `internal_retry`
- `internal_error`

## Files to Avoid

Phase 1 should not touch these unless a build/type failure requires a small compatibility edit:

- `components/client-pages/dashboard-profile-reservations/*`
- `app/[locale]/dashboard/reservations/page.tsx`
- `features/reservation-button/*`
- `features/stripe-payment/*`
- New QR or scanner UI files

Existing dirty work is present in reservation dashboard-related files; implementation must preserve those changes.
