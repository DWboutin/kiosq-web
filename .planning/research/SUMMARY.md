# Project Research Summary

**Project:** Kiosq Reservation Pickup Payments
**Domain:** Brownfield local marketplace reservation, online payment, and in-person pickup confirmation
**Researched:** 2026-04-29
**Confidence:** HIGH

## Executive Summary

Kiosq is a bilingual local marketplace reservation product: customers reserve and pay online, then pick up in person while producers confirm handoff through the site. Expert implementations treat this as a financial state machine, not a UI checkout flow. The system needs an authoritative reservation ledger, explicit status transitions, webhook-owned payment finalization, single-use QR pickup credentials, and durable records for refunds, transfers, penalties, and admin-review exceptions.

The recommended payment architecture is Stripe Connect separate charges and transfers. Kiosq should create a platform PaymentIntent without `transfer_data.destination`, record the charge and producer payable amount internally, then create the producer Transfer only after QR pickup confirmation or a no-show/late-cancel settlement. Manual capture is not the default fit because pickup windows can exceed card authorization validity, and destination charges transfer funds too early.

The main risks are duplicate orders, incorrect money units, premature producer transfers, replayable QR tokens, UI-calculated cancellation policy, stale/private dashboard leaks, and insufficient tests. Mitigate them by building the ledger/status model first, using Postgres RPCs for multi-table transitions, verifying Stripe webhooks with raw-body signatures, enforcing idempotency at Stripe and database boundaries, storing QR token hashes only, calculating the 24h/20% policy server-side, and adding focused money/webhook/QR/policy tests before launch.

## Key Findings

### Recommended Stack

Keep the existing Next.js App Router, React, TypeScript, Supabase, Stripe, next-intl, TanStack Query, and shadcn/Radix stack. No separate payment service is needed for v1; the architectural change is to move payment and settlement truth into Supabase-backed domain RPCs plus Stripe webhooks.

**Core technologies:**
- Next.js App Router: route handlers and server actions — fits Stripe webhook endpoints, checkout orchestration, status reads, and dashboard pages.
- Supabase Postgres/Auth/RLS: transactional state and ownership — required for reservation ledger rows, status machines, idempotency constraints, and producer/client authorization.
- Stripe PaymentIntents and Connect separate charges/transfers: platform charge, delayed producer payout — matches the requirement to pay producers after pickup confirmation.
- Stripe Payment Element: PCI-safe customer payment UI — client confirms payment but never finalizes reservations or orders.
- TypeScript and Zod: typed boundaries — validation for money, status, checkout, policy, QR, and Stripe metadata.
- next-intl: bilingual policy and status copy — required for cancellation, no-show, receipt, dashboard, and error messaging.

**Recommended additions/upgrades:**
- Add `STRIPE_WEBHOOK_SECRET`.
- Add `@zxing/browser` for producer web QR scanning.
- Add `qrcode` and `@types/qrcode` for customer pickup QR rendering.
- Add Vitest for money/status/policy/token tests and Playwright after the backend workflow stabilizes.
- Consider a focused Stripe SDK/package refresh before major payment edits, then smoke-test build/runtime compatibility.

### Expected Features

**Must have (table stakes):**
- Single-producer reservation checkout with quantity, kiosq, pickup date/window, and visible 24h cancellation / 20% late-cancel or no-show policy acceptance.
- Server-created PaymentIntent with one internal reservation checkout session and reconciliation metadata.
- Webhook-owned finalization that atomically creates/updates reservation, order, item, payment, and QR state.
- Canonical reservation/payment/fulfillment/refund/transfer status model.
- Client receipt/dashboard with QR, pickup details, cancellation availability, refund/payment state, and history.
- Producer queue/dashboard with scan, manual lookup fallback, no-show/cancellation actions, payout state, and history.
- QR pickup confirmation that consumes a single-use token and triggers exactly one producer settlement/transfer path.
- Server-calculated early cancellation, late cancellation, and no-show policy outcomes.
- Activity history and bilingual status/policy/error labels.

**Should have (competitive):**
- "Paid now, producer paid after pickup" trust model, phrased as delayed marketplace payout rather than escrow.
- QR pickup confirmation directly tied to payout release.
- Automatic 24h/20% policy calculation with stored policy snapshots.
- Producer-first market-day queue and lightweight admin-review flags.

**Defer (v1.x / v2+):**
- Ready-for-pickup prep status, automated reminders, exports, analytics, and admin review UI until the core loop works.
- Multi-producer cart settlement, configurable producer policies, native scanner app, saved payment methods for later no-show charges, and full dispute/mediation tooling.

### Architecture Approach

Keep the app as a Next.js/Supabase monolith, but make Postgres RPCs the domain boundary for every multi-table financial transition. Server actions should orchestrate validation, Stripe calls, RPC calls, and revalidation; route handlers should own signed Stripe webhook ingestion and private read APIs; React UI should display state and submit user intent, not calculate money or final statuses.

**Major components:**
1. Reservation checkout UI — collects quantity, kiosq, pickup window, policy acceptance, and starts payment.
2. Payment Element UI — confirms the server-created PaymentIntent only; no reservation finalization.
3. Reservation server actions — create checkout, cancel, confirm pickup, mark no-show, and retry transfers through RPC-backed transitions.
4. Stripe webhook route — verifies signature, records event IDs, finalizes payment/refunds/disputes idempotently.
5. Reservation domain RPCs — own row locks, ledger writes, money calculations, status guards, token consumption, and idempotency.
6. QR token boundary — generates opaque one-time credentials after payment success and verifies producer ownership at scan.
7. Dashboard DTO/read layer — returns private, paginated, owner-filtered active and history views without raw JSON.

### Critical Pitfalls

1. **Browser/return-route payment finalization** — avoid by making signed Stripe webhooks the only payment finalizer and converting `/api/payment-success` to display-only status.
2. **Producer transfer at payment time** — avoid by removing `transfer_data.destination` and `application_fee_amount` from v1 reservation PaymentIntents; create Connect Transfers only after pickup or policy settlement.
3. **Money unit drift and policy rounding errors** — avoid by storing all authoritative amounts in integer minor units with currency and centralizing fee/refund/20% policy math.
4. **Non-idempotent Stripe and database mutations** — avoid with deterministic operation IDs, Stripe idempotency keys, unique database constraints, and transaction-backed RPCs.
5. **Reusable or weak QR pickup credentials** — avoid by using high-entropy opaque tokens, hashing at rest, requiring authenticated producer ownership, expiring tokens, and atomically consuming once.
6. **Refunds disconnected from transfers** — avoid by recording settlement rows before Stripe side effects and handling reversals/admin review when refunds occur after producer transfer.
7. **Dashboard and logging exposure** — avoid raw reservation JSON, long-lived private caches, broad current-user queries, client-secret logs, raw token logs, and full metadata logs.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Reservation Ledger and Status Model

**Rationale:** Every later feature depends on correct money units, status boundaries, immutable checkout snapshots, and idempotency constraints.
**Delivers:** Minor-unit money model, reservation/payment/settlement/refund/transfer/ledger tables, pickup window columns, policy snapshot fields, unique constraints, indexes, status enums, and core RPC skeletons.
**Addresses:** Paid-reserved status model, producer delayed payout ledger, policy snapshot, activity history foundation.
**Avoids:** Money drift, status model drift, Stripe metadata as source of truth, non-idempotent database writes, sensitive legacy logs.

### Phase 2: Checkout and Webhook-Owned Payment Finalization

**Rationale:** Payment must be safe before QR, dashboards, cancellations, or transfers are built on top of it.
**Delivers:** `create-reservation-checkout` flow, platform PaymentIntent with `transfer_group`, Stripe webhook route, `stripe_events` idempotency, display-only payment return/status page, removal of client-side order creation.
**Uses:** Stripe PaymentIntents, Payment Element, Supabase RPCs, raw-body webhook verification.
**Implements:** Server-owned paid/reserved transition and QR-token creation after `payment_intent.succeeded`.
**Avoids:** Duplicate orders, forged/refresh-triggered success-route writes, async payment gaps, early producer transfer.

### Phase 3: QR Pickup Confirmation

**Rationale:** Pickup confirmation is the business event that proves handoff and unlocks later producer settlement.
**Delivers:** Customer QR receipt, opaque token generation/hash storage, producer scanner, manual lookup fallback, ownership checks, token expiry/revocation, atomic consume-and-confirm RPC.
**Addresses:** Client pickup credential, producer web scanner, pickup confirmation as fulfillment completion.
**Avoids:** QR replay, wrong-producer confirmation, raw reservation IDs in QR payloads, duplicate transfer triggers.

### Phase 4: Delayed Transfers, Refunds, Cancellation, and No-Show Settlement

**Rationale:** Money movement after pickup, early cancellation, late cancellation, and no-show all share the same ledger and settlement machinery.
**Delivers:** Server-side policy quote/action, 24h cutoff, 20% late-cancel/no-show calculation, refund records, transfer records, Stripe Transfer creation with `source_transaction`, retry/admin-review states, transfer reversal handling where needed.
**Addresses:** Cancellation before cutoff, late cancellation/no-show, producer compensation, delayed payout, refund and transfer history.
**Avoids:** UI policy math, refund-without-transfer-reconciliation, Connect balance/transfer failure blind spots, duplicate transfers/refunds.

### Phase 5: Dashboards, History, and Operations

**Rationale:** Dashboards should consume settled domain state after the core payment/pickup/policy flow exists, not define the state model.
**Delivers:** Client active/history views, producer queue/history views, status filters, transaction/payout state, cancellation/no-show actions, admin-review flags, private no-store/paginated read APIs, safe activity history.
**Addresses:** Client dashboard scope, producer dashboard scope, dashboard history, manual pickup fallback visibility.
**Avoids:** Raw JSON dashboards, stale private cache, broad authorization queries, confusing generic statuses.

### Phase 6: Test and Release Hardening

**Rationale:** Payment, QR, and policy flows need regression coverage before production rollout because single manual success tests miss retries, races, and edge cases.
**Delivers:** Vitest coverage for money/status/policy/token helpers, route/action tests for webhooks and QR confirmation, Supabase/RPC integration tests, Stripe CLI scenarios, Playwright smoke tests, release runbook, and monitoring/reconciliation checklist.
**Addresses:** Security, idempotency, and testing risk across the full milestone.
**Avoids:** Shipping with untested duplicate webhook, duplicate QR scan, early cancel, late cancel, no-show, failed transfer, failed reversal, or authorization edge cases.

### Phase Ordering Rationale

- Build ledger/status foundations first because payment, QR, cancellation, no-show, refunds, transfers, and dashboards all depend on shared money and lifecycle invariants.
- Move payment finalization to webhooks before any feature trusts a reservation as paid.
- Build QR pickup before transfers because pickup confirmation is the payout trigger.
- Build transfers/refunds/policy together because the 24h/20% rule affects producer compensation and customer refund amounts.
- Build dashboards after the domain model stabilizes so UI reflects authoritative state instead of inventing its own lifecycle.
- Add tests throughout, then reserve a final hardening phase for cross-flow verification, Stripe CLI scenarios, and release operations.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Browser QR scanning needs target-device validation, especially camera permissions and scan reliability on iOS Safari and Android Chrome.
- **Phase 4:** Stripe Connect refunds, transfer reversals, balance availability, payout schedule, and liability behavior deserve phase-level research and release checklist validation.
- **Phase 6:** Test tooling choices and Stripe CLI automation should be planned against the repo's existing scripts and CI expectations.

Phases with standard patterns or enough existing research:
- **Phase 1:** Schema/RPC/idempotency patterns are well documented in the architecture and pitfalls research; planning can focus on exact migration shape.
- **Phase 2:** Stripe webhook and platform PaymentIntent patterns are well documented, but implementation must still verify current SDK behavior.
- **Phase 5:** Dashboard/history UI can follow existing Next.js, React Query, factory, pagination, and owner-filtered read patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing repo stack is documented; Stripe/Supabase/Next patterns were checked against official sources. Package upgrade versions are MEDIUM until installed and smoke-tested. |
| Features | HIGH | Core pickup/payment/cancellation/dashboard expectations align across project requirements, marketplace patterns, and competitor references. Exact policy business impact is MEDIUM until operational/legal validation. |
| Architecture | HIGH | The monolith + RPC + webhook + ledger approach fits the current codebase and payment constraints. No-show producer compensation split remains MEDIUM because the business rule needs exact allocation. |
| Pitfalls | HIGH | Risks are grounded in current codebase concerns and official Stripe/Supabase behavior: duplicate writes, money units, Connect liability, idempotency, QR security, dashboard privacy, and missing tests. |

**Overall confidence:** HIGH

### Gaps to Address

- **No-show/late-cancel allocation:** Decide whether the 20% retained amount goes fully to the producer, partly to Kiosq, or follows a fee split. Store this explicitly in the settlement ledger.
- **One-producer constraint:** Confirm v1 preserves one producer per reservation; multi-producer settlement should stay out of scope unless requirements change.
- **Pickup timing details:** Define pickup window start/end, timezone source, grace period, token expiry, and when no-show can be marked.
- **Admin-review scope:** Define the minimum v1 surface for failed transfers, disputes, failed reversals, malformed webhooks, and manual support actions.
- **Testing/CI baseline:** Add a test runner and decide which tests run in CI before release.
- **Legal/product copy:** Avoid escrow language and validate bilingual policy copy before exposing penalties to customers.

## Sources

### Primary (HIGH confidence)

- `.planning/PROJECT.md` — product scope, requirements, payment architecture decision, cancellation/no-show policy, constraints.
- `.planning/research/STACK.md` — recommended technologies, Stripe Connect separate charges/transfers rationale, package additions, environment additions.
- `.planning/research/FEATURES.md` — table-stakes features, differentiators, anti-features, MVP and deferred scope.
- `.planning/research/ARCHITECTURE.md` — domain boundaries, data model, status model, component responsibilities, build order.
- `.planning/research/PITFALLS.md` — critical risks, phase mapping, verification matrix, recovery strategies.
- Stripe docs — PaymentIntents, webhooks/signature verification, Connect separate charges and transfers, refunds, transfer reversals, idempotent requests, Connect balances/risk.
- Supabase docs — database functions, RLS, service-role behavior.
- Next.js docs — App Router route handlers and webhook handling.

### Secondary (MEDIUM confidence)

- Shopify, Square, Tock, Acuity, and Ticket Tailor documentation — pickup, QR validation, cancellation/refund, no-show, and activity-history product patterns.
- npm registry checks from 2026-04-29 — package version recommendations pending install/build validation.

### Tertiary (LOW confidence)

- Legal/tax/merchant-of-record implications — not fully researched; validate before changing `on_behalf_of`, statement descriptors, or policy language.

---
*Research completed: 2026-04-29*
*Ready for roadmap: yes*
