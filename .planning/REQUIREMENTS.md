# Requirements: Kiosq Reservation Pickup Payments

**Defined:** 2026-04-29
**Core Value:** Clients can reserve and pay for products online, and producers only receive the order funds after a verified in-person QR pickup confirmation.

## v1 Requirements

Requirements for the first reservation pickup payment milestone. Each maps to roadmap phases.

### Ledger and Status

- [ ] **LEDG-01**: System stores all authoritative money amounts in integer minor units with currency for reservations, orders, refunds, penalties, fees, and transfers.
- [ ] **LEDG-02**: System records immutable checkout snapshots for product, quantity, price, producer, kiosq, pickup date/window, cancellation cutoff, and accepted policy terms.
- [ ] **LEDG-03**: System represents reservation, payment, pickup, cancellation, refund, transfer, and admin-review state with explicit statuses and guarded transitions.
- [ ] **LEDG-04**: System records a reservation activity history for customer-visible, producer-visible, and internal financial events.
- [ ] **LEDG-05**: System prevents duplicate financial transitions with database uniqueness constraints, idempotency keys, and transaction-backed RPCs.

### Checkout and Payment

- [ ] **PAY-01**: Client can create a single-producer reservation checkout with product quantity, kiosq, pickup date/window, and explicit cancellation/no-show policy acceptance.
- [ ] **PAY-02**: Server creates a Stripe platform PaymentIntent for the reservation without immediate producer transfer and stores the PaymentIntent ID, charge ID, transfer group, and reconciliation metadata.
- [ ] **PAY-03**: Client can complete payment through Stripe Payment Element without the browser creating orders, reservations, transfers, or refunds directly.
- [ ] **PAY-04**: Stripe webhook finalization verifies signatures, deduplicates event IDs, and atomically marks paid reservations/orders/order items as reserved.
- [ ] **PAY-05**: Payment return/success pages display current reservation status only and cannot create duplicate orders or mutate financial state.
- [ ] **PAY-06**: Sensitive payment data such as client secrets, full metadata payloads, and QR tokens are not logged to browser or server output.

### QR Pickup

- [ ] **QR-01**: System generates a high-entropy, single-use QR pickup credential after successful payment finalization.
- [ ] **QR-02**: Client can view a bilingual reservation receipt with QR code, pickup details, status, and cancellation/no-show policy summary.
- [ ] **QR-03**: Producer can scan the client QR code from the web app to confirm in-person pickup for a reservation they own.
- [ ] **QR-04**: Producer can use a safe manual lookup fallback when camera scanning fails.
- [ ] **QR-05**: QR confirmation verifies producer ownership, token hash, token expiry/revocation, reservation status, and one-time consumption before confirming pickup.

### Settlement and Policy

- [ ] **SETT-01**: System creates the producer Stripe Transfer only after QR pickup confirmation or an eligible policy settlement event.
- [ ] **SETT-02**: System records producer transfer attempts, Stripe transfer IDs, failures, retries, and admin-review states idempotently.
- [ ] **SETT-03**: System supports client cancellation more than 24 hours before the reservation date without applying the 20% late-cancel/no-show penalty.
- [ ] **SETT-04**: System applies a server-calculated 20% order-total charge for late cancellation within 24 hours or producer-marked no-show.
- [ ] **SETT-05**: System records the producer compensation amount for late-cancel/no-show cases before any refund or transfer action.
- [ ] **SETT-06**: System records refund and transfer-reversal state when cancellation, no-show, dispute, or admin-review outcomes require money movement after payment.

### Dashboards and Operations

- [ ] **DASH-01**: Client dashboard shows active reservations, pickup QR, cancellation availability, payment/refund state, and reservation history without raw JSON payloads.
- [ ] **DASH-02**: Producer dashboard shows pickup queue, reservation details, QR scan/manual confirm actions, cancellation/no-show status, transfer state, and reservation history.
- [ ] **DASH-03**: Dashboard APIs are owner-filtered, paginated where needed, and avoid long-lived caching for private reservation data.
- [ ] **DASH-04**: Admin-review flags are available for transfer/refund/QR/payment exceptions even if a full admin dispute center is deferred.
- [ ] **DASH-05**: Bilingual labels and policy copy exist for reservation statuses, cancellation cutoff, no-show penalty, pickup confirmation, refund state, and transfer state.

### Verification

- [ ] **VER-01**: Automated tests cover money-unit calculations, 24h cancellation cutoff, 20% penalty calculation, status transition guards, idempotent webhook processing, QR token consumption, and producer ownership checks.
- [ ] **VER-02**: Manual verification covers the full reserve -> pay -> QR pickup -> producer transfer path and the early-cancel, late-cancel, and no-show branches.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Marketplace Expansion

- **V2-01**: Client can reserve products from multiple producers in one cart with split settlement.
- **V2-02**: Producers can configure custom cancellation/no-show policies within platform-approved limits.
- **V2-03**: Client can use saved payment methods for later no-show charging instead of charging the full order up front.
- **V2-04**: System supports shipping, delivery, or third-party carrier tracking.

### Operations

- **V2-05**: Admin has a full dispute-resolution console with evidence, mediation notes, and policy overrides.
- **V2-06**: Producers receive automated reminders, preparation workflows, exports, and analytics.
- **V2-07**: Native mobile camera app supports offline or high-volume market-day scanning.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Legal escrow positioning | v1 uses Stripe Connect delayed marketplace transfers, not regulated escrow custody. |
| Dual confirmation by producer and client | Producer QR scan is sufficient for v1 and keeps pickup fast. |
| Browser-owned order creation after payment | Payment finalization must be webhook/server-owned to avoid duplicate orders and forged return-route writes. |
| Immediate producer transfer at payment time | Producer funds should release only after QR pickup confirmation or policy settlement. |
| Full mediation/dispute center | v1 can flag admin review but not build complex operations tooling. |
| Multi-producer cart checkout | Adds split settlement complexity beyond the first focused reservation flow. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LEDG-01 | Phase 1 | Pending |
| LEDG-02 | Phase 1 | Pending |
| LEDG-03 | Phase 1 | Pending |
| LEDG-04 | Phase 1 | Pending |
| LEDG-05 | Phase 1 | Pending |
| PAY-01 | Phase 2 | Pending |
| PAY-02 | Phase 2 | Pending |
| PAY-03 | Phase 2 | Pending |
| PAY-04 | Phase 2 | Pending |
| PAY-05 | Phase 2 | Pending |
| PAY-06 | Phase 2 | Pending |
| QR-01 | Phase 3 | Pending |
| QR-02 | Phase 3 | Pending |
| QR-03 | Phase 3 | Pending |
| QR-04 | Phase 3 | Pending |
| QR-05 | Phase 3 | Pending |
| SETT-01 | Phase 4 | Pending |
| SETT-02 | Phase 4 | Pending |
| SETT-03 | Phase 4 | Pending |
| SETT-04 | Phase 4 | Pending |
| SETT-05 | Phase 4 | Pending |
| SETT-06 | Phase 4 | Pending |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |
| DASH-05 | Phase 5 | Pending |
| VER-01 | Phase 6 | Pending |
| VER-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-04-29*
*Last updated: 2026-04-29 after initialization*
