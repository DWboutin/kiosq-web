# Phase 1: Reservation Ledger and Status Model - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 01-reservation-ledger-and-status-model
**Areas discussed:** Compensation 20%, 24h cutoff, visible statuses, activity history

---

## Compensation 20%

| Option | Description | Selected |
|--------|-------------|----------|
| 100% to producer | The 20% is producer compensation; Kiosq keeps nothing from the penalty. | |
| Producer minus Kiosq fee | The 20% is the compensation base; Kiosq keeps its normal commission before producer payout. | ✓ |
| Fixed producer/Kiosq split | Example: 15% producer, 5% Kiosq. More explicit but creates a stronger business rule. | |
| Other | User-defined exact rule. | |

**User's choice:** Producer minus Kiosq fee.
**Notes:** The ledger must store retained amount, platform fee, producer compensation, refund amount, and currency.

### Early Cancellation Refund

| Option | Description | Selected |
|--------|-------------|----------|
| Full client refund | Client receives 100% back; Kiosq absorbs or separately accounts for fees. | ✓ |
| Refund minus non-recoverable fees | Client receives amount minus real Stripe/platform costs. | |
| the agent decides | Planner chooses simplest coherent Stripe/Kiosq behavior. | |

**User's choice:** Full client refund.
**Notes:** This keeps v1 customer-friendly and simple to explain.

### Platform Fee Rate

| Option | Description | Selected |
|--------|-------------|----------|
| 5% platform fee | Reuse the existing fee assumption in payment code. | ✓ |
| Configurable later | Store a snapshot rate but do not lock the final percentage in Phase 1. | |
| Other fixed rate | User supplies a percentage. | |

**User's choice:** 5% platform fee.
**Notes:** Store the rate as a snapshot so later rate changes do not affect existing reservations.

---

## 24h Cutoff

| Option | Description | Selected |
|--------|-------------|----------|
| 24h before exact pickup time | Example: pickup Wednesday 15:00, free cancellation until Tuesday 15:00. | ✓ |
| Midnight at start of pickup day | Simpler but stricter for clients. | |
| End of previous day | More permissive for clients. | |
| Other | User-defined cutoff rule. | |

**User's choice:** 24 hours before exact pickup time.
**Notes:** Cutoff must be stored as an authoritative timestamp.

### Pickup Window Basis

| Option | Description | Selected |
|--------|-------------|----------|
| Start of pickup window | Pickup 14:00-17:00 means cutoff is previous day at 14:00. | ✓ |
| End of pickup window | Pickup 14:00-17:00 means cutoff is previous day at 17:00. | |
| Exact pickup only | No pickup windows in v1. | |
| the agent decides | Planner chooses based on existing schedule model. | |

**User's choice:** Start of pickup window.
**Notes:** Store `pickup_window_start`; optional `pickup_window_end` can exist for display and later policy work.

### Post-Payment Schedule Changes

| Option | Description | Selected |
|--------|-------------|----------|
| Original snapshot remains authoritative | Accepted cutoff at payment time does not change. | ✓ |
| Recalculate only if client-favorable | Can extend but never shorten cancellation eligibility. | |
| Recalculate every change | Flexible but confusing. | |
| Out of scope v1 | Store snapshot, handle changes later. | |

**User's choice:** Original snapshot remains authoritative.
**Notes:** The accepted policy snapshot is the source of truth for Phase 1.

---

## Visible Statuses

| Option | Description | Selected |
|--------|-------------|----------|
| Simple UI statuses | Client/producer see plain reservation labels; financial detail stays internal. | ✓ |
| Detailed UI statuses | Expose low-level financial states broadly. | |
| Hybrid UI | Simple default statuses plus transaction details panel. | |
| the agent decides | Planner chooses. | |

**User's choice:** Simple UI statuses.
**Notes:** Internal model can be detailed while user-facing labels stay simple.

### Internal Status Axes

| Option | Description | Selected |
|--------|-------------|----------|
| Separate statuses by domain | Reservation, payment, settlement, transfer, and refund statuses all separate. | |
| One global status | One large status string for every state. | |
| Hybrid minimal | Primary reservation status plus dedicated payment/settlement/refund/transfer records. | ✓ |

**User's choice:** Hybrid minimal.
**Notes:** Use one readable reservation lifecycle status and separate financial state records.

### Primary v1 Reservation Statuses

| Option | Description | Selected |
|--------|-------------|----------|
| Use compact proposed list | `payment_pending`, `payment_processing`, `reserved`, `pickup_confirmed`, `cancelled`, `late_cancelled`, `no_show`, `expired`, `admin_review`. | ✓ |
| Add `pickup_ready` | Useful if producer marks an order ready before scan. | |
| Add `disputed` | Distinguish disputes from generic admin review. | |
| Modify list | User supplies additions/removals. | |

**User's choice:** Use compact proposed list.
**Notes:** `pickup_ready` and `disputed` are deferred unless later phases need them.

---

## Activity History

| Option | Description | Selected |
|--------|-------------|----------|
| Important events only | User timelines show payment, reservation, QR, pickup, cancellation, no-show, refund/transfer events. | |
| Complete history visible | Expose retries, Stripe errors, idempotency keys, and admin events. | |
| Two levels | Client/producer see important events; Kiosq/admin sees complete audit. | ✓ |

**User's choice:** Two levels.
**Notes:** Keeps user experience clean while preserving support/admin traceability.

### Amounts in Visible History

| Option | Description | Selected |
|--------|-------------|----------|
| Role-relevant amounts | Client sees paid/refunded/retained; producer sees compensation/transfer. | ✓ |
| Statuses only | Simpler but less clear around penalties/refunds. | |
| Transaction detail only | Timeline without amounts, details panel with amounts. | |

**User's choice:** Role-relevant amounts.
**Notes:** Amount visibility should be role-aware and not expose unnecessary platform split details.

### Full Audit Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Kiosq admin only | Client/producer see important history; complete audit reserved for support/admin. | ✓ |
| Producer too | Producer sees more technical/financial detail. | |
| No UI in v1 | Store audit but access only through DB/logs. | |

**User's choice:** Kiosq admin only.
**Notes:** Full audit should be available to admin/support without overexposing technical internals.

---

## the agent's Discretion

- Exact database table names, enum/check constraint names, RPC names, indexes, and backfill mechanics.
- Exact policy snapshot JSON/column layout, as long as accepted cutoff and amounts remain immutable.
- Exact placement of TypeScript helper files for money/status/idempotency types.

## Deferred Ideas

- QR pickup scan/token behavior is Phase 3.
- PaymentIntent/webhook replacement is Phase 2.
- Transfers/refunds/no-show execution is Phase 4.
- Dashboard timeline UI is Phase 5.
