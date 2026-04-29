# Phase 1: Reservation Ledger and Status Model - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes the authoritative data foundation for reservations, orders, payments, pickup, refunds, transfers, penalties, admin review, activity history, and idempotency. It does not implement Stripe checkout, QR scanning, producer transfers, refunds, dashboards, or tests beyond migration/type verification; those belong to later phases. The goal is to make later payment and pickup work impossible to build on ambiguous money units, mutable catalog data, overloaded statuses, or duplicate financial transitions.

</domain>

<decisions>
## Implementation Decisions

### Late Cancellation and No-Show Compensation
- **D-01:** For late cancellation or no-show, the client forfeits 20% of the order total as the compensation base.
- **D-02:** Kiosq takes its normal platform commission from that retained 20% before calculating producer compensation.
- **D-03:** The normal v1 platform commission is 5%, matching the current Stripe fee assumption in `actions/create-reservation-payment-intent.ts`; the ledger must snapshot this rate per reservation/settlement so future rate changes do not rewrite history.
- **D-04:** Early cancellation more than 24 hours before pickup receives a full client refund for v1; Kiosq absorbs or separately accounts for payment processor/platform costs rather than subtracting them from the client refund.
- **D-05:** The ledger must store at least these policy amounts in minor units: client paid amount, client refund amount, client retained/penalty amount, platform fee amount, producer compensation amount, and currency.

### Cancellation Cutoff
- **D-06:** The free-cancellation cutoff is exactly 24 hours before the pickup start time.
- **D-07:** If pickup is a time window, the cutoff is based on `pickup_window_start`, not the end of the window.
- **D-08:** The policy snapshot accepted at payment time remains authoritative if producer schedule or pickup data changes later. Later phases may add change workflows, but Phase 1 should not rely on recomputing the accepted cutoff from mutable schedule records.
- **D-09:** Phase 1 should store `pickup_window_start`, optional `pickup_window_end`, `cancellation_cutoff_at`, `policy_version`, and accepted policy terms/snapshot data on the reservation/order/payment foundation.

### Reservation Status Model
- **D-10:** UI-facing statuses should be simple; client and producer surfaces should not expose low-level financial states by default.
- **D-11:** Use a hybrid status model: one primary reservation lifecycle status plus dedicated payment/settlement/refund/transfer records with their own statuses.
- **D-12:** Primary v1 reservation lifecycle statuses are: `payment_pending`, `payment_processing`, `reserved`, `pickup_confirmed`, `cancelled`, `late_cancelled`, `no_show`, `expired`, and `admin_review`.
- **D-13:** Do not add `pickup_ready` or `disputed` as primary reservation statuses in Phase 1. `pickup_ready` can be revisited in a later producer operations/dashboard phase; dispute-like cases begin as `admin_review`.

### Activity History and Audit
- **D-14:** Store two levels of history: user-facing important events and complete internal audit events.
- **D-15:** Client and producer timelines should show important events only: payment received, reservation confirmed, QR generated, pickup confirmed, early cancellation, late cancellation, no-show, refund completed, transfer completed, and admin-review status changes.
- **D-16:** Kiosq admin/support can view or query the complete audit trail; client and producer UI should not expose technical retry events, raw Stripe payloads, idempotency keys, or internal error details.
- **D-17:** Visible history should include role-appropriate amounts. Client sees paid, refunded, retained/penalty amounts. Producer sees compensation and transfer amounts. Client does not need producer/platform split details by default, and producer does not need unrelated client payment internals.
- **D-18:** Activity/audit entries must be append-only for normal application flows and tied to deterministic idempotency keys where financial operations are involved.

### the agent's Discretion
- Exact table names, enum/check constraint names, and RPC names are left to the planner/implementer, provided they follow existing Supabase migration conventions and the decisions above.
- Exact storage shape for policy snapshots is flexible, but it must preserve immutable checkout/policy values and support later dashboard display.
- The planner may decide whether to backfill existing reservation/order rows or create compatibility views, as long as future flows use the new authoritative model.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 1 goal, success criteria, dependencies, and plan slots.
- `.planning/REQUIREMENTS.md` - LEDG-01 through LEDG-05 and traceability for Phase 1.
- `.planning/PROJECT.md` - Product vision, payment architecture decision, constraints, and cancellation/no-show policy.
- `.planning/STATE.md` - Current project position and known blockers/concerns.

### Research
- `.planning/research/SUMMARY.md` - Roadmap implications, architecture recommendation, critical pitfalls, and phase-specific research flags.
- `.planning/research/ARCHITECTURE.md` - Recommended reservation ledger/status model, table responsibilities, RPC boundaries, idempotency boundaries, and build order.
- `.planning/research/PITFALLS.md` - Payment, money-unit, status, idempotency, refund/transfer, and QR/security pitfalls that Phase 1 must avoid.
- `.planning/research/STACK.md` - Existing stack and recommended additions for payment/reservation infrastructure.

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` - Current Next.js/Supabase architecture, layers, and integration points.
- `.planning/codebase/CONVENTIONS.md` - Naming, server action, API route, factory, migration, and error-handling conventions.
- `.planning/codebase/CONCERNS.md` - Known reservation/payment issues, duplicate order risk, money-unit drift, status fragility, and missing test baseline.

### Existing Implementation Touchpoints
- `supabase/migrations/20250713000000_create_orders_reservations.sql` - Current `reservations`, `orders`, and `order_items` foundation to migrate/extend.
- `supabase/migrations/20250714000000_update_reservations_orders_workflow.sql` - Current status constraints/triggers and known conflict with target lifecycle.
- `supabase/migrations/20250714000001_remove_reservation_columns.sql` - Existing removal of reservation payment/time columns.
- `actions/create-reservation.ts` - Current multi-step reservation/order/item write path and money-unit inconsistency.
- `actions/create-reservation-payment-intent.ts` - Current immediate destination-charge behavior, 5% platform fee assumption, and sensitive logging to replace in later phases.
- `app/api/payment-success/route.ts` - Current return-route financial mutation path to make display-only in Phase 2.
- `app/api/users/current/reservations/route.ts` - Current private reservation read shape and raw nested graph.
- `utils/factories/authenticated-user-reservations-factory.ts` - Current DTO mapping for reservations/orders/order items.
- `components/client-pages/dashboard-profile-reservations/dashboard-profile-reservations.tsx` - Current raw reservation JSON dashboard placeholder.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `supabase/migrations/*.sql`: Existing migration style uses SQL files with explicit constraints, indexes, triggers, RLS, and policies. Phase 1 should add corrective migrations here and regenerate `types/supabase.ts`.
- `types/supabase.ts`: Generated Supabase types are the downstream contract after schema changes; planning should include type regeneration.
- `utils/factories/authenticated-user-reservations-factory.ts`: Existing reservation/order DTO mapping can inform later dashboard DTOs, but Phase 1 should not preserve raw money/status shape if it conflicts with the new ledger model.
- `utils/constants.ts` and `types/app.ts`: Good candidates for shared status labels/types once schema changes exist, though exact placement is planner discretion.

### Established Patterns
- Server actions currently perform multi-table mutations directly, but Phase 1 should prepare transaction-backed Postgres RPCs for guarded status transitions and idempotent financial writes.
- Existing code maps snake_case Supabase rows to camelCase app DTOs through factories; new ledger/payment/settlement shapes should preserve that pattern.
- Current app uses named exports, `@/*` aliases, and kebab-case filenames; new helpers should follow the patterns documented in `.planning/codebase/CONVENTIONS.md`.
- Existing migrations use check constraints for status values, but current triggers reference status values that are not aligned with the target lifecycle; Phase 1 should replace rather than pile on contradictory status logic.

### Integration Points
- `reservations`, `orders`, and `order_items` already exist and should be extended/migrated rather than ignored.
- `orders.total_amount` and `order_items.unit_price/total_price` currently use numeric money; Phase 1 must introduce authoritative minor-unit amount fields for future payment correctness.
- `actions/create-reservation.ts` currently creates reservation, order, and order item without a transaction; Phase 1 should create the database/RPC foundation that later phases call.
- `actions/create-reservation-payment-intent.ts` currently uses `transfer_data.destination` and logs sensitive payment details; Phase 1 only models data for the later replacement.
- `app/api/payment-success/route.ts` currently mutates financial state from a public return route; Phase 1 should model idempotency/status primitives used by Phase 2 to move this to webhooks.

</code_context>

<specifics>
## Specific Ideas

- The business language for v1 should stay simple for users: the system can have detailed internal payment/settlement states, but client and producer UI should read like reservation states, not accounting states.
- The 20% late-cancel/no-show penalty is a compensation base, not pure platform revenue.
- The accepted policy snapshot matters; do not make future planning depend on mutable schedule/product state when explaining cancellation eligibility or amounts.

</specifics>

<deferred>
## Deferred Ideas

- QR generation, QR scan confirmation, token expiry/revocation UI, and producer scanner behavior belong to Phase 3.
- Stripe webhook finalization, PaymentIntent creation changes, and payment return display-only conversion belong to Phase 2.
- Stripe transfers, refunds, transfer reversals, no-show actions, and settlement execution belong to Phase 4.
- Client/producer dashboards and bilingual timeline/status presentation belong to Phase 5.
- Automated and manual verification belongs to Phase 6, though Phase 1 should leave schema/RPCs testable.

</deferred>

---

*Phase: 01-reservation-ledger-and-status-model*
*Context gathered: 2026-04-29*
