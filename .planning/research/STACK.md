# Stack Research

**Domain:** Kiosq reservation pickup payments
**Researched:** 2026-04-29
**Confidence:** HIGH for Stripe integration architecture, HIGH for existing repo stack, MEDIUM for proposed package upgrades until installed and smoke-tested

## Scope

This is brownfield stack research for the reservation pickup payment milestone only. It does not re-research the full marketplace. The recommendation assumes the existing Next.js/Supabase/Stripe marketplace remains the base stack and focuses on what must change for:

- Online reservation payment with recorded PaymentIntent
- Stripe Connect delayed producer transfer after QR pickup confirmation
- Producer web QR scan at pickup
- 24-hour cancellation cutoff and 20% late-cancel/no-show policy
- Idempotent webhook-owned payment finalization

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js App Router | Installed 15.2.4 | Server actions, route handlers, localized reservation/payment pages, Stripe webhook endpoint, pickup scan route | Already the app framework. Route handlers fit Stripe webhook and pickup confirmation endpoints; server actions can remain thin validation/orchestration wrappers. |
| React | Installed 19.1.0 per codebase map | Payment UI, reservation flow, producer QR scanner dashboard | Already present. Current `@stripe/react-stripe-js@6.3.0` peer range supports React `<20`, so React 19 remains compatible if Stripe UI packages are upgraded. |
| Supabase Auth/Postgres/RLS | `@supabase/supabase-js` 2.49.4, `@supabase/ssr` 0.6.1, local Postgres 15 | Reservation/order/payment ledger, webhook event idempotency, QR token storage, ownership checks | The domain needs transactional state, status transitions, row ownership, and an internal ledger more than a new service. Use Postgres RPC functions for multi-table state transitions. |
| Stripe PaymentIntents on the platform account | Installed `stripe` 18.3.0; npm current checked as 22.1.0 | Charge the client online and record a single platform PaymentIntent/Charge | Kiosq must charge on the platform and delay producer payout. Create the PaymentIntent on the platform without `transfer_data[destination]`; record IDs in Supabase. |
| Stripe Connect separate charges and transfers | Stripe API, no extra npm package | Transfer producer share only after pickup confirmation | This is the right exception to Stripe's general "destination charges for most marketplaces" guidance because destination charges transfer immediately after capture, while Kiosq needs post-pickup payout. |
| Stripe Payment Element / Stripe.js | Installed `@stripe/react-stripe-js` 3.7.0 and `@stripe/stripe-js` 7.5.0; npm current checked as 6.3.0 and 9.3.1 | PCI-safe card collection and SCA handling | Keep Stripe-hosted Elements for payment method entry. The client only confirms payment; it must not create orders or finalize fulfillment. |
| next-intl | Installed 4.0.2 | Bilingual payment, cancellation, pickup, dashboard messages | Already integrated with locale routing. Use it for customer/producer status copy and policy text. |
| TypeScript + Zod | TypeScript 5.8.3, Zod 3.24.2 | Money/status/token validation across route handlers and server actions | Payment data needs typed boundaries and explicit validation. Keep calculations server-owned and validate every mutation request. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `stripe` | Prefer upgrade to `^22.1.0`; installed `^18.3.0` | Server SDK for PaymentIntents, webhooks, refunds, transfers, transfer reversals | Upgrade in a focused Stripe-hardening phase before large payment edits if build/test time allows. Existing 18.3.0 can likely support the needed APIs, but it is behind npm current. |
| `@stripe/react-stripe-js` | Prefer upgrade to `^6.3.0`; installed `^3.7.0` | React Elements provider and Payment Element | Upgrade together with `@stripe/stripe-js`; peer deps require `@stripe/stripe-js >=9.3.1 <10` and React `<20`. |
| `@stripe/stripe-js` | Prefer upgrade to `^9.3.1`; installed `^7.5.0` | Browser Stripe.js loader | Use through `loadStripe` outside render, as existing provider already does. |
| `@zxing/browser` | `^0.2.0` | Producer camera QR scanning in the web dashboard | New dependency for QR scan. Use only in client components behind browser permission checks. |
| `qrcode` + `@types/qrcode` | `qrcode ^1.5.4`, `@types/qrcode ^1.5.6` | Render pickup QR codes as PNG/SVG/data URL | New dependency for client-facing QR generation. The QR payload should be an opaque pickup token or signed URL, not raw order/payment data. |
| Node `crypto` | Built-in | Idempotency IDs, QR token entropy, token hashes/HMACs | Prefer built-in `crypto.randomUUID`, `randomBytes`, and HMAC/hash helpers over adding a token package. |
| TanStack Query | Installed 5.72.2 | Dashboard polling/invalidation for reservation/payment status | Use for status display only. Do not treat React Query cache state as payment truth. |
| shadcn/Radix/Lucide | Existing | Payment dialogs, pickup scanner UI, dashboard controls | Keep existing UI stack; no new component system is needed. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Stripe CLI | Local webhook forwarding and test events | Required for payment phases. Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` and targeted triggers. |
| Stripe Workbench/Dashboard | Event deliveries, webhook endpoint setup, Connect account checks, refunds/transfers visibility | Configure only required events. Watch duplicate/retry behavior during testing. |
| Supabase CLI | Migration reset, generated types, RLS validation | Already present as `supabase` 2.20.12. Use migrations for ledger/status/token tables and regenerate `types/supabase.ts`. |
| Vitest | npm current checked as 4.1.5 | Unit tests for money math, cancellation policy, state-machine guards, token validation | New dev dependency recommended because payment calculations need deterministic tests. |
| Playwright | npm current checked as 1.59.1 | Browser smoke tests for reserve/pay/pickup dashboard flows | New dev dependency recommended after backend workflow stabilizes. Stripe checkout itself should be mocked/test-mode driven. |

## Stripe Integration Approach

Use platform PaymentIntents plus Connect separate charges and transfers. Do not create a destination charge at payment time.

Recommended flow:

1. Server validates reservation request and creates or reuses an internal reservation/order draft in Supabase.
   - Use a Postgres RPC for atomic writes across reservations, orders, order items, payment ledger fields, and policy amounts.
   - Store all amounts in minor units: `total_amount_minor`, `platform_fee_amount_minor`, `producer_transfer_amount_minor`, `late_cancel_penalty_amount_minor`, `refund_amount_minor`.
   - Store currency in lowercase ISO form, the producer connected account ID, and a deterministic `transfer_group` such as `reservation_{reservation_id}`.

2. Server creates a platform PaymentIntent.
   - Use the platform secret key.
   - Do not pass `transfer_data[destination]`.
   - Do not pass `application_fee_amount`; the platform keeps its margin by transferring only the producer payable amount later.
   - Use an idempotency key like `reservation-payment-intent:{reservation_id}:{cart_hash}`.
   - Metadata should include only non-sensitive IDs: `reservation_id`, `order_id`, `customer_id`, `vendor_profile_id`, `kiosq_id`, `policy_version`, `transfer_group`.
   - Return only the `client_secret` to the authenticated customer.

3. Client confirms with Payment Element.
   - The client may show immediate status, but it must not create reservations, orders, transfers, or refunds.
   - Remove the current client-side `createReservation` after `stripe.confirmPayment`.
   - Treat `/api/payment-success` as display/status only or remove it; it must not be the source of fulfillment truth.

4. Stripe webhook finalizes payment state.
   - Add `app/api/stripe/webhook/route.ts`.
   - Verify `Stripe-Signature` using the raw request body and `STRIPE_WEBHOOK_SECRET`.
   - Store processed Stripe event IDs and make handlers idempotent.
   - Handle at least `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.processing`, `refund.created`, `refund.updated`, `refund.failed`, and dispute/review events needed for admin review.
   - On `payment_intent.succeeded`, retrieve/store `latest_charge`, set reservation/order to paid/reserved, and create the pickup QR token.

5. Producer QR scan confirms pickup and triggers transfer.
   - QR payload should be an opaque, high-entropy token or signed URL.
   - Store only token hashes server-side, with `expires_at`, `used_at`, reservation ID, and producer ownership checks.
   - On scan, the server verifies token, producer ownership, reservation status, pickup timing, and one-time use.
   - Use a claim-then-call-then-record pattern: atomically mark the reservation as transfer-pending, call `stripe.transfers.create`, then record the transfer result.
   - Create the transfer with `destination`, `amount`, `currency`, `source_transaction` set to the PaymentIntent's latest charge, and idempotency key `reservation-transfer:{reservation_id}`.

6. Cancellation/no-show policy uses refunds plus delayed transfers.
   - More than 24 hours before pickup: refund 100% if paid and no producer transfer has occurred.
   - Within 24 hours or no-show: client owes 20%; refund 80% or the policy-computed amount, then transfer the producer compensation amount according to the ledger.
   - Because producer transfer is delayed until pickup/no-show resolution, most customer refunds happen before any transfer reversal is needed.
   - If a refund or dispute happens after a transfer, use transfer reversals and mark the order for admin review.

## Why Separate Charges and Transfers

Stripe's Connect charge overview says destination charges are recommended for many marketplaces and separate charges/transfers should be used only when other charge types do not meet the business need. Kiosq has that business need: the producer must not receive the payout until QR pickup confirmation or a no-show/late-cancel policy decision.

Specific rationale:

- Destination charges move funds to the connected account's pending balance immediately after the charge is captured. That conflicts with "pay producer after pickup scan."
- Manual capture is not the default fit. Current Stripe docs show online card authorization windows are usually 5-7 days depending on card brand/transaction type, and expired authorizations are released/canceled. Pickup windows can exceed that, and extended authorization has card-network, merchant-category, pricing, and compliance constraints.
- Direct charges put PaymentIntents and Charges on the connected account and limit platform-level visibility. Kiosq needs platform-owned reconciliation, refunds, cancellation policy handling, and QR-controlled payout.
- Separate charges/transfers let Kiosq charge up front, keep an internal ledger, decide refund/penalty outcomes, and create the producer transfer only after pickup/no-show resolution.

## Installation

The app already has the core framework, Supabase, Stripe, React Query, Zod, next-intl, and UI dependencies. Recommended additions/upgrades for the payment milestone:

```bash
# Stripe package refresh, in a focused phase with build verification
npm install stripe@^22.1.0 @stripe/react-stripe-js@^6.3.0 @stripe/stripe-js@^9.3.1

# QR pickup support
npm install @zxing/browser@^0.2.0 qrcode@^1.5.4
npm install -D @types/qrcode@^1.5.6

# Payment-critical tests
npm install -D vitest@^4.1.5 @playwright/test@^1.59.1
```

Required environment additions:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Keep existing Stripe/Supabase env vars:

```bash
STRIPE_SECRET_API_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY=pk_...
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SERVICE_ROLE=...
NEXT_PUBLIC_BASE_URL=...
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Platform PaymentIntent + separate transfer after pickup | Destination charge with `transfer_data[destination]` | Use only if the producer should receive pending balance immediately after payment capture. That is not Kiosq v1. |
| Capture immediately, transfer later | Manual capture | Use only if every pickup is reliably within the authorization window and the product optimizes for cancel-before-capture costs over guaranteed longer reservations. |
| Card-only Payment Element for v1 | Broad automatic payment methods | Use automatic payment methods later after webhook handling fully supports delayed notification methods and clear customer messaging. |
| Supabase RPC-backed ledger transitions | Multi-step Supabase client inserts/updates | Multi-step JS writes are acceptable only for non-critical single-table mutations. Payment/order transitions need transactions. |
| Web dashboard QR scanning with `@zxing/browser` | Native mobile scanner | Use native only if Kiosq later builds a mobile producer app. V1 is explicitly web/site based. |
| No queue service for MVP | Dedicated queue/background worker | Add a queue if webhook volume, retries, or transfer processing exceed route-handler reliability. Start with DB idempotency and retryable admin tooling. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `transfer_data[destination]` on reservation PaymentIntents | It creates a destination charge and transfers funds immediately after capture. | Platform PaymentIntent with later `stripe.transfers.create`. |
| `application_fee_amount` for v1 reservation payments | It is tied to destination/direct charge fee accounting and does not model delayed producer payout. | Store platform fee and producer payable amounts in Kiosq's ledger; transfer net producer amount later. |
| Client-side order/reservation creation after `stripe.confirmPayment` | Client callbacks can be skipped, repeated, or forged into inconsistent app state. | Signed Stripe webhook plus idempotent database finalization. |
| Public GET `/api/payment-success` as fulfillment authority | It is not a signed webhook and is currently a duplicate order risk. | Display-only return page plus webhook-owned state transition. |
| Manual capture as the main delayed-payout mechanism | Authorization expiry makes it unreliable for pickup windows beyond a few days; extended auth is constrained. | Charge now, hold only internally, transfer later. |
| Direct charges on connected accounts | Platform visibility and reconciliation are weaker; refunds/disputes differ and PaymentIntents live on connected accounts. | Platform charges with separate transfers. |
| Raw payment/QR details in logs or QR payloads | Client secrets, metadata, and pickup tokens are sensitive operational credentials. | Redacted logs, opaque QR tokens, hashed server-side token storage. |
| Broad delayed payment methods before state machine support | Bank debits/redirect methods can stay `processing` and succeed/fail later. | Start with card-only or explicitly non-delayed payment methods. |
| Legal "escrow" positioning | This stack implements delayed marketplace transfers, not a regulated escrow service. | Product/legal copy should describe reservations, cancellation policy, and payout timing. |

## Stack Patterns by Variant

**If v1 remains one producer per reservation:**
- Use one PaymentIntent, one reservation/order, and at most one producer transfer.
- Keep the single-producer constraint explicit in validation and database constraints.

**If multi-producer carts are added later:**
- Keep the platform PaymentIntent.
- Add one ledger row and transfer row per producer.
- Use the same `transfer_group` and multiple `stripe.transfers.create` calls after each producer-specific pickup confirmation.

**If Kiosq wants card/wallet only in v1:**
- Keep `payment_method_types: ["card"]` or configure automatic payment methods narrowly.
- This reduces delayed-notification edge cases while the reservation state machine is stabilized.

**If Kiosq wants broader payment methods later:**
- Use `automatic_payment_methods` with explicit payment-method policy and customer messaging.
- Support `payment_intent.processing` as a first-class reservation state and do not confirm inventory/pickup readiness until success.

**If producers become the settlement merchant/business of record:**
- Revisit `on_behalf_of`, statement descriptors, tax/legal copy, and regional Connect constraints.
- Do not add `on_behalf_of` casually; Stripe documents that it changes statement descriptor, settlement currency, visible merchant information, and related behavior.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.2.4` | Node `^18.18.0 || ^19.8.0 || >=20.0.0` | Existing package-lock/codebase finding. Keep production Node on 20+ if possible. |
| `stripe@22.1.0` | Node `>=18`, `@types/node >=18` | npm current checked 2026-04-29. Existing `stripe@18.3.0` is behind current but likely supports required APIs. |
| `@stripe/react-stripe-js@6.3.0` | React `>=16.8.0 <20`, React DOM `>=16.8.0 <20`, `@stripe/stripe-js >=9.3.1 <10` | Compatible with existing React 19; upgrade Stripe UI packages together. |
| `@stripe/stripe-js@9.3.1` | Node engine `>=12.16` for package tooling | Browser runtime library; use via `loadStripe`. |
| `@zxing/browser@0.2.0` | `@zxing/library ^0.22.0` | Browser camera scanner. Test on iOS Safari/Android Chrome during UI phase. |
| `qrcode@1.5.4` | `@types/qrcode@1.5.6` | Use with explicit dev types because `qrcode` did not report bundled types via npm view. |

## Data/Service Additions

No new hosted service is required for v1. Add database-backed payment infrastructure:

| Addition | Purpose | Notes |
|----------|---------|-------|
| `stripe_events` table | Webhook idempotency and audit trail | Primary key on Stripe event ID; store type, object ID, processed timestamp, and error state. |
| Reservation/order ledger columns or `reservation_payment_ledger` table | Minor-unit money tracking and policy outcomes | Include total, currency, platform fee, producer payable, penalty, refund, PaymentIntent, charge, transfer, refund IDs. |
| Transfer attempts table | Retryable producer payout tracking | Store `reservation_id`, idempotency key, Stripe transfer ID, status, last error. |
| Pickup token table | QR token lifecycle | Store token hash, reservation ID, expires_at, used_at, created_at; never store raw token if avoidable. |
| Status enums/check constraints | Payment/reservation/order state machine | Existing status constraints are too narrow for paid/reserved/pickup/transfer/refund/admin-review states. |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Existing app stack | HIGH | Verified from required codebase docs and `package.json`. |
| Separate charges/transfers recommendation | HIGH | Verified against current Stripe Connect charge docs, separate charges/transfers docs, destination charge behavior, transfer availability, and refund behavior. |
| Manual capture rejection for default flow | HIGH | Verified against current Stripe authorization-window and extended-authorization docs. |
| Webhook/idempotency requirement | HIGH | Verified against Stripe PaymentIntent status and webhook docs; existing repo concerns confirm the current return-route/client-finalization risk. |
| Package upgrade versions | MEDIUM | Current npm registry versions checked on 2026-04-29, but not installed or tested in this repo. |
| QR library choice | MEDIUM | npm registry checked; browser/device behavior still needs phase-specific testing. |
| Legal/tax/merchant-of-record implications | LOW | Not researched here. Requires product/legal decision before changing `on_behalf_of`, statement descriptors, or escrow-like copy. |

## Sources

- `.planning/PROJECT.md` - milestone scope, reservation/payment/pickup requirements. HIGH.
- `.planning/codebase/STACK.md` - existing Next.js/Supabase/Stripe stack and installed versions. HIGH.
- `.planning/codebase/INTEGRATIONS.md` - current Stripe Connect OAuth, PaymentIntent, and missing webhook state. HIGH.
- `.planning/codebase/CONCERNS.md` - current duplicate order, amount-unit, webhook, and sensitive logging risks. HIGH.
- Stripe PaymentIntents overview: https://docs.stripe.com/payments/payment-intents - PaymentIntent lifecycle, client secret handling, metadata, and webhook guidance. HIGH.
- Stripe PaymentIntent create API: https://docs.stripe.com/api/payment_intents/create - minor-unit amounts, `automatic_payment_methods`, `allow_redirects`, `capture_method`, and metadata parameters. HIGH.
- Stripe Payment status/webhooks: https://docs.stripe.com/payments/payment-intents/verifying-status - webhook-owned fulfillment and relevant PaymentIntent events. HIGH.
- Stripe manual capture/hold docs: https://docs.stripe.com/payments/place-a-hold-on-a-payment-method - authorization windows, expiry behavior, and capture-later constraints. HIGH.
- Stripe extended authorization docs: https://docs.stripe.com/payments/extended-authorization - extended hold limits, card/network restrictions, and `capture_before` guidance. HIGH.
- Stripe Connect charge types: https://docs.stripe.com/connect/charges - direct, destination, and separate charge/transfer tradeoffs; refund/dispute responsibility. HIGH.
- Stripe separate charges and transfers: https://docs.stripe.com/connect/separate-charges-and-transfers - delayed transfer model, `source_transaction`, transfer availability, refunds, and reversals. HIGH.
- Stripe destination charges: https://docs.stripe.com/connect/destination-charges - immediate connected-account transfer behavior and application fee behavior. HIGH.
- Stripe refunds: https://docs.stripe.com/refunds and https://docs.stripe.com/api/refunds/create - partial refunds, Connect refund debit behavior, and `reverse_transfer`. HIGH.
- Stripe webhooks: https://docs.stripe.com/webhooks and https://docs.stripe.com/webhooks/signature - signature verification, raw body requirement, duplicate event handling, retries, event ordering. HIGH.
- Stripe Connect OAuth reference: https://docs.stripe.com/connect/oauth-reference - existing Standard account OAuth behavior and non-idempotent token exchange. HIGH.
- npm registry checks via `npm view` on 2026-04-29 for `stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, `@zxing/browser`, `qrcode`, `@types/qrcode`, `vitest`, and `@playwright/test`. MEDIUM until repo install/build verification.

---
*Stack research for: Kiosq reservation pickup payments*
*Researched: 2026-04-29*
