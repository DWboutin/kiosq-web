# Roadmap: Kiosq Reservation Pickup Payments

## Overview

This milestone turns the existing reservation and payment fragments into one reliable reserve -> pay -> pickup -> confirm flow. The work starts with an authoritative reservation ledger and guarded lifecycle, moves payment finalization to Stripe webhooks, adds single-use QR pickup confirmation, releases producer funds only through delayed Connect transfers or policy settlement, then finishes the private dashboard surfaces and verification needed to launch safely.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Reservation Ledger and Status Model** - Establish authoritative money, snapshot, lifecycle, activity, and idempotency foundations.
- [ ] **Phase 2: Checkout and Webhook-Owned Payment Finalization** - Let clients reserve and pay while Stripe webhooks become the only payment finalizer.
- [ ] **Phase 3: QR Pickup Confirmation** - Give clients pickup QR receipts and producers safe scan/manual confirmation.
- [ ] **Phase 4: Delayed Transfers, Refunds, Cancellation, and No-Show Settlement** - Move money only after pickup or policy settlement with retryable transfer/refund records.
- [ ] **Phase 5: Dashboards, History, and Operations** - Replace raw reservation surfaces with owner-filtered client, producer, and exception views.
- [ ] **Phase 6: Test and Release Hardening** - Prove the full payment, pickup, cancellation, no-show, and settlement paths before launch.

## Phase Details

### Phase 1: Reservation Ledger and Status Model
**Goal**: Reservations, orders, payments, pickup, refunds, transfers, penalties, and admin-review states share one authoritative ledger and guarded lifecycle.
**Depends on**: Nothing (first phase)
**Requirements**: LEDG-01, LEDG-02, LEDG-03, LEDG-04, LEDG-05
**Success Criteria** (what must be TRUE):
  1. Client and producer reservation records preserve exact minor-unit totals, currency, fees, penalties, refunds, and transfer amounts without cent/dollar drift.
  2. A reservation keeps its product, quantity, producer, kiosq, pickup window, cancellation cutoff, and accepted policy snapshot even if catalog data changes later.
  3. Client, producer, and internal history can show lifecycle and financial events in order with explicit current statuses.
  4. Retried or duplicate financial operations do not create duplicate orders, ledger entries, transfers, refunds, or state transitions.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Define money, currency, snapshot, ledger, and reservation lifecycle schema/RPC foundations.
- [ ] 01-02: Add guarded status transitions, activity history writes, and generated type updates.
- [ ] 01-03: Add database uniqueness, idempotency keys, indexes, and migration verification for financial transitions.

### Phase 2: Checkout and Webhook-Owned Payment Finalization
**Goal**: Clients can create a one-producer reservation checkout, pay through Stripe, and rely on signed webhooks to mark paid reservations as reserved.
**Depends on**: Phase 1
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06
**Success Criteria** (what must be TRUE):
  1. Client can choose quantity, kiosq, pickup date/window, and accept the cancellation/no-show policy before starting checkout for one producer.
  2. Client can complete payment through Stripe Payment Element using a platform PaymentIntent that does not transfer funds immediately.
  3. A succeeded payment becomes a paid/reserved reservation only through a signed, deduplicated Stripe webhook.
  4. Payment return and success pages display current reservation status and refresh safely without creating orders or changing financial state.
  5. Payment screens and logs expose only safe identifiers, with no leaked client secrets, full metadata payloads, or QR tokens.
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 02-01: Build reservation checkout creation with one-producer validation, pickup selection, and policy acceptance.
- [ ] 02-02: Create platform PaymentIntents with reconciliation metadata, transfer group, and no immediate producer transfer.
- [ ] 02-03: Add Stripe webhook finalization with raw-body signature verification, event dedupe, and paid/reserved RPC transition.
- [ ] 02-04: Convert payment return/success surfaces to display-only status and remove sensitive payment/reservation logs.

### Phase 3: QR Pickup Confirmation
**Goal**: Clients receive a secure pickup credential, and producers can confirm the in-person handoff exactly once from the web app.
**Depends on**: Phase 2
**Requirements**: QR-01, QR-02, QR-03, QR-04, QR-05
**Success Criteria** (what must be TRUE):
  1. Client can open a bilingual reservation receipt with QR code, pickup details, current status, and cancellation/no-show policy summary.
  2. Producer can scan a client's QR code from the web app to confirm pickup for a reservation they own.
  3. Producer can use a safe manual lookup fallback when camera scanning fails.
  4. Expired, revoked, reused, wrong-producer, or wrong-status QR credentials are rejected without confirming pickup.
  5. A valid pickup confirmation consumes the QR credential once and marks pickup complete exactly once.
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 03-01: Generate high-entropy QR pickup credentials after payment finalization and store token hashes only.
- [ ] 03-02: Build bilingual client receipt and pickup QR display tied to current reservation status.
- [ ] 03-03: Build producer web scanner and manual lookup fallback using owned reservation data.
- [ ] 03-04: Add atomic pickup confirmation RPC with ownership, expiry, revocation, status, and one-time consumption checks.

### Phase 4: Delayed Transfers, Refunds, Cancellation, and No-Show Settlement
**Goal**: Pickup, early cancellation, late cancellation, no-show, refund, reversal, and admin-review outcomes settle money through explicit, idempotent records.
**Depends on**: Phase 3
**Requirements**: SETT-01, SETT-02, SETT-03, SETT-04, SETT-05, SETT-06
**Success Criteria** (what must be TRUE):
  1. Producer transfer is created only after QR pickup confirmation or an eligible policy settlement event.
  2. Client can cancel more than 24 hours before the reservation date without the 20% late-cancel/no-show penalty.
  3. Late cancellation and producer-marked no-show apply a server-calculated 20% order-total charge and record producer compensation before refund or transfer action.
  4. Transfer, refund, and reversal attempts record Stripe IDs, failures, retry state, and admin-review state without duplicating money movement.
  5. Client and producer transaction status remains reconcileable after cancellation, no-show, dispute, failed transfer, or failed reversal outcomes.
**Plans**: 4 plans

Plans:
- [ ] 04-01: Add settlement, transfer, refund, reversal, retry, and admin-review records backed by idempotency keys.
- [ ] 04-02: Create producer Stripe Transfers after pickup using the recorded charge/source transaction and transfer group.
- [ ] 04-03: Implement server-side early-cancel and late-cancel policy quotes/actions with refund and compensation records.
- [ ] 04-04: Implement no-show, dispute/admin-review, transfer failure retry, and reversal handling paths.

### Phase 5: Dashboards, History, and Operations
**Goal**: Clients and producers can manage reservation status, QR pickup, cancellation/no-show actions, and transaction history through safe bilingual dashboards.
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. Client dashboard shows active reservations, pickup QR, cancellation availability, payment/refund state, and history without raw JSON payloads.
  2. Producer dashboard shows pickup queue, reservation details, QR scan/manual confirm actions, cancellation/no-show status, transfer state, and history.
  3. Dashboard APIs return owner-filtered private data, paginate reservation lists where needed, and avoid long-lived caching.
  4. Admin-review flags are visible enough to triage transfer, refund, QR, and payment exceptions without a full dispute center.
  5. Reservation statuses, policy copy, pickup confirmation, refund state, and transfer state are bilingual across client and producer views.
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 05-01: Build client active reservation, receipt/QR, cancellation availability, transaction state, and history views.
- [ ] 05-02: Build producer pickup queue, reservation detail, scan/manual confirm, no-show, transfer state, and history views.
- [ ] 05-03: Replace private reservation reads with owner-filtered, paginated, no-store APIs/DTOs and safe cache invalidation.
- [ ] 05-04: Add admin-review indicators and bilingual reservation/payment/policy/status copy.

### Phase 6: Test and Release Hardening
**Goal**: The milestone has automated and manual verification for money, policy, webhook, QR, authorization, and end-to-end launch paths.
**Depends on**: Phase 5
**Requirements**: VER-01, VER-02
**Success Criteria** (what must be TRUE):
  1. Automated tests fail on money-unit drift, 24h cutoff errors, 20% penalty errors, invalid status transitions, and duplicate webhook handling.
  2. Automated tests prove QR token consumption, token expiry/revocation, and producer ownership checks.
  3. Manual verification completes the reserve -> pay -> QR pickup -> producer transfer path using Stripe test-mode tooling.
  4. Manual verification covers early cancel, late cancel, no-show, failed transfer/refund, and admin-review branches.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Add Vitest/domain tests for money, policy, status guards, idempotency, and QR token helpers.
- [ ] 06-02: Add route/RPC integration coverage for Stripe webhooks, QR confirmation, ownership, cancellation, no-show, and settlement.
- [ ] 06-03: Add Stripe CLI/manual UAT, Playwright smoke coverage where useful, and release monitoring/reconciliation checklist.

## Coverage

- v1 requirements mapped: 29/29
- Traceability source: existing `.planning/REQUIREMENTS.md`
- Orphaned requirements: 0
- Duplicate phase assignments: 0

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Reservation Ledger and Status Model | 0/3 | Not started | - |
| 2. Checkout and Webhook-Owned Payment Finalization | 0/4 | Not started | - |
| 3. QR Pickup Confirmation | 0/4 | Not started | - |
| 4. Delayed Transfers, Refunds, Cancellation, and No-Show Settlement | 0/4 | Not started | - |
| 5. Dashboards, History, and Operations | 0/4 | Not started | - |
| 6. Test and Release Hardening | 0/3 | Not started | - |
