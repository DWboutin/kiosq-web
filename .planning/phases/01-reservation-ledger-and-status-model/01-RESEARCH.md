# Phase 1 Research: Reservation Ledger and Status Model

**Phase:** 01 - Reservation Ledger and Status Model
**Researched:** 2026-04-29
**Status:** Ready for planning
**Confidence:** HIGH for codebase fit and schema/RPC direction; MEDIUM for backfilling ambiguous legacy money units.

## User Constraints

Locked decisions from `01-CONTEXT.md`:

- **D-01:** For late cancellation or no-show, the client forfeits 20% of the order total as the compensation base.
- **D-02:** Kiosq takes its normal platform commission from that retained 20% before calculating producer compensation.
- **D-03:** The normal v1 platform commission is 5%, matching the current Stripe fee assumption in `actions/create-reservation-payment-intent.ts`; the ledger must snapshot this rate per reservation/settlement so future rate changes do not rewrite history.
- **D-04:** Early cancellation more than 24 hours before pickup receives a full client refund for v1; Kiosq absorbs or separately accounts for payment processor/platform costs rather than subtracting them from the client refund.
- **D-05:** The ledger must store at least these policy amounts in minor units: client paid amount, client refund amount, client retained/penalty amount, platform fee amount, producer compensation amount, and currency.
- **D-06:** The free-cancellation cutoff is exactly 24 hours before the pickup start time.
- **D-07:** If pickup is a time window, the cutoff is based on `pickup_window_start`, not the end of the window.
- **D-08:** The policy snapshot accepted at payment time remains authoritative if producer schedule or pickup data changes later.
- **D-09:** Phase 1 should store `pickup_window_start`, optional `pickup_window_end`, `cancellation_cutoff_at`, `policy_version`, and accepted policy terms/snapshot data on the reservation/order/payment foundation.
- **D-10:** UI-facing statuses should be simple; client and producer surfaces should not expose low-level financial states by default.
- **D-11:** Use a hybrid status model: one primary reservation lifecycle status plus dedicated payment/settlement/refund/transfer records with their own statuses.
- **D-12:** Primary v1 reservation lifecycle statuses are: `payment_pending`, `payment_processing`, `reserved`, `pickup_confirmed`, `cancelled`, `late_cancelled`, `no_show`, `expired`, and `admin_review`.
- **D-13:** Do not add `pickup_ready` or `disputed` as primary reservation statuses in Phase 1.
- **D-14:** Store two levels of history: user-facing important events and complete internal audit events.
- **D-15:** Client and producer timelines should show important events only: payment received, reservation confirmed, QR generated, pickup confirmed, early cancellation, late cancellation, no-show, refund completed, transfer completed, and admin-review status changes.
- **D-16:** Kiosq admin/support can view or query the complete audit trail; client and producer UI should not expose technical retry events, raw Stripe payloads, idempotency keys, or internal error details.
- **D-17:** Visible history should include role-appropriate amounts. Client sees paid, refunded, retained/penalty amounts. Producer sees compensation and transfer amounts.
- **D-18:** Activity/audit entries must be append-only for normal application flows and tied to deterministic idempotency keys where financial operations are involved.

Discretion areas:

- Exact table names, enum/check constraint names, and RPC names can follow existing Supabase migration conventions.
- Exact policy snapshot storage shape can be JSONB plus typed columns if it preserves immutable checkout/policy values.
- Backfill or compatibility views may be chosen as long as future flows use the new authoritative model.

Deferred scope:

- Do not implement Stripe checkout/webhook finalization, QR token generation/scanning, transfer/refund execution, dashboards, or broad automated tests in Phase 1.

## Standard Stack

- Supabase SQL migrations remain the source of truth for schema, RLS, constraints, triggers, and RPCs. [VERIFIED: codebase grep]
- The current reservation schema is in `supabase/migrations/20250713000000_create_orders_reservations.sql`, then changed by `20250714000000_update_reservations_orders_workflow.sql` and insert policies in `2025071500000*.sql`. [VERIFIED: codebase grep]
- Generated database types live in `types/supabase.ts`; the repo script for type refresh is `npm run update-types`. [VERIFIED: package.json]
- Schema push command exists as `npm run db:push`, wrapping `npx supabase@beta db push`. [VERIFIED: package.json]
- No test runner is configured; available repo checks are `npm run build` and the Supabase migration/type scripts. [VERIFIED: package.json and `.planning/codebase/TESTING.md`]

## Architecture Patterns

### Pattern 1: Corrective Migrations

Add new dated migrations after the existing `20250720...` files. Use explicit `BEGIN;` / `COMMIT;`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`, and RLS policies matching the existing SQL style. [VERIFIED: supabase/migrations]

### Pattern 2: Hybrid Lifecycle Model

Keep `reservations.status` as the primary user-facing lifecycle status, and add dedicated payment/settlement/refund/transfer tables for low-level financial state. This implements D-10, D-11, D-12, and avoids overloading one column with every Stripe or payout state. [VERIFIED: 01-CONTEXT.md]

### Pattern 3: Immutable Snapshot Plus Minor Units

Add typed columns for pickup/cutoff and JSONB snapshots for accepted product/policy data. Add integer `_minor` money columns and uppercase three-letter `currency` checks. Keep existing numeric columns only for compatibility until later phases remove old write paths. [VERIFIED: codebase concerns and context]

### Pattern 4: RPC-Owned Transitions

Create Postgres RPCs for status transitions and activity writes. The RPC must lock the reservation row with `FOR UPDATE`, reject illegal transitions, write deterministic idempotency keys, and create activity/audit entries inside the same transaction. [VERIFIED: research architecture]

### Pattern 5: Compatibility Updates for Legacy Writes

Changing reservation/order status constraints without touching current write paths would break `actions/create-reservation.ts` and `app/api/payment-success/route.ts`, because they currently insert `pending`, `waiting-approval`, and `confirmed`. Plan Phase 1 to update only the status literals required for compatibility; deeper payment finalization remains Phase 2. [VERIFIED: codebase grep]

## Do Not Hand-Roll

- Do not calculate policy amounts with ad hoc `/ 100` or `* 100` outside a shared money helper; the current code already has cents/dollars drift. [VERIFIED: codebase concerns]
- Do not allow client/dashboard code to update terminal reservation status directly; transitions belong in RPCs. [VERIFIED: 01-CONTEXT.md]
- Do not expose idempotency keys, raw Stripe payloads, or internal audit events to client/producer timelines. [VERIFIED: 01-CONTEXT.md and 01-UI-SPEC.md]
- Do not create new user-facing screens, dashboard cards, QR UI, or checkout UI in this phase. [VERIFIED: 01-UI-SPEC.md]

## Common Pitfalls

- **Legacy trigger conflict:** `check_reservation_status_transition()` references `completed` for reservations even though the reservation status check does not allow it. Replace old transition triggers instead of layering new logic on top. [VERIFIED: `20250714000000_update_reservations_orders_workflow.sql`]
- **Runtime status breakage:** Existing actions/routes insert old status values; update status literals if new constraints are applied. [VERIFIED: `actions/create-reservation.ts`, `app/api/payment-success/route.ts`]
- **Money backfill ambiguity:** Existing `orders.total_amount` can be cents or dollars depending on writer path. Backfill minor-unit columns with an explicit legacy assumption marker or keep legacy numeric values as non-authoritative. [VERIFIED: codebase concerns]
- **False-positive schema verification:** Type/build checks can pass while live DB schema is stale. Include a blocking schema push task before final verification. [VERIFIED: plan-phase schema gate]
- **Overbuilding downstream phases:** Do not implement Stripe webhook, QR tokens, producer transfers, refunds, no-show actions, or dashboard UI here. [VERIFIED: roadmap phase boundaries]

## Code Examples

Use these exact status values in constraints and helpers:

```text
payment_pending
payment_processing
reserved
pickup_confirmed
cancelled
late_cancelled
no_show
expired
admin_review
```

Use these exact policy constants:

```text
PLATFORM_FEE_BPS = 500
LATE_CANCEL_OR_NO_SHOW_BPS = 2000
DEFAULT_RESERVATION_POLICY_VERSION = "kiosq-policy-v1"
DEFAULT_RESERVATION_CURRENCY = "CAD"
```

Use these activity visibility values:

```text
client
producer
internal
```

## Validation Architecture

Phase 1 validation should rely on fast, deterministic checks because no test runner exists yet:

- Static migration checks with `rg` for required tables, constraints, triggers, RPC names, status values, idempotency keys, and RLS policies.
- Schema application check with `npm run db:push` after all migration files are written.
- Type refresh check with `npm run update-types` and `rg` against `types/supabase.ts`.
- Production build check with `npm run build` after generated types and compatibility edits are in place.

## Planning Recommendation

Use the roadmap's 3-plan split:

1. Schema foundation for money, snapshots, ledger/payment/settlement/refund/transfer records.
2. Guarded lifecycle/status transition RPCs, activity history, and legacy status compatibility.
3. Idempotency/uniqueness/indexes, schema push, generated types, and final verification.

## RESEARCH COMPLETE
