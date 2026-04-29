# Pitfalls Research

**Domain:** Reservation pickup payments, delayed marketplace transfers, QR pickup confirmation, cancellation/no-show policy, and dashboard history
**Researched:** 2026-04-29
**Confidence:** HIGH

## Executive Risk Summary

Kiosq must treat the reservation flow as a financial state machine, not as a UI sequence. The existing codebase already has duplicate order creation paths, inconsistent amount units, sensitive payment logging, weak payment finalization, raw reservation dashboard output, and no automated tests. Adding delayed transfers, QR pickup, cancellation penalties, and dashboard history on top of those paths without consolidation would compound the same defects into real money movement errors.

The safest roadmap ordering is: first build the ledger/state-machine foundation; then move payment finalization to signed, idempotent Stripe webhooks; then add QR pickup confirmation as a single-use server transition; then create transfers, refunds, no-show handling, and dashboard history from the ledger. Transfers and refunds must never be modeled as simple UI buttons. Stripe separate charges and transfers make the platform responsible for refunds, fees, chargebacks, and transfer timing, so every customer refund, producer compensation, late cancellation, and pickup confirmation needs an auditable internal record before any Stripe money movement.

## Recommended Phase Vocabulary

Use these phase labels in roadmap planning to map pitfalls to implementation work:

| Phase | Purpose |
|-------|---------|
| Phase 1: Money Ledger and State Model | Normalize amount units, status enums, reservation/order/payment/transfer tables, unique constraints, and transaction-backed RPCs. |
| Phase 2: Webhook-Owned Payment Finalization | Replace client-return finalization with signed Stripe webhooks, event idempotency, and atomic order creation. |
| Phase 3: QR Pickup Confirmation | Add expiring single-use pickup tokens, producer scan UI, ownership checks, and pickup confirmation transitions. |
| Phase 4: Delayed Transfers, Refunds, and No-Show Policy | Create producer transfers only after pickup or policy resolution; implement refunds, transfer reversals, late-cancel/no-show ledger entries, and retryable transfer jobs. |
| Phase 5: Dashboard History and Operations | Build paginated client/producer/admin history, transaction status, dispute/admin-review flags, audit logs, and safe observability. |
| Phase 6: Test and Release Hardening | Add integration/E2E coverage, Stripe CLI scenarios, migration verification, monitoring, and runbooks before production rollout. |

## Critical Pitfalls

### Pitfall 1: Finalizing Paid Orders From Browser Redirects

**What goes wrong:**
Orders and reservations are created from a public return route or client callback after `stripe.confirmPayment`. Redirect payment methods, refreshes, manual URL visits, duplicate browser tabs, and async payment methods can create duplicate orders or mark unpaid reservations as paid.

**Why it happens:**
The app treats the user returning from Stripe as proof of payment completion. The current code already has this split: `features/stripe-payment/stripe-payment-modal.tsx`, `actions/create-reservation.ts`, and `app/api/payment-success/route.ts` can all participate in persistence, while there is no signed webhook endpoint.

**How to avoid:**
Make Stripe webhooks the only authority for payment finalization. The return URL should only show "payment processing" or "payment received" based on existing server state. The webhook must verify Stripe signatures with the raw request body, persist processed event IDs, retrieve the PaymentIntent/Charge as needed, and call one transaction-backed database RPC to create or update `reservations`, `orders`, `order_items`, and payment ledger rows.

**Warning signs:**
- Any route named `payment-success` inserts or updates orders.
- UI code receives a `client_secret` and then writes reservation/order rows after client confirmation.
- The same `stripe_payment_intent_id` can appear in more than one order.
- There is no `stripe_events` or equivalent processed-event table with a unique event ID.
- Webhook tests do not include duplicate event delivery.

**Phase to address:**
Phase 2: Webhook-Owned Payment Finalization. It depends on Phase 1 unique constraints and status model.

**Tests or verification needed:**
- Route test: unsigned webhook payload returns 400 and does not write rows.
- Route test: valid `payment_intent.succeeded` creates exactly one reservation/order/item set.
- Idempotency test: the same Stripe event delivered twice returns success but writes once.
- Duplicate object test: two different Stripe events for the same PaymentIntent do not create duplicate orders.
- E2E/manual Stripe CLI test: redirect back to the app before webhook delivery shows a pending state, then updates after webhook processing.

---

### Pitfall 2: Transferring Producer Funds at Payment Time

**What goes wrong:**
Producer funds are transferred immediately when the customer pays, before pickup is confirmed. Later cancellation, no-show, refund, dispute, or failed async payment handling requires clawback from the producer and can leave Kiosq's platform balance exposed.

**Why it happens:**
Destination charges are the simpler Stripe Connect example, and the existing `createReservationPaymentIntent` currently uses `transfer_data.destination` and `application_fee_amount`, which routes funds at payment time. The milestone requires separate charges and delayed transfers instead.

**How to avoid:**
Create the customer charge on the platform and attach a stable `transfer_group`/reservation ID, but do not include `transfer_data.destination` for v1 delayed pickup payout. Store the producer payout obligation internally. Create the Stripe Transfer only after server-side QR pickup confirmation or after a no-show/late-cancel policy decision. Use idempotency keys for transfer creation and persist `stripe_transfer_id`, amount, currency, status, source charge, destination account, and policy reason.

**Warning signs:**
- PaymentIntent creation includes `transfer_data.destination`.
- The dashboard calls money "paid to producer" immediately after customer payment.
- There is no ledger status between `payment_succeeded` and `transfer_created`.
- Pickup confirmation code does not create or enqueue a transfer.
- Refund logic assumes Stripe reverses transfers automatically for separate charges and transfers.

**Phase to address:**
Phase 1 must remove the destination-charge assumptions from the data model. Phase 4 must implement delayed transfers after Phase 3 pickup confirmation.

**Tests or verification needed:**
- Stripe mock/unit test: PaymentIntent creation does not include `transfer_data.destination`.
- Ledger test: paid reservation creates a producer payable liability but no `stripe_transfer_id`.
- Pickup test: first valid QR scan creates exactly one transfer intent/job.
- Retry test: transfer API timeout with same idempotency key does not create duplicate transfers.
- Policy test: cancelled-before-cutoff reservation never transfers producer funds.

---

### Pitfall 3: Treating Refunds as Independent From Transfers

**What goes wrong:**
Kiosq refunds a customer but does not reverse or reconcile a producer transfer. For separate charges and transfers, Stripe debits the platform for refunds. If the producer was already paid, Kiosq absorbs the loss unless it reduces future payouts or reverses the transfer where possible.

**Why it happens:**
Stripe Refunds API makes refund creation look local to the charge/PaymentIntent, while transfer reversal is a separate Connect operation with balance constraints. Teams often ship a "Refund" button before modeling producer compensation and reversal outcomes.

**How to avoid:**
All refund flows must start from the internal ledger: original charge, producer transfer status, policy reason, customer refund amount, producer compensation amount, platform fee amount, and reversal strategy. If a transfer exists, attempt a transfer reversal for the matching amount when policy requires it; otherwise record an unrecovered balance and route to admin review or future payout offset. Never promise immediate refund completion in the UI until Stripe returns a definitive refund status.

**Warning signs:**
- Refund code only calls `stripe.refunds.create` and never checks transfer state.
- No table records transfer reversal IDs or reversal failure reasons.
- The UI says "refunded" before webhook/Stripe status confirms it.
- Late cancellation and no-show code has no explicit producer compensation row.
- Finance reconciliation cannot answer: customer charged, customer refunded, producer transferred, transfer reversed, platform kept fee.

**Phase to address:**
Phase 4: Delayed Transfers, Refunds, and No-Show Policy.

**Tests or verification needed:**
- Unit tests for refund amount calculations: full refund, partial refund, 20% late-cancel penalty, no-show policy.
- Integration test: refund before producer transfer creates no reversal.
- Integration test: refund after producer transfer attempts reversal and records success/failure.
- Failure test: reversal fails due connected account available balance; reservation moves to `admin_review` or equivalent.
- Dashboard test: producer and client history display refund/reversal status accurately.

---

### Pitfall 4: Inconsistent Money Units and Rounding

**What goes wrong:**
Some rows store dollars and others store cents. A CAD 12.50 reservation can become `12.5`, `1250`, or `125000` depending on which code path writes it. Penalties, producer compensation, and transfers then become financially wrong.

**Why it happens:**
The existing code already has two amount paths: `actions/create-reservation.ts` stores cents in `orders.total_amount`, while `app/api/payment-success/route.ts` stores `paymentIntent.amount / 100`. The database schema uses `NUMERIC(10,2)` for order totals and item prices, while Stripe expects integer minor units for API amounts.

**How to avoid:**
Pick one storage convention for monetary ledger fields: integer minor units plus a currency code. Keep display formatting separate. Introduce a central money module for `toMinorUnits`, `fromMinorUnitsForDisplay`, multiplication by quantity, fee calculation, 20% policy calculation, rounding rules, and currency validation. Add database checks that all Stripe-facing amounts are integer minor units and non-negative. Store immutable price snapshots on order items.

**Warning signs:**
- Any `/ 100` or `* 100` appears outside the money module.
- Database columns named `total_amount` lack a `_minor` suffix or currency.
- `unit_price` and `total_price` are mixed with Stripe amounts in the same calculation.
- Tests compare formatted strings instead of minor-unit integers.
- A migration adds penalties without rounding tests.

**Phase to address:**
Phase 1: Money Ledger and State Model.

**Tests or verification needed:**
- Unit tests for money calculations across representative CAD prices and quantities.
- Migration test: amount columns use integer minor units and include currency.
- Property-style test: `sum(order_items.total_minor) == order.total_minor` for generated fixtures.
- Regression test: existing duplicate cents/dollars code paths are removed.
- Stripe request test: PaymentIntent, Refund, and Transfer amounts are passed as integers.

---

### Pitfall 5: Non-Idempotent Stripe and Database Mutations

**What goes wrong:**
Retries create duplicate PaymentIntents, duplicate transfers, duplicate reservations, duplicate order items, or duplicate refund/reversal records. This can happen from browser double-clicks, network timeouts, webhook retries, server action retries, and background job retries.

**Why it happens:**
Payment flows involve several external and database writes. Stripe supports idempotency keys for POST requests, but that only protects Stripe API operations. The database must also enforce uniqueness and transactional writes.

**How to avoid:**
Define business operation IDs before calling Stripe: reservation checkout attempt ID, pickup confirmation ID, refund decision ID, transfer decision ID. Use those IDs as Stripe idempotency keys and as unique database keys. Put multi-table writes in Postgres RPCs or explicit transactions. Add unique constraints on `orders.stripe_payment_intent_id`, payment ledger PaymentIntent IDs, transfer IDs, refund IDs, QR token hashes, and policy decision IDs.

**Warning signs:**
- The code generates `crypto.randomUUID()` immediately before each Stripe call instead of deriving a stable operation key.
- There is no unique index on `stripe_payment_intent_id`.
- Background job retries are implemented with plain loops and no durable job table.
- A webhook handler can update order status and a server action can update the same status independently.
- Duplicate detection happens in application code after insert instead of with constraints.

**Phase to address:**
Phase 1 for database constraints and RPCs. Phase 2 for webhook idempotency. Phase 4 for transfer/refund idempotency.

**Tests or verification needed:**
- Concurrency test: two simultaneous checkout submissions resolve to one payment attempt or one active reservation.
- Webhook replay test: duplicate event IDs are logged and skipped.
- Transfer retry test: repeated pickup confirmation and repeated job execution create one transfer.
- Refund retry test: repeated refund policy execution creates one refund/reversal pair.
- Database test: unique constraints fail closed on duplicate Stripe IDs.

---

### Pitfall 6: QR Pickup Tokens That Are Reusable, Guessable, or Authorization-Light

**What goes wrong:**
A producer or attacker can replay a QR code, scan an old QR code, guess a URL, or confirm pickup for a reservation they do not own. That can trigger a producer transfer without an actual handoff.

**Why it happens:**
QR codes are often treated as display artifacts instead of credentials. If the QR encodes a raw reservation ID or permanent URL, it becomes a bearer token with no expiry, no single-use guard, and no audit trail.

**How to avoid:**
Create a pickup token table that stores only a hash of a high-entropy token, reservation ID, allowed vendor profile ID, expiry time, consumed time, consumed-by user ID, scan IP/user agent if appropriate, and status. The QR should encode only the opaque token URL. The scan endpoint must require an authenticated producer session, verify producer ownership of the reservation/vendor, require a pickup-eligible status, atomically consume the token once, and then transition the reservation/order to pickup-confirmed. Regenerate tokens only through explicit server action with audit logging.

**Warning signs:**
- QR URLs contain `reservationId=` or `orderId=` without a separate secret.
- Token validation is implemented in the client or scanner page.
- The same QR code works after pickup has already been confirmed.
- A producer account can scan another producer's QR code and see reservation details.
- QR tokens do not expire or cannot be revoked after cancellation.

**Phase to address:**
Phase 3: QR Pickup Confirmation. It must run before delayed transfer creation in Phase 4.

**Tests or verification needed:**
- Unit test: token generator produces high-entropy values and stores only hashes.
- Integration test: unauthenticated scan is rejected.
- Authorization test: producer B cannot confirm producer A's reservation.
- Replay test: second scan of the same token fails and does not create a second transfer.
- Expiry/cancellation test: expired or cancelled reservation token cannot be consumed.
- E2E test: producer scan confirms pickup once and client dashboard updates.

---

### Pitfall 7: Status Model Drift Across Reservations, Orders, Payments, Transfers, and Pickup

**What goes wrong:**
One table says a reservation is accepted, another says the order is pending, Stripe says payment succeeded, transfer status is missing, and the dashboard guesses what happened. Operations cannot tell whether to refund, transfer, mark no-show, or ask admin to review.

**Why it happens:**
The existing migrations already encode several status vocabularies, and the milestone introduces more statuses: pending payment, paid/reserved, cancelled, pickup-ready, confirmed, producer-payable/transferred, no-show, disputed/admin-review. Without a single transition map, each feature will add its own statuses.

**How to avoid:**
Model the lifecycle explicitly. Keep Stripe payment status, reservation status, order fulfillment status, pickup token status, payout/transfer status, refund status, and dispute/admin-review status as related but distinct concepts. Define allowed transitions in one migration-backed RPC layer. Do not let UI code set terminal statuses directly. Store `status_reason`, `status_changed_at`, and `status_changed_by` for auditability.

**Warning signs:**
- A migration adds a status string without updating a state diagram.
- UI components infer payment status from reservation status alone.
- `orders.status = "confirmed"` appears but the database constraint does not allow it.
- Terminal states can be edited by broad RLS update policies.
- Producer dashboards filter by one status field and miss refunds or transfers.

**Phase to address:**
Phase 1: Money Ledger and State Model.

**Tests or verification needed:**
- State transition matrix tests in database/RPC integration tests.
- Compile-time mapping test for all UI labels across locales.
- Regression test: terminal states cannot transition except through admin-approved recovery paths.
- Dashboard fixture test for every status combination the UI displays.
- Migration verification: old statuses map to new statuses with no orphan rows.

---

### Pitfall 8: Cancellation and No-Show Policy Implemented as UI Logic

**What goes wrong:**
Customers are charged or refunded incorrectly because the 24-hour cutoff and 20% penalty are calculated in the browser, calculated in local time inconsistently, or calculated from the wrong reservation timestamp. Producers may receive wrong compensation or see policy decisions that cannot be audited.

**Why it happens:**
Policy looks simple: "cancel until 24 hours before reservation date; late cancel/no-show owes 20%." In practice it depends on reservation start time, kiosk timezone, cutoff timestamp, payment status, pickup window, producer compensation policy, refund status, and whether pickup/no-show has already been recorded.

**How to avoid:**
Store canonical reservation start/pickup-window timestamps in UTC plus the kiosk/vendor timezone used for display. Calculate cutoff and policy amounts on the server from immutable order price snapshots. Persist a policy decision row with decision type, cutoff, observed action time, customer refund amount, retained penalty amount, producer compensation amount, platform amount, and actor. UI should request a quote from the server before confirmation and submit the policy action to a server RPC.

**Warning signs:**
- Cancellation buttons compare `new Date()` in the browser.
- No table records how the 20% amount was calculated.
- No-show can be marked before the pickup window ends.
- The client and producer dashboards disagree about whether cancellation is free.
- Manual support cannot reconstruct why a customer was charged 20%.

**Phase to address:**
Phase 4: Delayed Transfers, Refunds, and No-Show Policy.

**Tests or verification needed:**
- Unit tests for cutoff calculation across timezone boundaries and daylight saving transitions.
- Policy quote tests: before cutoff, exactly at cutoff, after cutoff, after pickup window.
- Ledger tests for customer refund, retained penalty, producer compensation, and platform fee.
- Authorization test: only eligible actors can cancel or mark no-show.
- E2E test: dashboard displays policy quote before final cancellation action.

---

### Pitfall 9: Ignoring Connect Liability, Balance Availability, and Transfer Failures

**What goes wrong:**
Transfers fail because platform funds are not available. Refunds and chargebacks debit the platform. Reversals fail because the connected account lacks available balance. Automatic payouts drain the platform balance before delayed transfers execute. Kiosq's ledger says the producer was paid when Stripe rejected or delayed the transfer.

**Why it happens:**
Stripe Connect abstracts money movement, but separate charges and transfers leave important operational responsibility on the platform. Stripe docs explicitly note that separate charge/transfer refunds and chargebacks affect the platform balance, and transfer failures are not automatically retried.

**How to avoid:**
Represent Stripe money movement as asynchronous jobs with durable statuses: `pending`, `in_progress`, `succeeded`, `failed_retryable`, `failed_admin_review`. Use `source_transaction` when creating transfers tied to a charge after pickup if it matches the payment method constraints and timing; otherwise gate transfer execution on platform available balance and implement explicit retry. Configure payout schedule with delayed transfers in mind. Store failure codes and expose them to admin operations, not to clients as generic failures.

**Warning signs:**
- Code assumes `stripe.transfers.create` always succeeds synchronously.
- There is no retry state for transfer creation.
- Automatic payout settings are not considered in release checklist.
- Transfer reversal failure has no admin-review path.
- `producer_paid` is boolean instead of a transfer lifecycle.

**Phase to address:**
Phase 4 for transfers/reversals; Phase 5 for admin operations visibility; Phase 6 for payout/release runbook.

**Tests or verification needed:**
- Stripe mock/integration test: insufficient platform balance marks transfer job retryable.
- Test: async payment method flow waits for succeeded charge before transfer eligibility.
- Test: transfer failure does not mark reservation as transferred.
- Test: admin dashboard lists failed transfer/reversal jobs with identifiers and retry controls.
- Release checklist: verify Stripe payout schedule and Connect negative-balance responsibility settings.

---

### Pitfall 10: Using Stripe Metadata as the Source of Truth

**What goes wrong:**
Reservation, item, producer, cancellation, and payout decisions are reconstructed from PaymentIntent metadata. Metadata may be incomplete, stale, string-only, or inconsistent with current product prices and kiosk schedules. A product or profile update after checkout can change how the app interprets the original payment.

**Why it happens:**
Metadata is convenient for linking Stripe objects to app rows, and current code already puts `variantId`, `quantity`, `kiosqId`, and `profileId` in PaymentIntent metadata. It is useful for reconciliation, but not sufficient for the authoritative order snapshot.

**How to avoid:**
Create a local checkout/reservation attempt before PaymentIntent creation. Persist immutable snapshots: product variant ID, product/vendor/kiosq IDs, display names, quantity, unit, unit price minor, currency, order total minor, fee/policy inputs, pickup window, customer ID, and vendor Stripe account ID. Stripe metadata should contain only stable lookup IDs and reconciliation hints.

**Warning signs:**
- Webhook finalization creates order items from `paymentIntent.metadata.quantity`.
- Unit price is calculated as `paymentIntent.amount / quantity`.
- Metadata contains only product IDs and no internal checkout attempt ID.
- Product price updates can affect already-paid reservations.
- PaymentIntent metadata is treated as trusted input without cross-checking stored checkout attempt rows.

**Phase to address:**
Phase 1 for checkout attempt and snapshot tables; Phase 2 for webhook lookup by attempt ID.

**Tests or verification needed:**
- Test: product price changes after PaymentIntent creation do not change order item snapshots.
- Test: missing or malformed metadata does not create orders; it moves event to admin review.
- Test: webhook uses internal checkout attempt ID, not raw metadata fields, to create order.
- Reconciliation test: Stripe PaymentIntent, charge, and local ledger can be joined by stable IDs.

---

### Pitfall 11: Private Dashboard Data Is Cached or Queried Too Broadly

**What goes wrong:**
Clients or producers see stale reservation/payment/QR/transfer states, or a user sees another user's reservation data because an authenticated route relies on broad RLS instead of explicit owner filtering. Payment/support decisions are made from stale dashboard data.

**Why it happens:**
The codebase concerns already flag authenticated dashboard data fetched through internal APIs with cache tags and 24-hour revalidation, and route authorization split between application code and RLS. The existing reservations endpoint returns nested graphs without pagination.

**How to avoid:**
Use direct server-side Supabase queries or `cache: "no-store"` for private reservation dashboards. Add explicit owner/vendor joins in every current-user route. Build separate dashboard queries/views for client history, producer pickup queue, producer transaction history, and admin review. Add pagination, date/status filters, and minimal selects. Invalidate React Query state after pickup/cancel/refund actions.

**Warning signs:**
- Private reservation pages use `next.revalidate`.
- Current-user API routes accept `profileId` or `kiosqId` without joining to the authenticated user.
- Reservation history fetches all rows with nested order items and no `limit`.
- Dashboard status differs after refresh vs client navigation.
- Producer pickup screen requires manual refresh after QR scan.

**Phase to address:**
Phase 5: Dashboard History and Operations. Ownership filters should be introduced earlier for any route touched in Phases 2-4.

**Tests or verification needed:**
- Authorization tests for client, producer, unrelated producer, and unauthenticated user.
- Cache test/manual verification: payment/pickup/refund state updates immediately after mutation.
- Pagination test: reservation history accepts cursor/status/date filters.
- RLS/integration test: producer cannot query another producer's orders through current-user endpoints.
- E2E test: client and producer dashboards converge on the same reservation status after webhook and QR scan.

---

### Pitfall 12: Sensitive Payment Data in Logs and Support Views

**What goes wrong:**
Stripe client secrets, PaymentIntent metadata, customer details, QR tokens, or reservation details appear in browser/server logs, shared support screenshots, or dashboard raw JSON. This increases breach impact and makes incident response harder.

**Why it happens:**
The current code logs PaymentIntent creation details, client secrets, retrieved PaymentIntent metadata, and raw reservation dashboard data. During payment debugging, teams often add logs before structured redaction exists.

**How to avoid:**
Remove sensitive logs before building new payment work. Add a small redacted logger that allows operation IDs, reservation IDs, Stripe object IDs, event IDs, and failure codes, but blocks client secrets, raw tokens, full metadata, personal contact data, and full reservation payloads. Store pickup token hashes only. Dashboard history should be purpose-built UI, not `<pre>` dumps.

**Warning signs:**
- `console.log(paymentIntent.client_secret)` or logs containing `client_secret`.
- Raw reservation/order JSON rendered in the dashboard.
- QR token values are stored or logged in plaintext.
- Support instructions ask users to send screenshots of raw payment/reservation details.
- No review checklist item for sensitive logging.

**Phase to address:**
Phase 1 cleanup for existing logs; Phase 3 for QR token handling; Phase 5 for safe dashboard/support views.

**Tests or verification needed:**
- Static check: fail if `client_secret`, raw pickup token, or PaymentIntent metadata is logged.
- Unit test for logger redaction.
- Manual review: dashboard pages contain no raw JSON dumps.
- Security test: database stores pickup token hash, not token plaintext.

---

### Pitfall 13: Shipping Without Payment/QR/Policy Test Coverage

**What goes wrong:**
The core flow appears to work once manually but breaks under duplicate webhooks, async payments, cancellation edge cases, QR replay, failed transfers, timezone cutoffs, or dashboard authorization boundaries.

**Why it happens:**
The codebase has no configured test runner, no test files, and no CI workflow. Payment code is currently verified by lint/build and manual inspection.

**How to avoid:**
Add focused test infrastructure as part of the milestone, not after launch. Start with Vitest or equivalent for pure money/policy/state functions, route/action tests for webhook and QR handlers, Supabase integration tests for RPC/constraints/RLS, and Playwright or manual scripted E2E for the reserve-pay-pickup flow. Keep Stripe external calls behind thin adapters so tests can mock responses deterministically while Stripe CLI validates webhook wiring.

**Warning signs:**
- Roadmap phases say "manual QA" for payment finalization.
- There are no fixtures for succeeded, failed, duplicated, disputed, refunded, and transferred reservations.
- Money policy code is implemented directly in route handlers.
- QR scan flow has no replay test.
- Production release checklist does not include Stripe test cards/CLI scenarios.

**Phase to address:**
Phase 6: Test and Release Hardening, with unit tests introduced in Phase 1 and route tests introduced in Phase 2.

**Tests or verification needed:**
- Minimum unit coverage: money helper, status transition helper, cancellation/no-show policy helper, QR token helper.
- Minimum integration coverage: webhook finalization, idempotent DB RPC, QR consume endpoint, refund/transfer job state.
- Minimum E2E/manual scripted coverage: successful pickup, early cancellation, late cancellation, no-show, duplicate webhook, duplicate QR scan, failed transfer.
- CI gate: `npm run lint`, `npm run build`, and test command once added.

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `/api/payment-success` as a finalization route | Fast demo success page | Duplicate orders, forged/refresh-triggered writes, async payment gaps | Never for finalization; acceptable only as display-only status page |
| Use `transfer_data.destination` on the PaymentIntent | Producer payout appears easy | Funds move before pickup; refunds/reversals become hard; violates delayed transfer requirement | Never for v1 delayed pickup payout |
| Store money as `NUMERIC(10,2)` while Stripe uses cents | Human-readable database rows | Unit drift, rounding bugs, wrong transfers/refunds | Only for derived display views, not authoritative ledger |
| Implement policy in React components | Quick UI behavior | Timezone drift and unauditable customer charges | Never for money decisions |
| Use reservation IDs as QR payloads | Simple QR generation | Guessable/replayable pickup confirmation | Never |
| Rely on RLS only for current-user routes | Less route code | Broad public policies can leak data through authenticated endpoints | Never for payment/reservation dashboards |
| Skip transfer/refund job tables | Less schema | Failed Stripe calls cannot be retried or reconciled | Only for throwaway prototype, not this milestone |
| Render raw reservation JSON in dashboards | Quick debugging | Sensitive data exposure and unusable history | Never in user-facing dashboard |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe webhooks | Parsing JSON before signature verification | Verify using the raw request body, `Stripe-Signature`, and endpoint secret. |
| Stripe webhooks | Assuming one event arrives once and in the desired timing | Store processed event IDs and object/type idempotency keys; process events asynchronously. |
| Stripe PaymentIntents | Treating browser redirect success as payment finalization | Use redirect only for UX; finalization must come from signed webhook state. |
| Stripe idempotency | Generating a new idempotency key for each retry | Derive a stable operation key from the reservation/payment/transfer/refund decision. |
| Stripe separate charges and transfers | Assuming refunds automatically reverse transfers | Refunds debit the platform; explicitly reconcile or reverse transfers when needed. |
| Stripe transfers | Creating transfer without available-balance or retry handling | Use durable transfer jobs, `source_transaction` where appropriate, and admin-review failure states. |
| Stripe transfer reversals | Assuming every reversal can succeed | Reversal requires sufficient connected-account available balance or reserves; handle failure. |
| Supabase RLS/API | Letting current-user endpoints rely on broad table policies | Add explicit owner/vendor joins in route queries and cover with authorization tests. |
| QR pickup | Encoding raw order/reservation IDs | Encode opaque high-entropy token only; hash at rest; require authenticated producer scan. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Synchronous webhook processing | Stripe retries, duplicated work, timeout errors | Acknowledge quickly after durable event insert; process in job/RPC path | During payment spikes or transient DB slowness |
| Unpaginated reservation history | Slow dashboard SSR, large JSON payloads, hydration lag | Cursor pagination, status/date filters, minimal select fields | Vendors with hundreds to thousands of reservations |
| Dashboard polling without cache discipline | Stale or inconsistent reservation state | `no-store` server fetches for private data and targeted React Query invalidation | Immediately after payment, pickup, cancel, or refund actions |
| Full nested reservation graph for every list view | Excess database and network load | Dedicated list views/RPCs for queue/history/admin review | When order item count grows |
| Transfer/refund retries in request-response cycle | User waits on Stripe/network, failed retries lost | Durable job table with retry count and failure reason | Any Stripe timeout or insufficient balance event |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Logging Stripe client secrets | Payment secrets leak through browser/server logs | Remove logs; block `client_secret` in redacted logger/static check. |
| Trusting unsigned payment callbacks | Attacker or stale URL can trigger fulfillment logic | Signed Stripe webhook verification only. |
| Storing QR tokens in plaintext | Database read can confirm pickups | Store token hashes and compare with constant-time hash checks where practical. |
| Reusable QR tokens | Duplicate pickup confirmation and duplicate transfer | Atomic single-use consume operation. |
| Missing producer ownership check on QR scan | Producer can confirm another producer's order | Join reservation to vendor profile/user in scan endpoint. |
| Broad private dashboard queries | Cross-user reservation/payment exposure | Explicit route-level ownership filters plus RLS. |
| Raw JSON dashboard output | Sensitive reservation/payment metadata exposure | Purpose-built history UI with redacted fields. |
| Public no-show/cancel endpoints without actor rules | Unauthorized policy decisions | Server RPC checks actor, status, cutoff, and ownership. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing success immediately after redirect | Customer thinks order is reserved before webhook confirms payment | Show processing state until server ledger is paid/reserved. |
| Hiding transfer status from producers | Producer does not know whether payout is pending, scheduled, failed, or paid | Producer dashboard should show pickup confirmed, payout pending, transferred, or admin review. |
| Making QR scan the only way to resolve pickup issues | Producer is blocked if camera/browser fails | Provide authenticated manual token entry/admin fallback with audit log. |
| Surprise 20% penalty at cancellation time | Customer distrust and support disputes | Show server-calculated cancellation quote before final action. |
| One generic "cancelled" status | Client, producer, and support cannot distinguish early cancel, late cancel, no-show, or admin reversal | Use explicit policy reason and financial outcome labels. |
| Raw transaction IDs without context | Support and users cannot interpret dashboard history | Show concise status, amount, policy reason, and timestamp with IDs available in details. |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Payment success page:** Does not create or mutate orders; it only reads server-owned payment state.
- [ ] **Stripe webhook route:** Verifies raw body signature, stores processed event IDs, and handles duplicate object/type events.
- [ ] **Order creation:** Happens in one transaction-backed path with unique `stripe_payment_intent_id`.
- [ ] **PaymentIntent creation:** Charges platform without immediate producer `transfer_data.destination` for delayed pickup payout.
- [ ] **Money model:** Stores Stripe-facing amounts in integer minor units with currency and tests every conversion.
- [ ] **Ledger:** Can answer charge, refund, penalty, producer payable, transfer, reversal, dispute, and admin-review questions.
- [ ] **QR code:** Encodes opaque, expiring, single-use token; token is hashed at rest and tied to producer ownership.
- [ ] **Pickup confirmation:** Atomic token consume plus status transition; repeated scans cannot create duplicate transfers.
- [ ] **Cancellation policy:** Server-calculated quote and persisted policy decision, not client-side date math.
- [ ] **No-show policy:** Can only be applied after pickup window rules; creates explicit customer/producers financial entries.
- [ ] **Transfers:** Created by durable idempotent job after pickup/policy decision, with retry and failure visibility.
- [ ] **Refunds:** Account for platform debit and possible transfer reversal or unrecovered producer balance.
- [ ] **Dashboard history:** Private, paginated, no raw JSON, no long-lived cache, owner/vendor filtered.
- [ ] **Logs:** No client secrets, raw QR tokens, full metadata, or full reservation payloads.
- [ ] **Tests:** Duplicate webhook, duplicate QR scan, early cancel, late cancel, no-show, failed transfer, and failed reversal are covered.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Duplicate orders from one PaymentIntent | HIGH | Stop writes from return route, add unique constraint, identify duplicates by `stripe_payment_intent_id`, preserve one canonical order, cancel/void duplicates, notify affected users if visible. |
| Immediate transfer before pickup | HIGH | Disable destination-charge path, list affected transfers, reconcile pickup/cancel state, reverse transfers where possible, move unresolved rows to admin review. |
| Wrong amount units | HIGH | Freeze new payment writes, audit all orders against Stripe PaymentIntent amounts, migrate to minor-unit columns, backfill with verified conversion rules, add constraints/tests. |
| Refund without transfer reversal | MEDIUM/HIGH | Identify refunded charges with completed transfers, attempt reversal or future payout offset, record unrecovered balances, update producer/admin dashboards. |
| QR replay caused duplicate pickup | MEDIUM/HIGH | Freeze transfer creation for affected reservation, inspect scan logs, keep first valid consume, reverse duplicate transfer if created, rotate/revoke tokens. |
| Transfer job failed silently | MEDIUM | Backfill transfer jobs from ledger, retry eligible failures with stable idempotency keys, expose unresolved failures to admin review. |
| Stale dashboard state | MEDIUM | Disable long-lived cache for affected routes, invalidate React Query keys, add status reconciliation endpoint, notify users if stale state caused actions. |
| Sensitive payment logs | MEDIUM | Rotate exposed secrets if needed, purge logs where provider supports it, remove logging, add redaction/static checks, document incident. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Browser redirect finalization | Phase 2 | Signed webhook finalizes payment; return route is display-only; duplicate event test passes. |
| Transfer at payment time | Phase 1 and Phase 4 | PaymentIntent request excludes `transfer_data.destination`; transfer created only after pickup/policy state. |
| Refund without reversal/ledger | Phase 4 | Refund tests cover before-transfer, after-transfer, failed-reversal, and admin-review paths. |
| Money unit drift | Phase 1 | All authoritative amounts are integer minor units with currency; old cents/dollars paths removed. |
| Non-idempotent mutations | Phase 1, Phase 2, Phase 4 | Unique constraints and idempotency-key tests cover PaymentIntent, webhook, transfer, refund, QR. |
| QR token replay/forgery | Phase 3 | Token hash, expiry, ownership, and replay tests pass. |
| Status model drift | Phase 1 | State transition matrix is implemented in RPC/migration and covered by tests. |
| UI-only cancellation/no-show policy | Phase 4 | Server quote/action RPC persists policy decision and passes timezone/cutoff tests. |
| Connect liability/balance failures | Phase 4 and Phase 5 | Transfer/reversal job states, retry logic, and admin failure dashboard exist. |
| Stripe metadata as source of truth | Phase 1 and Phase 2 | Checkout attempt snapshot is authoritative; malformed metadata is admin review, not order creation. |
| Private dashboard cache/authorization gaps | Phase 5 | `no-store`/direct private queries, explicit ownership filters, pagination, and auth tests. |
| Sensitive logs/raw dashboards | Phase 1 and Phase 5 | Payment logs removed; redacted logger/static check; no raw JSON dashboard output. |
| Missing tests | Phase 6, with earlier slices | Test runner/CI exists and covers money, webhooks, QR, policy, transfers, refunds, dashboards. |

## Minimum Verification Matrix

Use this as acceptance criteria for roadmap phases.

| Scenario | Expected Result | Must Verify In |
|----------|-----------------|----------------|
| Customer pays with card and webhook delivered once | One paid reservation, one order, no transfer yet | Phase 2 integration/E2E |
| Same webhook delivered twice | No duplicate reservation/order/item rows | Phase 2 integration |
| Customer refreshes success URL repeatedly | No new writes; status page reads existing state | Phase 2 route/E2E |
| PaymentIntent metadata missing reservation attempt ID | Event goes to admin review; no order created | Phase 2 integration |
| Producer scans valid QR | Token consumed once, pickup confirmed, transfer job created | Phase 3/4 E2E |
| Producer scans QR twice | Second scan rejected; no duplicate transfer | Phase 3 integration |
| Wrong producer scans QR | 403/404 with no details leaked; no state change | Phase 3 authorization |
| Client cancels more than 24 hours before reservation | Full eligible refund policy; no producer transfer | Phase 4 policy |
| Client cancels within 24 hours | 20% retained policy; explicit producer/platform ledger entries | Phase 4 policy |
| Client no-shows | No-show state and compensation policy applied after pickup window | Phase 4 policy |
| Refund after transfer | Transfer reversal attempted or unresolved balance recorded | Phase 4 integration |
| Transfer fails due insufficient available balance | Reservation not marked transferred; retry/admin-review state visible | Phase 4/5 integration |
| Client dashboard after payment/pickup/refund | Fresh, owner-filtered state with no raw JSON | Phase 5 E2E |
| Producer dashboard history | Paginated pickup/payment/transfer history for own profile only | Phase 5 authorization/performance |

## Sources

- HIGH: `.planning/PROJECT.md` - Project requirements and decisions for separate charges/transfers, delayed producer payout, QR pickup, cancellation/no-show policy, and money safety.
- HIGH: `.planning/codebase/CONCERNS.md` - Existing duplicate order creation, inconsistent amount units, weak payment finalization, sensitive logs, dashboard raw JSON, authorization/cache concerns, and missing tests.
- HIGH: `.planning/codebase/TESTING.md` - No test runner, no test files, and current verification limited to lint/build/manual checks.
- HIGH: `.planning/codebase/INTEGRATIONS.md` - Current Stripe/Supabase integration surfaces and missing Stripe webhook endpoint.
- HIGH: Stripe docs, [Create separate charges and transfers](https://docs.stripe.com/connect/separate-charges-and-transfers) - separate charge/transfer behavior, transfer groups, webhook-based post-payment events, delayed transfer availability, async payment cautions, refunds not affecting associated transfers, and transfer reversal constraints.
- HIGH: Stripe docs, [Refund and cancel payments](https://docs.stripe.com/refunds) - refund balance behavior, partial refunds, Connect refund debit behavior, and original-payment-method refund destination.
- HIGH: Stripe API docs, [Transfer Reversals](https://docs.stripe.com/api/transfer_reversals) - partial/full transfer reversals, platform/destination balance effects, and sufficient balance requirement for `transfer_group` reversals.
- HIGH: Stripe docs, [Receive Stripe events in your webhook endpoint](https://docs.stripe.com/webhooks) - signature verification, duplicate event handling, asynchronous processing, event-type scoping, replay protection, and fast 2xx responses.
- HIGH: Stripe docs, [Resolve webhook signature verification errors](https://docs.stripe.com/webhooks/signature) - raw request body requirement and Next.js App Router webhook signing considerations.
- HIGH: Stripe API docs, [Idempotent requests](https://docs.stripe.com/api/idempotent_requests) - safe retries, key generation, 24-hour pruning, parameter comparison, and POST-only idempotency behavior.
- HIGH: Stripe docs, [Risk and liability management with Connect](https://docs.stripe.com/connect/risk-management) - platform responsibility for indirect-charge refunds/chargebacks, negative balances, reserves, and Connect liability configuration.
- HIGH: Stripe docs, [Understanding Connect account balances](https://docs.stripe.com/connect/account-balances) - pending/available balances, platform and connected account balances, no automatic transfer retry, and negative balance handling.

---
*Pitfalls research for: Kiosq reservation pickup payments*
*Researched: 2026-04-29*
